"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { checkoutLimiter } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";

export type CheckoutResult = {
  success: boolean;
  orderIds?: string[];
  error?: string;
};

export async function checkoutAction(
  _prev: CheckoutResult,
  formData: FormData,
): Promise<CheckoutResult> {
  const session = await requireAuth();

  if (!checkoutLimiter.check(session.user.id)) {
    return { success: false, error: "Terlalu banyak checkout. Coba lagi nanti." };
  }

  const deliveryMethod = formData.get("deliveryMethod") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const notes = (formData.get("notes") as string) || null;

  if (!deliveryMethod || !paymentMethod) {
    return { success: false, error: "Metode pengiriman dan pembayaran wajib dipilih" };
  }

  if (!["PICKUP_COD", "MANUAL_DELIVERY"].includes(deliveryMethod)) {
    return { success: false, error: "Metode pengiriman tidak valid" };
  }

  if (!["MANUAL_TRANSFER", "COD"].includes(paymentMethod)) {
    return { success: false, error: "Metode pembayaran tidak valid" };
  }

  // Get all cart items for this user
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: { id: true, storeId: true, stock: true, price: true, status: true },
      },
    },
  });

  if (cartItems.length === 0) {
    return { success: false, error: "Keranjang kosong" };
  }

  // Validate all items: stock available and product active
  for (const item of cartItems) {
    if (item.product.status !== "ACTIVE") {
      return { success: false, error: `Produk tidak lagi tersedia` };
    }
    if (item.quantity > item.product.stock) {
      return { success: false, error: `Stok tidak mencukupi` };
    }
  }

  // Group items by store
  const storeGroups = new Map<string, typeof cartItems>();
  for (const item of cartItems) {
    const storeId = item.product.storeId;
    if (!storeGroups.has(storeId)) {
      storeGroups.set(storeId, []);
    }
    storeGroups.get(storeId)!.push(item);
  }

  const orderIds: string[] = [];

  try {
    // Atomic: create all orders + payments + deduct stock + clear cart in one transaction
    await prisma.$transaction(async (tx) => {
      for (const [storeId, items] of storeGroups) {
        const totalAmount = items.reduce(
          (sum, item) => sum + Number(item.product.price) * item.quantity,
          0,
        );

        // Create order
        const order = await tx.order.create({
          data: {
            buyerId: session.user.id,
            storeId,
            status: paymentMethod === "COD" ? "DIPROSES" : "MENUNGGU_PEMBAYARAN",
            paymentMethod: paymentMethod as "MANUAL_TRANSFER" | "COD",
            deliveryMethod: deliveryMethod as "PICKUP_COD" | "MANUAL_DELIVERY",
            totalAmount,
            shippingCost: 0,
            notes,
            items: {
              create: items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                priceAtPurchase: item.product.price,
              })),
            },
          },
        });

        // Create payment record
        await tx.payment.create({
          data: {
            orderId: order.id,
            status: paymentMethod === "COD" ? "COD_RECEIVED" : "PENDING",
            amount: totalAmount,
          },
        });

        // Deduct stock for each product
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
            },
          });

          // Set status to OUT_OF_STOCK if stock reaches 0
          const updated = await tx.product.findUnique({
            where: { id: item.productId },
            select: { stock: true },
          });
          if (updated && updated.stock === 0) {
            await tx.product.update({
              where: { id: item.productId },
              data: { status: "OUT_OF_STOCK" },
            });
          }
        }

        orderIds.push(order.id);

        // Create notification for seller
        const store = await tx.storeProfile.findUnique({
          where: { id: storeId },
          select: { userId: true },
        });
        if (store) {
          await tx.notification.create({
            data: {
              userId: store.userId,
              type: "NEW_ORDER",
              title: `Pesanan baru #${order.id.slice(-8)}`,
              payload: { orderId: order.id, totalAmount },
              isRead: false,
            },
          });
        }
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: session.user.id },
      });
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memproses checkout",
    };
  }

  revalidatePath("/cart");
  revalidatePath("/orders");
  return { success: true, orderIds };
}
