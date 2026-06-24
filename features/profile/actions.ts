"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ProfileActionState = {
  error?: string;
  success?: boolean;
};

const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  phone: z.string().max(20, "No. HP maksimal 20 karakter").optional().or(z.literal("")),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export async function updateProfileAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireAuth();

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      avatarUrl: parsed.data.avatarUrl || null,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}

// ─── Address CRUD ───

const addressSchema = z.object({
  label: z.string().min(1, "Label wajib diisi").max(50),
  detail: z.string().min(5, "Detail alamat minimal 5 karakter").max(500),
  isDefault: z.boolean().default(false),
});

export async function addAddressAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireAuth();

  const parsed = addressSchema.safeParse({
    label: formData.get("label"),
    detail: formData.get("detail"),
    isDefault: formData.get("isDefault") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  const data = parsed.data;

  // If setting as default, unset previous default
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  await prisma.address.create({
    data: {
      userId: session.user.id,
      label: data.label,
      detail: data.detail,
      isDefault: data.isDefault,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function deleteAddressAction(addressId: string) {
  const session = await requireAuth();

  await prisma.address.deleteMany({
    where: { id: addressId, userId: session.user.id },
  });

  revalidatePath("/profile");
}

export async function getMyProfile() {
  const session = await requireAuth();

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      role: true,
      isVerifiedStudent: true,
      nim: true,
      createdAt: true,
    },
  });
}

export async function getMyAddresses() {
  const session = await requireAuth();

  return prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}
