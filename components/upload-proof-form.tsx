"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UploadProofForm({ orderId, paymentId }: { orderId: string; paymentId?: string }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const res = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: "payments",
          fileSize: file.size,
        }),
      });

      if (!res.ok) throw new Error("Gagal generate upload URL");
      const { uploadUrl, publicUrl } = await res.json();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) throw new Error("Gagal upload file");
      setProofUrl(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  }

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
      <div>
        <label className="mb-1 block text-sm font-medium">Foto Bukti Transfer</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          disabled={uploading}
          className="w-full text-sm"
        />
        {uploading && <p className="mt-1 text-xs text-neutral-500">Mengupload...</p>}
        {proofUrl && (
          <div className="mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={proofUrl}
              alt="Bukti pembayaran"
              className="h-32 rounded border border-border object-cover"
            />
          </div>
        )}
      </div>

      {error && <p className="rounded bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={submitting || uploading || !proofUrl}
        className="w-full rounded-lg bg-brand-navy-900 px-4 py-2.5 font-medium text-white hover:bg-brand-navy-700 disabled:opacity-50"
      >
        {submitting ? "Mengirim..." : "Kirim Bukti Pembayaran"}
      </button>
    </form>
  );
}
