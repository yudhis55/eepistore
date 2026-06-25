import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Table, THead, TBody, TR, TH, TD, TableWrapper } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Laporan & Analitik — Admin",
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

const orderStatusTone: Record<string, "neutral" | "success" | "warning" | "danger" | "gold"> = {
  SELESAI: "success",
  DIKIRIM: "neutral",
  DIPROSES: "warning",
  DIBAYAR: "neutral",
  DIBATALKAN: "danger",
  PENDING: "warning",
};

const statusLabel = (status: string) => status.replace(/_/g, " ");

export default async function AdminReportsPage() {
  await requireRole("ADMIN");

  // GMV (total verified + COD received payments)
  const gmvResult = await prisma.payment.aggregate({
    where: { status: { in: ["VERIFIED", "COD_RECEIVED"] } },
    _sum: { amount: true },
  });
  const gmv = Number(gmvResult._sum.amount ?? 0);

  // Order counts by status
  const orderStats = await prisma.order.groupBy({
    by: ["status"],
    _count: true,
  });

  // Top sellers by order count
  const topSellers = await prisma.storeProfile.findMany({
    include: {
      _count: { select: { orders: true } },
      orders: {
        where: { status: "SELESAI" },
        select: { totalAmount: true },
      },
    },
    orderBy: { orders: { _count: "desc" } },
    take: 5,
  });

  const sellerStats = topSellers.map((s) => ({
    id: s.id,
    name: s.storeName,
    orderCount: s._count.orders,
    revenue: s.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
  }));

  // Top categories by product count
  const topCategories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { products: { _count: "desc" } },
    take: 5,
  });

  return (
    <>
      <PageHeader
        title="Laporan & Analitik"
        description="Ringkasan GMV, status pesanan, dan performa penjual."
      />

      {/* GMV + Order Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="GMV" value={formatPrice(gmv)} tone="gold" />
        {orderStats.map((stat) => (
          <StatCard
            key={stat.status}
            label={statusLabel(stat.status)}
            value={String(stat._count)}
            tone={orderStatusTone[stat.status] ?? "neutral"}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Sellers */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-brand-navy-900">Seller Teraktif</h2>
          {sellerStats.length === 0 ? (
            <EmptyState
              title="Belum ada data seller"
              description="Belum ada transaksi untuk menentukan seller teraktif."
            />
          ) : (
            <TableWrapper>
              <div className="overflow-x-auto">
                <Table>
                  <THead>
                    <TR>
                      <TH>Toko</TH>
                      <TH className="text-right">Order</TH>
                      <TH className="text-right">Revenue</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {sellerStats.map((s, i) => (
                      <TR key={s.id}>
                        <TD className="font-medium text-brand-navy-900">
                          <span className="font-mono tabular-nums text-neutral-400">{i + 1}.</span>{" "}
                          {s.name}
                        </TD>
                        <TD className="text-right font-mono tabular-nums">{s.orderCount}</TD>
                        <TD className="text-right font-mono font-medium tabular-nums">
                          {formatPrice(s.revenue)}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            </TableWrapper>
          )}
        </div>

        {/* Top Categories */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-brand-navy-900">Kategori Terlaris</h2>
          {topCategories.length === 0 ? (
            <EmptyState
              title="Belum ada data kategori"
              description="Belum ada kategori dengan produk terdaftar."
            />
          ) : (
            <TableWrapper>
              <div className="overflow-x-auto">
                <Table>
                  <THead>
                    <TR>
                      <TH>Kategori</TH>
                      <TH className="text-right">Produk</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {topCategories.map((c, i) => (
                      <TR key={c.id}>
                        <TD className="font-medium text-brand-navy-900">
                          <span className="font-mono tabular-nums text-neutral-400">{i + 1}.</span>{" "}
                          {c.name}
                        </TD>
                        <TD className="text-right font-mono tabular-nums">{c._count.products}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            </TableWrapper>
          )}
        </div>
      </div>
    </>
  );
}
