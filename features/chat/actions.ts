"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const messageSchema = z.object({
  storeId: z.string().min(1),
  content: z.string().min(1, "Pesan tidak boleh kosong").max(2000),
});

export type MessageActionState = {
  error?: string;
  success?: boolean;
};

// ─── Send message ───
export async function sendMessageAction(
  _prev: MessageActionState,
  formData: FormData,
): Promise<MessageActionState> {
  const session = await requireAuth();

  const parsed = messageSchema.safeParse({
    storeId: formData.get("storeId"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  const { storeId, content } = parsed.data;

  // Find or create conversation
  let conversation = await prisma.conversation.findUnique({
    where: {
      buyerId_storeId: { buyerId: session.user.id, storeId },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { buyerId: session.user.id, storeId },
    });
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: session.user.id,
      content,
    },
  });

  // Update conversation updatedAt
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  // Notify the other party
  const store = await prisma.storeProfile.findUnique({
    where: { id: storeId },
    select: { userId: true },
  });

  if (store && store.userId !== session.user.id) {
    await prisma.notification.create({
      data: {
        userId: store.userId,
        type: "NEW_MESSAGE",
        title: `Pesan baru dari ${session.user.name}`,
        payload: { conversationId: conversation.id },
        isRead: false,
      },
    });
  }

  revalidatePath(`/chat/${conversation.id}`);
  return { success: true };
}

// ─── Get user's conversations ───
export async function getConversations() {
  const session = await requireAuth();

  // Get conversations where user is buyer OR user owns the store
  const store = await prisma.storeProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ buyerId: session.user.id }, ...(store ? [{ storeId: store.id }] : [])],
    },
    include: {
      buyer: { select: { id: true, name: true, avatarUrl: true } },
      store: { select: { id: true, storeName: true, logoUrl: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: {
          messages: {
            where: { isRead: false, NOT: { senderId: session.user.id } },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return conversations.map((c) => ({
    ...c,
    unreadCount: c._count.messages,
  }));
}

// ─── Get conversation messages ───
export async function getMessages(conversationId: string) {
  const session = await requireAuth();

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { store: { select: { userId: true, storeName: true } } },
  });

  if (!conversation) throw new Error("Conversation tidak ditemukan");

  // Verify access: buyer or store owner or admin
  const isBuyer = conversation.buyerId === session.user.id;
  const isSeller = conversation.store.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isBuyer && !isSeller && !isAdmin) {
    throw new Error("Tidak memiliki akses");
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Mark messages as read (only those not sent by current user)
  await prisma.message.updateMany({
    where: {
      conversationId,
      NOT: { senderId: session.user.id },
      isRead: false,
    },
    data: { isRead: true },
  });

  // Audit log for admin access
  if (isAdmin && !isBuyer && !isSeller) {
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "CHAT_ACCESSED",
        targetEntity: "Conversation",
        targetId: conversationId,
      },
    });
  }

  return {
    conversation: {
      id: conversation.id,
      buyer: { id: conversation.buyerId },
      store: { id: conversation.storeId, storeName: conversation.store.storeName ?? "" },
    },
    messages,
    currentUserId: session.user.id,
  };
}
