import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { OrderStatusBadge } from "@/components/order-status-badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Semua Order — Admin",
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

const statusLabel: Record<string, string> = {
  MENUNGGU_PEMBAYARAN: "Menunggu Pembayaran",
  MENUNGGU_KONFIRMASI: "Menunggu Konfirmasi",
  DIPROSES: "Diproses",
  SIAP_DIAMBIL: "Siap Diambil",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

export default async function AdminOrdersPage() {
  await requireRole("ADMIN");

  const orders = await prisma.order.findMany({
    include: {
      buyer: { select: { name: true, email: true } },
      store: { select: { storeName: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy-900">Semua Order ({orders.length})</h1>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3">Toko</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Metode</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">#{order.id.slice(-8)}</td>
                <td className="px-4 py-3 text-neutral-500">{order.buyer.name}</td>
                <td className="px-4 py-3 text-neutral-500">{order.store.storeName}</td>
                <td className="px-4 py-3 text-neutral-500">{order.items.length}</td>
                <td className="px-4 py-3">{order.paymentMethod === "COD" ? "COD" : "Transfer"}</td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} label={statusLabel[order.status]} />
                </td>
                <td className="px-4 py-3 font-medium">{formatPrice(Number(order.totalAmount))}</td>
                <td className="px-4 py-3 text-xs text-neutral-500">
                  {new Date(order.createdAt).toLocaleDateString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
