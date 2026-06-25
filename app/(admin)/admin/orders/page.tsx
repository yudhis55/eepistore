import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { Table, THead, TBody, TR, TH, TD, TableWrapper } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
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
    <>
      <PageHeader
        title="Semua Order"
        description={`Daftar seluruh transaksi lintas toko · ${orders.length} order`}
      />

      {orders.length === 0 ? (
        <EmptyState
          title="Belum ada order"
          description="Transaksi yang masuk dari pembeli akan tampil di sini."
          action={
            <Link href="/admin" className={buttonVariants({ variant: "secondary", size: "sm" })}>
              Kembali ke Dasbor
            </Link>
          }
        />
      ) : (
        <TableWrapper>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Order</TH>
                  <TH>Buyer</TH>
                  <TH>Toko</TH>
                  <TH className="text-right">Items</TH>
                  <TH>Metode</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Total</TH>
                  <TH>Tanggal</TH>
                </TR>
              </THead>
              <TBody>
                {orders.map((order) => (
                  <TR key={order.id}>
                    <TD className="font-mono tabular-nums">#{order.id.slice(-8)}</TD>
                    <TD className="text-neutral-500">{order.buyer.name}</TD>
                    <TD className="text-neutral-500">{order.store.storeName}</TD>
                    <TD className="text-right font-mono tabular-nums">{order.items.length}</TD>
                    <TD>{order.paymentMethod === "COD" ? "COD" : "Transfer"}</TD>
                    <TD>
                      <OrderStatusBadge status={order.status} label={statusLabel[order.status]} />
                    </TD>
                    <TD className="text-right font-mono tabular-nums">
                      {formatPrice(Number(order.totalAmount))}
                    </TD>
                    <TD className="text-xs text-neutral-500">
                      {new Date(order.createdAt).toLocaleDateString("id-ID")}
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
