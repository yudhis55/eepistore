"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/rbac";
import { storeApplySchema } from "@/lib/validators/catalog";
import { revalidatePath } from "next/cache";

export type StoreActionState = {
  error?: string;
  success?: boolean;
};

export async function applyStoreAction(
  _prev: StoreActionState,
  formData: FormData,
): Promise<StoreActionState> {
  const session = await requireAuth();

  // Check if user already has a store (1 user = 1 store)
  const existing = await prisma.storeProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (existing && existing.status === "APPROVED") {
    return { error: "Anda sudah memiliki toko aktif" };
  }

  if (existing && existing.status === "PENDING") {
    return { error: "Pengajuan toko Anda sedang dalam antrian review" };
  }

  const parsed = storeApplySchema.safeParse({
    storeName: formData.get("storeName"),
    description: formData.get("description") || undefined,
    pickupLocation: formData.get("pickupLocation") || undefined,
    logoUrl: formData.get("logoUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  const data = parsed.data;

  if (existing && existing.status === "REJECTED") {
    // Re-apply after rejection
    await prisma.storeProfile.update({
      where: { userId: session.user.id },
      data: {
        storeName: data.storeName,
        description: data.description || null,
        pickupLocation: data.pickupLocation || null,
        logoUrl: data.logoUrl || null,
        status: "PENDING",
        rejectionReason: null,
      },
    });
  } else {
    await prisma.storeProfile.create({
      data: {
        userId: session.user.id,
        storeName: data.storeName,
        description: data.description || null,
        pickupLocation: data.pickupLocation || null,
        logoUrl: data.logoUrl || null,
        status: "PENDING",
      },
    });
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function approveStoreAction(storeId: string) {
  await requireRole("ADMIN");

  const store = await prisma.storeProfile.update({
    where: { id: storeId },
    data: { status: "APPROVED" },
    include: { user: true },
  });

  // Upgrade user role to SELLER
  await prisma.user.update({
    where: { id: store.userId },
    data: { role: "SELLER" },
  });

  // Audit log
  const session = await requireAuth();
  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "STORE_APPROVED",
      targetEntity: "StoreProfile",
      targetId: storeId,
      metadata: { storeName: store.storeName, userId: store.userId },
    },
  });

  revalidatePath("/admin/stores");
}

export async function rejectStoreAction(storeId: string, reason: string) {
  await requireRole("ADMIN");

  await prisma.storeProfile.update({
    where: { id: storeId },
    data: { status: "REJECTED", rejectionReason: reason },
  });

  const session = await requireAuth();
  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "STORE_REJECTED",
      targetEntity: "StoreProfile",
      targetId: storeId,
      metadata: { reason },
    },
  });

  revalidatePath("/admin/stores");
}

export async function getMyStore() {
  const session = await requireAuth();
  return prisma.storeProfile.findUnique({
    where: { userId: session.user.id },
  });
}
