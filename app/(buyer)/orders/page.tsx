import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
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
    <>
      <PageHeader
        title="Pesanan Saya"
        description="Pantau dan kelola semua pesanan Anda di satu tempat."
      />

      {justCheckedOut && (
        <Badge variant="success" className="mb-6 px-3 py-2 text-sm">
          {orders.filter(
            (o) => o.paymentMethod === "MANUAL_TRANSFER" && o.status === "MENUNGGU_PEMBAYARAN",
          ).length > 0
            ? "Pesanan berhasil dibuat! Silakan upload bukti pembayaran."
            : "Pesanan berhasil dibuat!"}
        </Badge>
      )}

      {orders.length === 0 ? (
        <EmptyState
          title="Belum ada pesanan"
          description="Pesanan Anda akan muncul di sini setelah Anda menyelesaikan checkout."
          action={
            <Link className={buttonVariants({ variant: "primary" })} href="/products">
              Mulai Belanja
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{order.store.storeName}</span>
                      <span className="text-neutral-300">•</span>
                      <span className="font-mono text-xs tabular-nums text-neutral-500">
                        #{order.id.slice(-8)}
                      </span>
                    </div>
                    <OrderStatusBadge
                      status={order.status}
                      label={statusLabel[order.status] ?? order.status}
                    />
                  </div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-sm font-medium text-brand-navy-900 hover:underline"
                  >
                    Lihat Detail
                  </Link>
                </div>

                {/* Items preview */}
                <div className="mt-3 space-y-1 text-sm text-neutral-600">
                  {order.items.slice(0, 2).map((item, i) => (
                    <p key={i} className="truncate">
                      {item.product.name} ×{" "}
                      <span className="font-mono tabular-nums">{item.quantity}</span>
                    </p>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-neutral-500">
                      +{order.items.length - 2} produk lainnya
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex gap-2 text-xs text-neutral-500">
                    <span>{order.paymentMethod === "COD" ? "COD" : "Transfer"}</span>
                    <span>•</span>
                    <span>{order.deliveryMethod === "PICKUP_COD" ? "Ambil/COD" : "Diantar"}</span>
                  </div>
                  <span className="font-mono font-bold tabular-nums text-brand-navy-900">
                    {formatPrice(Number(order.totalAmount))}
                  </span>
                </div>

                {/* Upload proof link for pending transfer orders */}
                {order.status === "MENUNGGU_PEMBAYARAN" &&
                  order.paymentMethod === "MANUAL_TRANSFER" && (
                    <Link
                      href={`/orders/${order.id}/upload-proof`}
                      className={buttonVariants({
                        variant: "gold",
                        size: "sm",
                        className: "mt-3 w-full",
                      })}
                    >
                      Upload Bukti Pembayaran
                    </Link>
                  )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
