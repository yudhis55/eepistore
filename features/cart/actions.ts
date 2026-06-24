"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { cartAddSchema, cartUpdateSchema } from "@/lib/validators/cart";
import { revalidatePath } from "next/cache";

export async function addToCartAction(productId: string, quantity: number = 1) {
  const session = await requireAuth();

  const parsed = cartAddSchema.safeParse({ productId, quantity });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Input tidak valid");
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, status: "ACTIVE" },
    select: { id: true, stock: true, storeId: true },
  });

  if (!product) throw new Error("Produk tidak ditemukan");

  const existing = await prisma.cartItem.findUnique({
    where: {
      userId_productId: { userId: session.user.id, productId },
    },
  });

  const currentQty = existing?.quantity ?? 0;
  const newQty = currentQty + quantity;

  if (newQty > product.stock) {
    throw new Error(`Stok tidak mencukupi. Tersedia: ${product.stock}`);
  }

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        productId,
        quantity,
      },
    });
  }

  revalidatePath("/cart");
}

export async function updateCartQtyAction(cartItemId: string, quantity: number) {
  const session = await requireAuth();

  const parsed = cartUpdateSchema.safeParse({ cartItemId, quantity });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Input tidak valid");
  }

  const item = await prisma.cartItem.findFirst({
    where: { id: cartItemId, userId: session.user.id },
    include: { product: { select: { stock: true } } },
  });

  if (!item) throw new Error("Item keranjang tidak ditemukan");
  if (quantity > item.product.stock) {
    throw new Error(`Stok tidak mencukupi. Tersedia: ${item.product.stock}`);
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  revalidatePath("/cart");
}

export async function removeFromCartAction(cartItemId: string) {
  const session = await requireAuth();

  await prisma.cartItem.deleteMany({
    where: { id: cartItemId, userId: session.user.id },
  });

  revalidatePath("/cart");
}

export async function getCart() {
  const session = await requireAuth();

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          store: { select: { id: true, storeName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by store for multi-seller checkout display
  const grouped = items.reduce(
    (acc, item) => {
      const storeId = item.product.storeId;
      const storeName = item.product.store.storeName;
      if (!acc[storeId]) {
        acc[storeId] = { storeId, storeName, items: [] };
      }
      acc[storeId].items.push(item);
      return acc;
    },
    {} as Record<string, { storeId: string; storeName: string; items: typeof items }>,
  );

  const groups = Object.values(grouped);
  const totalItems = items.length;
  const totalPrice = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  return { groups, totalItems, totalPrice };
}
