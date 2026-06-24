"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const session = await requireAuth();

  return prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export async function markAllNotificationsReadAction() {
  const session = await requireAuth();

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/notifications");
}

export async function getUnreadNotificationCount() {
  const session = await requireAuth();

  return prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  });
}
