import { getSellerOrders } from "@/features/order/actions";
import { SellerOrderCard } from "@/components/seller-order-card";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pesanan Masuk — Dashboard Seller",
};

export default async function SellerOrdersPage() {
  const orders = await getSellerOrders();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-navy-900">
          Pesanan Masuk ({orders.length})
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-border bg-neutral-100 p-12 text-center">
          <p className="text-neutral-500">Belum ada pesanan masuk.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((order) => (
            <SellerOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </main>
  );
}
