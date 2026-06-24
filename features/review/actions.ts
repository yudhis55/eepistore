"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ReviewActionState = {
  error?: string;
  success?: boolean;
};

const reviewSchema = z.object({
  orderItemId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().or(z.literal("")),
});

export async function createReviewAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const session = await requireAuth();

  const parsed = reviewSchema.safeParse({
    orderItemId: formData.get("orderItemId"),
    rating: Number(formData.get("rating")),
    comment: formData.get("comment") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  const data = parsed.data;

  // Verify order belongs to user and is SELESAI
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: data.orderItemId },
    include: { order: true },
  });

  if (!orderItem) return { error: "Item tidak ditemukan" };
  if (orderItem.order.buyerId !== session.user.id) return { error: "Tidak memiliki akses" };
  if (orderItem.order.status !== "SELESAI") return { error: "Order belum selesai" };

  // Check if already reviewed
  const existing = await prisma.review.findUnique({
    where: { orderItemId: data.orderItemId },
  });
  if (existing) return { error: "Anda sudah memberi review untuk item ini" };

  await prisma.review.create({
    data: {
      userId: session.user.id,
      productId: orderItem.productId,
      orderItemId: data.orderItemId,
      rating: data.rating,
      comment: data.comment || null,
    },
  });

  revalidatePath(`/orders/${orderItem.orderId}`);
  return { success: true };
}

// ─── Wishlist ───

export async function toggleWishlistAction(productId: string) {
  const session = await requireAuth();

  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_productId: { userId: session.user.id, productId },
    },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
  } else {
    await prisma.wishlist.create({
      data: { userId: session.user.id, productId },
    });
  }

  revalidatePath(`/products/${productId}`);
  revalidatePath("/wishlist");
}

export async function getWishlist() {
  const session = await requireAuth();

  return prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          images: { take: 1, orderBy: { position: "asc" } },
          store: { select: { storeName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function isWishlisted(productId: string): Promise<boolean> {
  const session = await requireAuth();
  if (!session?.user) return false;

  const item = await prisma.wishlist.findUnique({
    where: {
      userId_productId: { userId: session.user.id, productId },
    },
  });
  return !!item;
}
