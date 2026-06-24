import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard — EEPISTORE",
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");

  const [totalUsers, totalStores, totalProducts, totalOrders, recentOrders] = await Promise.all([
    prisma.user.count(),
    prisma.storeProfile.count({ where: { status: "APPROVED" } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.order.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        buyer: { select: { name: true } },
        store: { select: { storeName: true } },
      },
    }),
  ]);

  const gmvResult = await prisma.payment.aggregate({
    where: { status: { in: ["VERIFIED", "COD_RECEIVED"] } },
    _sum: { amount: true },
  });
  const gmv = Number(gmvResult._sum.amount ?? 0);

  const pendingStores = await prisma.storeProfile.count({
    where: { status: "PENDING" },
  });

  const stats = [
    { label: "Total User", value: totalUsers.toString(), href: "/admin/users" },
    { label: "Toko Aktif", value: totalStores.toString(), href: "/admin/stores" },
    { label: "Produk Aktif", value: totalProducts.toString(), href: "/admin/products" },
    { label: "Total Order", value: totalOrders.toString(), href: "/admin/orders" },
    { label: "GMV", value: formatPrice(gmv), href: null },
    { label: "Toko Pending", value: pendingStores.toString(), href: "/admin/stores" },
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy-900">Admin Dashboard</h1>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-lg border border-border p-4 ${
              stat.href ? "cursor-pointer hover:bg-neutral-100" : ""
            }`}
          >
            {stat.href ? (
              <Link href={stat.href}>
                <p className="text-xs text-neutral-500">{stat.label}</p>
                <p className="mt-1 text-xl font-bold text-brand-navy-900">{stat.value}</p>
              </Link>
            ) : (
              <>
                <p className="text-xs text-neutral-500">{stat.label}</p>
                <p className="mt-1 text-xl font-bold text-brand-navy-900">{stat.value}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/admin/stores"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-neutral-100"
        >
          Kelola Toko
        </Link>
        <Link
          href="/admin/verifications"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-neutral-100"
        >
          Verifikasi Student
        </Link>
        <Link
          href="/admin/categories"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-neutral-100"
        >
          Kelola Kategori
        </Link>
        <Link
          href="/admin/orders"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-neutral-100"
        >
          Semua Order
        </Link>
        <Link
          href="/admin/products"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-neutral-100"
        >
          Moderasi Produk
        </Link>
        <Link
          href="/admin/users"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-neutral-100"
        >
          Kelola User
        </Link>
      </div>

      {/* Recent orders */}
      <div>
        <h2 className="mb-3 text-sm font-semibold">Pesanan Terbaru</h2>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-neutral-100 text-left text-neutral-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Toko</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                    Belum ada pesanan.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">#{order.id.slice(-8)}</td>
                    <td className="px-4 py-3 text-neutral-500">{order.buyer.name}</td>
                    <td className="px-4 py-3 text-neutral-500">{order.store.storeName}</td>
                    <td className="px-4 py-3">{order.status}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(Number(order.totalAmount))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
