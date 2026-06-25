import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Table, THead, TBody, TR, TH, TD, TableWrapper } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderStatusBadge } from "@/components/order-status-badge";

export const metadata: Metadata = { title: "Admin Dashboard — EEPISTORE" };

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

const ORDER_STATUS_LABEL: Record<string, string> = {
  MENUNGGU_PEMBAYARAN: "Menunggu Bayar",
  MENUNGGU_KONFIRMASI: "Menunggu Konfirmasi",
  DIPROSES: "Diproses",
  SIAP_DIAMBIL: "Siap Diambil",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");

  const [
    totalUsers,
    totalStores,
    totalProducts,
    totalOrders,
    recentOrders,
    gmvResult,
    pendingStores,
    pendingVerifications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.storeProfile.count({ where: { status: "APPROVED" } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.order.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { buyer: { select: { name: true } }, store: { select: { storeName: true } } },
    }),
    prisma.payment.aggregate({
      where: { status: { in: ["VERIFIED", "COD_RECEIVED"] } },
      _sum: { amount: true },
    }),
    prisma.storeProfile.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { verificationStatus: "PENDING" } }),
  ]);

  const gmv = Number(gmvResult._sum.amount ?? 0);

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Ringkasan operasional EEPISTORE"
        actions={
          pendingStores > 0 ? (
            <Link
              href="/admin/stores"
              className="text-sm font-medium text-brand-navy-700 hover:underline"
            >
              {pendingStores} toko menunggu review →
            </Link>
          ) : undefined
        }
      />

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Total User" value={totalUsers.toString()} href="/admin/users" />
        <StatCard label="Toko Aktif" value={totalStores.toString()} href="/admin/stores" />
        <StatCard label="Produk Aktif" value={totalProducts.toString()} href="/admin/products" />
        <StatCard label="Total Order" value={totalOrders.toString()} href="/admin/orders" />
        <StatCard label="GMV" value={formatPrice(gmv)} tone="gold" />
        <StatCard
          label="Verifikasi Pending"
          value={pendingVerifications.toString()}
          href="/admin/verifications"
          tone={pendingVerifications > 0 ? "warning" : "neutral"}
        />
      </div>

      {/* Recent orders */}
      <h2 className="mb-3 text-h3 text-brand-navy-900">Pesanan Terbaru</h2>
      {recentOrders.length === 0 ? (
        <EmptyState
          title="Belum ada pesanan"
          description="Pesanan yang masuk akan muncul di sini."
        />
      ) : (
        <TableWrapper>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR className="hover:bg-transparent">
                  <TH>ID</TH>
                  <TH>Pembeli</TH>
                  <TH>Toko</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Total</TH>
                </TR>
              </THead>
              <TBody>
                {recentOrders.map((order) => (
                  <TR key={order.id}>
                    <TD className="font-mono font-medium tabular-nums text-brand-navy-900">
                      #{order.id.slice(-8)}
                    </TD>
                    <TD className="text-neutral-600">{order.buyer.name}</TD>
                    <TD className="text-neutral-600">{order.store.storeName}</TD>
                    <TD>
                      <OrderStatusBadge
                        status={order.status}
                        label={ORDER_STATUS_LABEL[order.status] ?? order.status}
                      />
                    </TD>
                    <TD className="text-right font-mono font-medium tabular-nums text-neutral-900">
                      {formatPrice(Number(order.totalAmount))}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </TableWrapper>
      )}
    </>
  );
}
