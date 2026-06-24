import { prisma } from "@/lib/prisma";
import { getAllCategories } from "@/features/catalog/actions";
import { ProductEditForm } from "@/components/product-edit-form";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Produk — EEPISTORE",
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categories = await getAllCategories();

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
    },
  });

  if (!product) notFound();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy-900">Edit Produk</h1>
      <ProductEditForm product={product} categories={categories} />
    </main>
  );
}
