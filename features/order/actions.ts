"use server";

import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/lib/generated/prisma/client";
import { requireAuth } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export type OrderActionState = {
  error?: string;
  success?: boolean;
};

// ─── Seller: Verify payment (approve) ───
export async function verifyPaymentAction(orderId: string): Promise<OrderActionState> {
  const session = await requireAuth();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { store: { select: { userId: true } }, payment: true },
  });

  if (!order) return { error: "Order tidak ditemukan" };

  // Seller can only verify their own store's orders, or admin can verify any
  const isSeller = order.store.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isSeller && !isAdmin) return { error: "Tidak memiliki akses" };

  if (order.status !== "MENUNGGU_KONFIRMASI") {
    return { error: "Order tidak dalam status menunggu konfirmasi" };
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: {
        status: "VERIFIED",
        verifiedById: session.user.id,
        verifiedAt: new Date(),
      },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { status: "DIPROSES" },
    }),
  ]);

  // Notify buyer
  await prisma.notification.create({
    data: {
      userId: order.buyerId,
      type: "PAYMENT_VERIFIED",
      title: `Pembayaran terverifikasi untuk order #${orderId.slice(-8)}`,
      payload: { orderId },
      isRead: false,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "PAYMENT_VERIFIED",
      targetEntity: "Order",
      targetId: orderId,
    },
  });

  revalidatePath("/dashboard/orders");
  return { success: true };
}

// ─── Seller: Reject payment ───
export async function rejectPaymentAction(
  orderId: string,
  reason: string,
): Promise<OrderActionState> {
  const session = await requireAuth();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { store: { select: { userId: true } } },
  });

  if (!order) return { error: "Order tidak ditemukan" };

  const isSeller = order.store.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isSeller && !isAdmin) return { error: "Tidak memiliki akses" };

  if (order.status !== "MENUNGGU_KONFIRMASI") {
    return { error: "Order tidak dalam status menunggu konfirmasi" };
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: { status: "REJECTED" },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { status: "DIBATALKAN", cancelReason: reason },
    }),
  ]);

  // Restock items
  const items = await prisma.orderItem.findMany({ where: { orderId } });
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
  }

  await prisma.notification.create({
    data: {
      userId: order.buyerId,
      type: "PAYMENT_REJECTED",
      title: `Pembayaran ditolak untuk order #${orderId.slice(-8)}`,
      payload: { orderId, reason },
      isRead: false,
    },
  });

  revalidatePath("/dashboard/orders");
  return { success: true };
}

// ─── Seller: Update order status (Diproses → Siap Diambil) ───
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: string,
): Promise<OrderActionState> {
  const session = await requireAuth();

  const validTransitions: Record<string, string[]> = {
    DIPROSES: ["SIAP_DIAMBIL"],
    SIAP_DIAMBIL: ["SELESAI"],
  };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { store: { select: { userId: true } } },
  });

  if (!order) return { error: "Order tidak ditemukan" };

  const isSeller = order.store.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isSeller && !isAdmin) return { error: "Tidak memiliki akses" };

  const allowed = validTransitions[order.status];
  if (!allowed || !allowed.includes(newStatus)) {
    return { error: `Tidak bisa mengubah status dari ${order.status} ke ${newStatus}` };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus as OrderStatus },
  });

  await prisma.notification.create({
    data: {
      userId: order.buyerId,
      type: "ORDER_STATUS_UPDATE",
      title: `Order #${orderId.slice(-8)}: ${newStatus === "SIAP_DIAMBIL" ? "Siap Diambil" : "Selesai"}`,
      payload: { orderId, status: newStatus },
      isRead: false,
    },
  });

  revalidatePath("/dashboard/orders");
  return { success: true };
}

// ─── Seller: Mark COD payment received ───
export async function markCodReceivedAction(orderId: string): Promise<OrderActionState> {
  const session = await requireAuth();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { store: { select: { userId: true } }, payment: true },
  });

  if (!order) return { error: "Order tidak ditemukan" };

  const isSeller = order.store.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isSeller && !isAdmin) return { error: "Tidak memiliki akses" };

  if (order.paymentMethod !== "COD" || order.status !== "DIPROSES") {
    return { error: "Order tidak eligible untuk COD confirmation" };
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: { status: "COD_RECEIVED" },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { status: "SIAP_DIAMBIL" },
    }),
  ]);

  await prisma.notification.create({
    data: {
      userId: order.buyerId,
      type: "COD_RECEIVED",
      title: `Pembayaran COD diterima untuk order #${orderId.slice(-8)}`,
      payload: { orderId },
      isRead: false,
    },
  });

  revalidatePath("/dashboard/orders");
  return { success: true };
}

// ─── Buyer: Confirm received (Siap Diambil → Selesai) ───
export async function confirmReceivedAction(orderId: string): Promise<OrderActionState> {
  const session = await requireAuth();

  const order = await prisma.order.findFirst({
    where: { id: orderId, buyerId: session.user.id },
  });

  if (!order) return { error: "Order tidak ditemukan" };

  if (order.status !== "SIAP_DIAMBIL") {
    return { error: "Order tidak dalam status siap diambil" };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "SELESAI" },
  });

  await prisma.notification
    .create({
      data: {
        userId: order.storeId ? order.storeId : "",
        type: "ORDER_COMPLETED",
        title: `Order #${orderId.slice(-8)} selesai`,
        payload: { orderId },
        isRead: false,
      },
    })
    .catch(() => {});

  revalidatePath("/orders");
  return { success: true };
}

// ─── Buyer: Cancel order (only in Menunggu Pembayaran) ───
export async function cancelOrderAction(orderId: string): Promise<OrderActionState> {
  const session = await requireAuth();

  const order = await prisma.order.findFirst({
    where: { id: orderId, buyerId: session.user.id },
    include: { items: true },
  });

  if (!order) return { error: "Order tidak ditemukan" };

  if (order.status !== "MENUNGGU_PEMBAYARAN") {
    return { error: "Order tidak bisa dibatalkan" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: "DIBATALKAN", cancelReason: "Dibatalkan oleh buyer" },
    });

    // Restock
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
  });

  revalidatePath("/orders");
  return { success: true };
}

// ─── Get seller's incoming orders ───
export async function getSellerOrders() {
  const session = await requireAuth();

  const store = await prisma.storeProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!store) return [];

  const orders = await prisma.order.findMany({
    where: { storeId: store.id },
    include: {
      buyer: { select: { name: true, email: true } },
      items: {
        include: {
          product: {
            select: { name: true, images: { take: 1, orderBy: { position: "asc" } } },
          },
        },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize Decimal → number. Prisma Decimal objects cannot be passed from a
  // Server Component to a Client Component (SellerOrderCard is "use client").
  return orders.map((o) => ({
    ...o,
    totalAmount: Number(o.totalAmount),
    shippingCost: Number(o.shippingCost),
    items: o.items.map((it) => ({ ...it, priceAtPurchase: Number(it.priceAtPurchase) })),
  }));
}
