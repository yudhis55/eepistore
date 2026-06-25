import type { Metadata } from "next";
import { getAllCategories } from "@/features/catalog/actions";
import { ProductForm } from "@/components/product-form";
import { PageHeader, Breadcrumb } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Tambah Produk — EEPISTORE" };

export default async function NewProductPage() {
  const categories = await getAllCategories();

  return (
    <>
      <PageHeader
        title="Tambah Produk"
        description="Lengkapi detail produk Anda. Produk akan langsung tampil di katalog setelah disimpan."
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Produk", href: "/dashboard/products/new" },
              { label: "Tambah" },
            ]}
          />
        }
      />
      <div className="mx-auto max-w-2xl">
        <ProductForm categories={categories} />
      </div>
    </>
  );
}
