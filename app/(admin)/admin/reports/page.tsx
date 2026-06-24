import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
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
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy-900">Laporan & Analitik</h1>

      {/* GMV + Order Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-neutral-500">GMV</p>
          <p className="mt-1 text-xl font-bold text-brand-navy-900">{formatPrice(gmv)}</p>
        </div>
        {orderStats.map((stat) => (
          <div key={stat.status} className="rounded-lg border border-border p-4">
            <p className="text-xs text-neutral-500">{stat.status.replace(/_/g, " ")}</p>
            <p className="mt-1 text-xl font-bold text-brand-navy-900">{stat._count}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Sellers */}
        <div>
          <h2 className="mb-3 text-sm font-semibold">Seller Teraktif</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-neutral-100 text-left text-neutral-500">
                <tr>
                  <th className="px-4 py-2">Toko</th>
                  <th className="px-4 py-2">Order</th>
                  <th className="px-4 py-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {sellerStats.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-center text-neutral-500">
                      Belum ada data.
                    </td>
                  </tr>
                ) : (
                  sellerStats.map((s, i) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="px-4 py-2 font-medium">
                        {i + 1}. {s.name}
                      </td>
                      <td className="px-4 py-2 text-neutral-500">{s.orderCount}</td>
                      <td className="px-4 py-2 font-medium">{formatPrice(s.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Categories */}
        <div>
          <h2 className="mb-3 text-sm font-semibold">Kategori Terlaris</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-neutral-100 text-left text-neutral-500">
                <tr>
                  <th className="px-4 py-2">Kategori</th>
                  <th className="px-4 py-2">Produk</th>
                </tr>
              </thead>
              <tbody>
                {topCategories.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-4 text-center text-neutral-500">
                      Belum ada data.
                    </td>
                  </tr>
                ) : (
                  topCategories.map((c, i) => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="px-4 py-2 font-medium">
                        {i + 1}. {c.name}
                      </td>
                      <td className="px-4 py-2 text-neutral-500">{c._count.products}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
