import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { parsePrivateObjectUrl } from "@/lib/private-object-access";

const proofSchema = z.object({
  proofImageUrl: z.string().url(),
  paymentId: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: orderId } = await params;
  const body = await request.json();
  const parsed = proofSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
  }

  const proofObject = parsePrivateObjectUrl(parsed.data.proofImageUrl);
  if (
    !proofObject ||
    proofObject.folder !== "payments" ||
    proofObject.ownerId !== session.user.id
  ) {
    return NextResponse.json({ error: "Bukti pembayaran tidak valid" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, buyerId: session.user.id },
    include: { payment: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  }

  if (order.status !== "MENUNGGU_PEMBAYARAN") {
    return NextResponse.json(
      { error: "Order tidak dalam status menunggu pembayaran" },
      { status: 400 },
    );
  }

  // Update payment proof and order status
  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: {
        proofImageUrl: parsed.data.proofImageUrl,
        proofObjectKey: proofObject.key,
        status: "AWAITING_VERIFICATION",
      },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { status: "MENUNGGU_KONFIRMASI" },
    }),
  ]);

  // Notify seller
  const store = await prisma.storeProfile.findUnique({
    where: { id: order.storeId },
    select: { userId: true },
  });
  if (store) {
    await prisma.notification.create({
      data: {
        userId: store.userId,
        type: "PAYMENT_PROOF_UPLOADED",
        title: `Bukti pembayaran untuk order #${orderId.slice(-8)}`,
        payload: { orderId },
        isRead: false,
      },
    });
  }

  return NextResponse.json({ success: true });
}
