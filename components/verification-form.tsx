"use client";

import { useActionState, useState } from "react";
import {
  submitVerificationAction,
  type VerificationActionState,
} from "@/features/verification/actions";

export function VerificationForm() {
  const [state, formAction, pending] = useActionState<VerificationActionState, FormData>(
    submitVerificationAction,
    {},
  );

  const [ktmUrl, setKtmUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const res = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: "verifications",
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
      setKtmUrl(publicUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="nim" className="mb-1 block text-sm font-medium">
          NIM
        </label>
        <input
          id="nim"
          name="nim"
          type="text"
          required
          placeholder="Contoh: 3122500001"
          className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Foto KTM</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          disabled={uploading}
          className="w-full text-sm"
        />
        {uploading && <p className="text-xs text-neutral-500">Mengupload...</p>}
        {uploadError && <p className="text-xs text-danger">{uploadError}</p>}
        {ktmUrl && (
          <div className="mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ktmUrl}
              alt="KTM"
              className="h-40 rounded border border-border object-cover"
            />
          </div>
        )}
        <input type="hidden" name="ktmImageUrl" value={ktmUrl} />
        <p className="mt-1 text-xs text-neutral-500">
          Foto KTM hanya dapat diakses Admin untuk verifikasi. Akses tercatat di audit log.
        </p>
      </div>

      {state.error && (
        <p className="rounded bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded bg-success/10 px-3 py-2 text-sm text-success">
          Pengajuan terkirim. Menunggu review Admin.
        </p>
      )}

      <button
        type="submit"
        disabled={pending || uploading || !ktmUrl}
        className="rounded-lg bg-brand-navy-900 px-4 py-2 font-medium text-white hover:bg-brand-navy-700 disabled:opacity-50"
      >
        {pending ? "Mengirim..." : "Ajukan Verifikasi"}
      </button>
    </form>
  );
}
