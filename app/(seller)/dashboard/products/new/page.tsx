import { getAllCategories } from "@/features/catalog/actions";
import { ProductForm } from "@/components/product-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tambah Produk — EEPISTORE",
};

export default async function NewProductPage() {
  const categories = await getAllCategories();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy-900">Tambah Produk</h1>
      <ProductForm categories={categories} />
    </main>
  );
}
