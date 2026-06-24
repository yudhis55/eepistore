import { getAllCategories } from "@/features/catalog/actions";
import { CategoryManager } from "@/components/category-manager";
import { CategoryForm } from "@/components/category-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelola Kategori — Admin EEPISTORE",
};

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy-900">Kelola Kategori</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold">Tambah Kategori</h2>
          <CategoryForm categories={categories} />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold">Daftar Kategori</h2>
          <CategoryManager categories={categories} />
        </div>
      </div>
    </main>
  );
}
