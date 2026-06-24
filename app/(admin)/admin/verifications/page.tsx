import { getPendingVerifications } from "@/features/verification/actions";
import { VerificationReview } from "@/components/verification-review";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verifikasi Student — Admin",
};

export default async function AdminVerificationsPage() {
  const verifications = await getPendingVerifications();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy-900">
        Verifikasi Student Badge ({verifications.length})
      </h1>

      {verifications.length === 0 ? (
        <div className="rounded-lg border border-border bg-neutral-100 p-12 text-center">
          <p className="text-neutral-500">Tidak ada pengajuan verifikasi pending.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {verifications.map((v) => (
            <VerificationReview key={v.id} verification={v} />
          ))}
        </div>
      )}
    </main>
  );
}
