import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { notFound } from "next/navigation";
import { UploadProofForm } from "@/components/upload-proof-form";
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
      <main className="container mx-auto px-4 py-8">
        <p className="text-neutral-500">Pesanan ini tidak memerlukan upload bukti pembayaran.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-2xl font-bold text-brand-navy-900">Upload Bukti Pembayaran</h1>
        <p className="mb-6 text-sm text-neutral-500">
          Order #{order.id.slice(-8)} — {order.store.storeName}
        </p>
        <UploadProofForm orderId={order.id} paymentId={order.payment?.id} />
      </div>
    </main>
  );
}
