import { getPendingVerifications } from "@/features/verification/actions";
import { VerificationReview } from "@/components/verification-review";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verifikasi Student — Admin",
};

export default async function AdminVerificationsPage() {
  const verifications = await getPendingVerifications();

  return (
    <>
      <PageHeader
        title="Verifikasi Student Badge"
        description={`Tinjau pengajuan verifikasi mahasiswa — ${verifications.length} pending`}
      />

      {verifications.length === 0 ? (
        <EmptyState
          title="Tidak ada pengajuan pending"
          description="Belum ada pengajuan verifikasi student badge yang menunggu tinjauan."
          action={
            <Link href="/admin" className={buttonVariants({ variant: "primary" })}>
              Kembali ke Dasbor
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {verifications.map((v) => (
            <VerificationReview key={v.id} verification={v} />
          ))}
        </div>
      )}
    </>
  );
}
