import Link from "next/link";
import type { Metadata } from "next";
import { getMyStore } from "@/features/store/actions";
import { getMyProducts } from "@/features/product/actions";
import { StoreOnboardingForm } from "@/components/store-onboarding-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Dashboard Seller — EEPISTORE" };

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

export default async function SellerDashboardPage() {
  const store = await getMyStore();

  // No store yet -> onboarding
  if (!store) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader
          title="Buka Toko"
          description="Lengkapi profil toko Anda untuk mulai berjualan. Pengajuan akan direview oleh Admin."
        />
        <StoreOnboardingForm />
      </div>
    );
  }

  // Store pending
  if (store.status === "PENDING") {
    return (
      <Card className="border-warning/30 bg-warning/5 p-6 text-center">
        <h2 className="text-h3 text-brand-navy-900">Pengajuan Sedang Direview</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
          Toko &quot;{store.storeName}&quot; sedang dalam antrian review Admin. Anda akan mendapat
          notifikasi setelah disetujui.
        </p>
      </Card>
    );
  }

  // Store rejected
  if (store.status === "REJECTED") {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader
          title="Pengajuan Ditolak"
          description="Anda dapat mengajukan ulang dengan memperbaiki data."
        />
        <Card className="mb-6 border-danger/30 bg-danger/5 p-4">
          <p className="text-sm font-medium text-danger">Alasan penolakan</p>
          <p className="mt-1 text-sm text-neutral-600">
            {store.rejectionReason ?? "Pengajuan toko Anda ditolak."}
          </p>
        </Card>
        <StoreOnboardingForm />
      </div>
    );
  }

  // Store approved -> product list + stats
  const products = await getMyProducts();
  const activeCount = products.filter((p) => p.status === "ACTIVE").length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  return (
    <>
      <PageHeader
        title={store.storeName}
        description={`${products.length} produk · ${activeCount} aktif · ${totalStock} stok total`}
        actions={
          <>
            <Link href="/dashboard/orders" className={buttonVariants({ variant: "secondary" })}>
              Pesanan Masuk
            </Link>
            <Link href="/dashboard/products/new" className={buttonVariants({ variant: "primary" })}>
              + Tambah Produk
            </Link>
          </>
        }
      />

      {products.length === 0 ? (
        <EmptyState
          icon={<PlusIcon />}
          title="Belum ada produk"
          description="Mulai tambahkan produk pertama Anda untuk berjualan di EEPISTORE."
          action={
            <Link href="/dashboard/products/new" className={buttonVariants({ variant: "primary" })}>
              + Tambah Produk
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Produk</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 text-right font-medium">Harga</th>
                  <th className="px-4 py-3 text-right font-medium">Stok</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-900">{product.name}</td>
                    <td className="px-4 py-3 text-neutral-500">{product.category?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-neutral-900">
                      {formatPrice(Number(product.price))}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-neutral-700">
                      {product.stock}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="text-sm font-medium text-brand-navy-700 hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "ACTIVE") return <Badge variant="success">Aktif</Badge>;
  if (status === "DRAFT") return <Badge variant="neutral">Draft</Badge>;
  return <Badge variant="danger">Nonaktif</Badge>;
}

function PlusIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}
