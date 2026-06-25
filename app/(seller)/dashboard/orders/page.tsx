import type { Metadata } from "next";
import { getSellerOrders } from "@/features/order/actions";
import { SellerOrderCard } from "@/components/seller-order-card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Pesanan Masuk — Dashboard Seller" };

export default async function SellerOrdersPage() {
  const orders = await getSellerOrders();

  return (
    <>
      <PageHeader
        title={`Pesanan Masuk (${orders.length})`}
        description="Kelola pesanan yang masuk ke toko Anda — konfirmasi, proses, atau siapkan untuk diambil."
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={<BoxIcon />}
          title="Belum ada pesanan masuk"
          description="Pesanan dari pembeli akan muncul di sini. Pastikan produk Anda aktif dan stok tersedia."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((order) => (
            <SellerOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </>
  );
}

function BoxIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7l9-4 9 4v10l-9 4-9-4V7zM3 7l9 4M21 7l-9 4M12 11v10"
      />
    </svg>
  );
}
