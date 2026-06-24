import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { OrderStatusBadge } from "@/components/order-status-badge";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pesanan Saya — EEPISTORE",
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

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAuth();
  const params = await searchParams;
  const justCheckedOut = params.checkout === "success";

  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    include: {
      store: { select: { id: true, storeName: true } },
      items: {
        include: {
          product: {
            select: { name: true, images: { take: 1, orderBy: { position: "asc" } } },
          },
        },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy-900">Pesanan Saya</h1>

      {justCheckedOut && (
        <div className="mb-6 rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-success">
          Pesanan berhasil dibuat!{" "}
          {orders.filter(
            (o) => o.paymentMethod === "MANUAL_TRANSFER" && o.status === "MENUNGGU_PEMBAYARAN",
          ).length > 0 && "Silakan upload bukti pembayaran."}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-lg border border-border bg-neutral-100 p-12 text-center">
          <p className="text-neutral-500">Belum ada pesanan.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-brand-navy-900 px-4 py-2 font-medium text-white hover:bg-brand-navy-700"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                  <p className="text-sm font-medium">Order #{order.id.slice(-8)}</p>
                  <Link
                    href={`/stores/${order.store.id}`}
                    className="text-xs text-brand-navy-700 hover:underline"
                  >
                    {order.store.storeName}
                  </Link>
                </div>
                <OrderStatusBadge status={order.status} label={statusLabel[order.status]} />
              </div>

              <div className="mt-3 space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-neutral-500">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span>{formatPrice(Number(item.priceAtPurchase) * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
                <div className="flex gap-2 text-xs text-neutral-500">
                  <span>{order.paymentMethod === "COD" ? "COD" : "Transfer"}</span>
                  <span>•</span>
                  <span>{order.deliveryMethod === "PICKUP_COD" ? "Ambil/COD" : "Diantar"}</span>
                </div>
                <span className="font-bold text-brand-navy-900">
                  {formatPrice(Number(order.totalAmount))}
                </span>
              </div>

              {/* Upload proof link for pending transfer orders */}
              {order.status === "MENUNGGU_PEMBAYARAN" &&
                order.paymentMethod === "MANUAL_TRANSFER" && (
                  <Link
                    href={`/orders/${order.id}/upload-proof`}
                    className="mt-3 block rounded-lg bg-warning px-4 py-2 text-center text-sm font-medium text-white hover:opacity-90"
                  >
                    Upload Bukti Pembayaran
                  </Link>
                )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
