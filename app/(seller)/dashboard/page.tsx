import { getMyStore } from "@/features/store/actions";
import { getMyProducts } from "@/features/product/actions";
import { StoreOnboardingForm } from "@/components/store-onboarding-form";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Seller — EEPISTORE",
};

export default async function SellerDashboardPage() {
  const store = await getMyStore();

  // No store yet -> show onboarding
  if (!store) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-lg">
          <h1 className="mb-2 text-2xl font-bold text-brand-navy-900">Buka Toko</h1>
          <p className="mb-6 text-sm text-neutral-500">
            Lengkapi profil toko Anda untuk mulai berjualan. Pengajuan akan direview oleh Admin.
          </p>
          <StoreOnboardingForm />
        </div>
      </main>
    );
  }

  // Store pending
  if (store.status === "PENDING") {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-6 text-center">
          <h1 className="text-xl font-bold text-neutral-900">Pengajuan Sedang Direview</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Toko &quot;{store.storeName}&quot; sedang dalam antrian review Admin. Anda akan mendapat
            notifikasi setelah disetujui.
          </p>
        </div>
      </main>
    );
  }

  // Store rejected
  if (store.status === "REJECTED") {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-lg">
          <div className="mb-6 rounded-lg border border-danger/30 bg-danger/10 p-4">
            <h1 className="font-bold text-danger">Pengajuan Ditolak</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {store.rejectionReason ?? "Pengajuan toko Anda ditolak."}
            </p>
          </div>
          <p className="mb-4 text-sm text-neutral-500">
            Anda dapat mengajukan ulang dengan memperbaiki data:
          </p>
          <StoreOnboardingForm />
        </div>
      </main>
    );
  }

  // Store approved -> show product list
  const products = await getMyProducts();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy-900">{store.storeName}</h1>
          <p className="text-sm text-neutral-500">{products.length} produk</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="rounded-lg bg-brand-navy-900 px-4 py-2.5 font-medium text-white transition-colors hover:bg-brand-navy-700"
        >
          + Tambah Produk
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border border-border bg-neutral-100 p-12 text-center">
          <p className="text-neutral-500">Belum ada produk. Mulai tambahkan produk pertama Anda.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-neutral-100 text-left text-neutral-500">
              <tr>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{product.category?.name ?? "-"}</td>
                  <td className="px-4 py-3">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(Number(product.price))}
                  </td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        product.status === "ACTIVE"
                          ? "bg-success/20 text-success"
                          : product.status === "DRAFT"
                            ? "bg-neutral-100 text-neutral-500"
                            : "bg-danger/20 text-danger"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/products/${product.id}/edit`}
                      className="text-brand-navy-700 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
