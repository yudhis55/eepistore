import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: conversationId } = await params;
  const { content } = await request.json();

  if (!content || typeof content !== "string" || content.length > 2000) {
    return NextResponse.json({ error: "Pesan tidak valid" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { store: { select: { userId: true } } },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation tidak ditemukan" }, { status: 404 });
  }

  const isBuyer = conversation.buyerId === session.user.id;
  const isSeller = conversation.store.userId === session.user.id;
  if (!isBuyer && !isSeller) {
    return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: session.user.id,
      content,
    },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  // Notify the other party
  const recipientId = isBuyer ? conversation.store.userId : conversation.buyerId;
  await prisma.notification.create({
    data: {
      userId: recipientId,
      type: "NEW_MESSAGE",
      title: `Pesan baru dari ${session.user.name}`,
      payload: { conversationId },
      isRead: false,
    },
  });

  return NextResponse.json({ message });
}
