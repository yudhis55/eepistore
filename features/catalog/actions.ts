"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { categorySchema } from "@/lib/validators/catalog";
import { revalidatePath } from "next/cache";

export type CategoryActionState = {
  error?: string;
  success?: boolean;
};

export async function createCategoryAction(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireRole("ADMIN");

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    parentId: formData.get("parentId") || undefined,
    icon: formData.get("icon") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  const data = parsed.data;

  await prisma.category.create({
    data: {
      name: data.name,
      parentId: data.parentId || null,
      icon: data.icon || null,
    },
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategoryAction(
  id: string,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireRole("ADMIN");

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    parentId: formData.get("parentId") || undefined,
    icon: formData.get("icon") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  const data = parsed.data;

  await prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      parentId: data.parentId || null,
      icon: data.icon || null,
    },
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategoryAction(id: string) {
  await requireRole("ADMIN");

  await prisma.category.delete({ where: { id } });

  revalidatePath("/admin/categories");
}

export async function getAllCategories() {
  return prisma.category.findMany({
    include: {
      children: true,
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });
}
