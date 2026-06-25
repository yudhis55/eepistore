import { getAllCategories } from "@/features/catalog/actions";
import { CategoryManager } from "@/components/category-manager";
import { CategoryForm } from "@/components/category-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelola Kategori — Admin EEPISTORE",
};

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

  return (
    <>
      <PageHeader
        title="Kelola Kategori"
        description={`Susun taksonomi katalog produk · ${categories.length} kategori`}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-brand-navy-900">Tambah Kategori</h2>
          </CardHeader>
          <CardBody>
            <CategoryForm categories={categories} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-brand-navy-900">Daftar Kategori</h2>
          </CardHeader>
          <CardBody>
            <CategoryManager categories={categories} />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
