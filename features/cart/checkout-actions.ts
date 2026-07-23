"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { checkoutLimiter } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const checkoutSchema = z.object({
  checkoutToken: z.string().uuid(),
  deliveryMethod: z.enum(["PICKUP_COD", "MANUAL_DELIVERY"]),
  paymentMethod: z.enum(["MANUAL_TRANSFER", "COD"]),
  notes: z.string().trim().max(500).nullable(),
});

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

  if (!(await checkoutLimiter.check(session.user.id))) {
    return { success: false, error: "Terlalu banyak checkout. Coba lagi nanti." };
  }

  const input = checkoutSchema.safeParse({
    checkoutToken: formData.get("checkoutToken"),
    deliveryMethod: formData.get("deliveryMethod"),
    paymentMethod: formData.get("paymentMethod"),
    notes: (formData.get("notes") as string) || null,
  });
  if (!input.success) {
    return { success: false, error: "Data checkout tidak valid" };
  }
  const { checkoutToken, deliveryMethod, paymentMethod, notes } = input.data;

  const previousOrders = await prisma.order.findMany({
    where: { buyerId: session.user.id, checkoutToken },
    select: { id: true },
  });
  if (previousOrders.length > 0) {
    return { success: true, orderIds: previousOrders.map((order) => order.id) };
  }

  // Get all cart items for this user
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: {
          id: true,
          storeId: true,
          stock: true,
          price: true,
          status: true,
          store: { select: { userId: true } },
        },
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
    if (item.product.store.userId === session.user.id) {
      return { success: false, error: "Anda tidak dapat membeli produk dari toko sendiri" };
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
    await prisma.$transaction(
      async (tx) => {
        for (const [storeId, items] of storeGroups) {
          const totalAmount = items.reduce(
            (sum, item) => sum + Number(item.product.price) * item.quantity,
            0,
          );

          // Create order
          const order = await tx.order.create({
            data: {
              buyerId: session.user.id,
              checkoutToken,
              storeId,
              status: paymentMethod === "COD" ? "DIPROSES" : "MENUNGGU_PEMBAYARAN",
              paymentMethod,
              deliveryMethod,
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
            const stockUpdate = await tx.product.updateMany({
              where: {
                id: item.productId,
                status: "ACTIVE",
                stock: { gte: item.quantity },
              },
              data: {
                stock: { decrement: item.quantity },
              },
            });
            if (stockUpdate.count !== 1) {
              throw new Error("Stok berubah saat checkout. Silakan tinjau keranjang kembali.");
            }

            await tx.product.updateMany({
              where: { id: item.productId, stock: 0 },
              data: { status: "OUT_OF_STOCK" },
            });
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
      },
      { isolationLevel: "Serializable" },
    );
  } catch (error) {
    const existingOrders = await prisma.order.findMany({
      where: { buyerId: session.user.id, checkoutToken },
      select: { id: true },
    });
    if (existingOrders.length > 0) {
      return { success: true, orderIds: existingOrders.map((order) => order.id) };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memproses checkout",
    };
  }

  revalidatePath("/cart");
  revalidatePath("/orders");
  return { success: true, orderIds };
}
