"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";

export function UploadProofForm({ orderId, paymentId }: { orderId: string; paymentId?: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!proofUrl) {
      setError("Silakan upload bukti pembayaran terlebih dahulu");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}/upload-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofImageUrl: proofUrl, paymentId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal mengirim bukti");
      }
      router.push("/orders?proof=uploaded");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FileUpload
        folder="payments"
        value={proofUrl}
        onChange={(v) => setProofUrl(typeof v === "string" ? v : (v[0] ?? ""))}
        label="Foto Bukti Transfer"
        help="Upload screenshot/foto bukti transfer. Jelas terbaca."
      />

      {error && (
        <p
          role="alert"
          className="rounded-md bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
        >
          {error}
        </p>
      )}

      <Button type="submit" loading={submitting} disabled={!proofUrl} className="w-full">
        Kirim Bukti Pembayaran
      </Button>
    </form>
  );
}
