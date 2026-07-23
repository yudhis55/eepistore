"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parsePrivateObjectUrl } from "@/lib/private-object-access";

export type VerificationActionState = {
  error?: string;
  success?: boolean;
};

const submitSchema = z.object({
  nim: z
    .string()
    .min(8, "NIM minimal 8 digit")
    .max(20, "NIM maksimal 20 digit")
    .regex(/^\d+$/, "NIM harus berupa angka"),
  ktmImageUrl: z.string().url("Foto KTM wajib diupload"),
});

export async function submitVerificationAction(
  _prev: VerificationActionState,
  formData: FormData,
): Promise<VerificationActionState> {
  const session = await requireAuth();

  const parsed = submitSchema.safeParse({
    nim: formData.get("nim"),
    ktmImageUrl: formData.get("ktmImageUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  const verificationObject = parsePrivateObjectUrl(parsed.data.ktmImageUrl);
  if (
    !verificationObject ||
    verificationObject.folder !== "verifications" ||
    verificationObject.ownerId !== session.user.id
  ) {
    return { error: "Dokumen verifikasi tidak valid" };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  if (!user) return { error: "User tidak ditemukan" };
  if (user.isVerifiedStudent) return { error: "Anda sudah terverifikasi" };
  if (user.verificationStatus === "PENDING") {
    return { error: "Pengajuan verifikasi Anda sedang dalam review" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      nim: parsed.data.nim,
      verificationStatus: "PENDING",
      verificationObjectKey: verificationObject.key,
    },
  });

  // Keep a notification for the user-facing workflow; object ownership is
  // stored explicitly on User and is not inferred from this JSON payload.
  await prisma.notification.create({
    data: {
      userId: session.user.id,
      type: "VERIFICATION_SUBMITTED",
      title: `Verifikasi student: ${user.name}`,
      payload: {
        ktmImageUrl: parsed.data.ktmImageUrl,
        nim: parsed.data.nim,
        submittedAt: new Date().toISOString(),
      },
      isRead: false,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function approveVerificationAction(userId: string) {
  await requireRole("ADMIN");

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      verificationStatus: "APPROVED",
      isVerifiedStudent: true,
    },
  });

  const session = await requireAuth();
  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "VERIFICATION_APPROVED",
      targetEntity: "User",
      targetId: userId,
      metadata: { nim: user.nim },
    },
  });

  // Notify user
  await prisma.notification.create({
    data: {
      userId,
      type: "VERIFICATION_APPROVED",
      title: "Verifikasi student Anda disetujui!",
      payload: { isVerified: true },
      isRead: false,
    },
  });

  revalidatePath("/admin/verifications");
}

export async function rejectVerificationAction(userId: string, reason: string) {
  await requireRole("ADMIN");

  await prisma.user.update({
    where: { id: userId },
    data: { verificationStatus: "REJECTED" },
  });

  const session = await requireAuth();
  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "VERIFICATION_REJECTED",
      targetEntity: "User",
      targetId: userId,
      metadata: { reason },
    },
  });

  await prisma.notification.create({
    data: {
      userId,
      type: "VERIFICATION_REJECTED",
      title: "Verifikasi student ditolak",
      payload: { reason },
      isRead: false,
    },
  });

  revalidatePath("/admin/verifications");
}

export async function getPendingVerifications() {
  await requireRole("ADMIN");

  const users = await prisma.user.findMany({
    where: { verificationStatus: "PENDING" },
    select: {
      id: true,
      name: true,
      email: true,
      nim: true,
      createdAt: true,
    },
    orderBy: { updatedAt: "asc" },
  });

  // Get KTM image from notification payload
  const notifications = await prisma.notification.findMany({
    where: {
      userId: { in: users.map((u) => u.id) },
      type: "VERIFICATION_SUBMITTED",
    },
    select: { userId: true, payload: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return users.map((user) => {
    const notif = notifications.find((n) => n.userId === user.id);
    const payload = notif?.payload as { ktmImageUrl?: string } | null;
    return {
      ...user,
      ktmImageUrl: payload?.ktmImageUrl ?? null,
      submittedAt: notif?.createdAt ?? user.createdAt,
    };
  });
}
