import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { notFound } from "next/navigation";
import { UploadProofForm } from "@/components/upload-proof-form";
import { PageHeader, Breadcrumb } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload Bukti Pembayaran — EEPISTORE",
};

export default async function UploadProofPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAuth();

  const order = await prisma.order.findFirst({
    where: { id, buyerId: session.user.id },
    include: {
      store: { select: { storeName: true } },
      payment: true,
    },
  });

  if (!order) notFound();

  if (order.status !== "MENUNGGU_PEMBAYARAN") {
    return (
      <>
        <PageHeader
          title="Upload Bukti Pembayaran"
          breadcrumb={
            <Breadcrumb
              items={[
                { label: "Pesanan Saya", href: "/orders" },
                { label: `#${order.id.slice(-8)}`, href: `/orders/${order.id}` },
                { label: "Upload Bukti" },
              ]}
            />
          }
        />
        <EmptyState
          title="Tidak perlu upload bukti"
          description="Pesanan ini tidak memerlukan upload bukti pembayaran."
          action={
            <Link className={buttonVariants({ variant: "secondary" })} href={`/orders/${order.id}`}>
              Kembali ke Pesanan
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Upload Bukti Pembayaran"
        description={`Order #${order.id.slice(-8)} — ${order.store.storeName}`}
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Pesanan Saya", href: "/orders" },
              { label: `#${order.id.slice(-8)}`, href: `/orders/${order.id}` },
              { label: "Upload Bukti" },
            ]}
          />
        }
      />
      <div className="mx-auto max-w-md">
        <Card>
          <CardBody>
            <UploadProofForm orderId={order.id} paymentId={order.payment?.id} />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
