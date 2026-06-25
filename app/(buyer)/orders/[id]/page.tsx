import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { notFound } from "next/navigation";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { BuyerOrderActions } from "@/components/buyer-order-actions";
import { ReviewForm } from "@/components/review-form";
import { PageHeader, Breadcrumb } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order #${id.slice(-8)} — EEPISTORE` };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAuth();

  const order = await prisma.order.findFirst({
    where: { id, buyerId: session.user.id },
    include: {
      store: { select: { id: true, storeName: true } },
      items: {
        include: {
          product: {
            select: {
              name: true,
              images: { take: 1, orderBy: { position: "asc" } },
            },
          },
        },
      },
      payment: true,
    },
  });

  if (!order) notFound();

  return (
    <>
      <PageHeader
        title={`Order #${order.id.slice(-8)}`}
        description={`${order.store.storeName} — ${statusLabel[order.status] ?? order.status}`}
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Pesanan Saya", href: "/orders" },
              { label: `#${order.id.slice(-8)}` },
            ]}
          />
        }
        actions={
          <OrderStatusBadge
            status={order.status}
            label={statusLabel[order.status] ?? order.status}
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order items */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardBody>
              <h2 className="mb-3 text-sm font-semibold text-brand-navy-900">Item Pesanan</h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-border bg-neutral-100">
                      {item.product.images[0] && (
                        <Image
                          src={item.product.images[0].imageUrl}
                          alt={item.product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.product.name}</p>
                      <p className="font-mono text-xs tabular-nums text-neutral-500">
                        {item.quantity} × {formatPrice(Number(item.priceAtPurchase))}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-medium tabular-nums">
                      {formatPrice(Number(item.priceAtPurchase) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between border-t border-border pt-3">
                <span className="font-medium">Total</span>
                <span className="font-mono text-lg font-bold tabular-nums text-brand-navy-900">
                  {formatPrice(Number(order.totalAmount))}
                </span>
              </div>
            </CardBody>
          </Card>

          {/* Payment info */}
          {order.payment && (
            <Card>
              <CardBody>
                <h2 className="mb-2 text-sm font-semibold text-brand-navy-900">Info Pembayaran</h2>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Metode</span>
                    <span>{order.paymentMethod === "COD" ? "COD" : "Transfer Manual"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Status</span>
                    <span>{order.payment.status}</span>
                  </div>
                  {order.payment.verifiedAt && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Diverifikasi</span>
                      <span>{new Date(order.payment.verifiedAt).toLocaleString("id-ID")}</span>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {order.cancelReason && (
            <Card className="border-danger/30 bg-danger/5">
              <CardBody>
                <p className="text-sm text-danger">
                  <strong>Dibatalkan:</strong> {order.cancelReason}
                </p>
              </CardBody>
            </Card>
          )}

          {/* Review section for completed orders */}
          {order.status === "SELESAI" && (
            <Card>
              <CardBody>
                <h2 className="mb-3 text-sm font-semibold text-brand-navy-900">Beri Review</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="border-t border-border pt-3 first:border-0 first:pt-0"
                    >
                      <p className="mb-2 text-sm font-medium">{item.product.name}</p>
                      <ReviewForm orderItemId={item.id} />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Actions sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardBody>
              <h2 className="mb-3 text-sm font-semibold text-brand-navy-900">Aksi</h2>
              <BuyerOrderActions orderId={order.id} status={order.status} />

              {order.status === "MENUNGGU_PEMBAYARAN" &&
                order.paymentMethod === "MANUAL_TRANSFER" && (
                  <Link
                    href={`/orders/${order.id}/upload-proof`}
                    className={buttonVariants({
                      variant: "gold",
                      size: "sm",
                      className: "mt-2 w-full",
                    })}
                  >
                    Upload Bukti Pembayaran
                  </Link>
                )}

              <div className="mt-4 space-y-1 text-xs text-neutral-500">
                <div className="flex justify-between">
                  <span>Pengiriman</span>
                  <span>{order.deliveryMethod === "PICKUP_COD" ? "Ambil/COD" : "Diantar"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal</span>
                  <span>{new Date(order.createdAt).toLocaleDateString("id-ID")}</span>
                </div>
                {order.notes && (
                  <div className="mt-2 border-t border-border pt-2">
                    <span>Catatan: {order.notes}</span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
