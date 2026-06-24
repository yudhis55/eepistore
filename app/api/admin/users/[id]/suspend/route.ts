import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const schema = z.object({
  action: z.enum(["suspend", "unsuspend"]),
  reason: z.string().max(500).optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: userId } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }
  if (targetUser.role === "ADMIN") {
    return NextResponse.json({ error: "Tidak bisa suspend admin" }, { status: 400 });
  }

  if (parsed.data.action === "suspend") {
    await prisma.user.update({
      where: { id: userId },
      data: {
        suspendedAt: new Date(),
        suspendedReason: parsed.data.reason ?? "D suspended oleh admin",
      },
    });
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: { suspendedAt: null, suspendedReason: null },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: parsed.data.action === "suspend" ? "USER_SUSPENDED" : "USER_UNSUSPENDED",
      targetEntity: "User",
      targetId: userId,
      metadata: { reason: parsed.data.reason },
    },
  });

  return NextResponse.json({ success: true });
}
