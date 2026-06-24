"use client";

import { useActionState, useState } from "react";
import { createBannerAction, type BannerActionState } from "@/features/banner/actions";

export function BannerForm() {
  const [state, formAction, pending] = useActionState<BannerActionState, FormData>(
    createBannerAction,
    {},
  );

  const [imageUrl, setImageUrl] = useState("");
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
          folder: "products",
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
      setImageUrl(publicUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium">Judul</label>
        <input
          name="title"
          type="text"
          required
          className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Gambar Banner</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          disabled={uploading}
          className="w-full text-sm"
        />
        {uploading && <p className="text-xs text-neutral-500">Mengupload...</p>}
        {uploadError && <p className="text-xs text-danger">{uploadError}</p>}
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="Banner preview"
            className="mt-2 w-full rounded border border-border"
          />
        )}
        <input type="hidden" name="imageUrl" value={imageUrl} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Link URL (opsional)</label>
        <input
          name="linkUrl"
          type="url"
          placeholder="/products"
          className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Posisi</label>
          <input
            name="position"
            type="number"
            min="0"
            defaultValue={0}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" value="true" defaultChecked />
            Aktif
          </label>
        </div>
      </div>

      {state.error && (
        <p className="rounded bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded bg-success/10 px-3 py-2 text-sm text-success">Banner dibuat.</p>
      )}

      <button
        type="submit"
        disabled={pending || uploading || !imageUrl}
        className="rounded-lg bg-brand-navy-900 px-4 py-2 font-medium text-white hover:bg-brand-navy-700 disabled:opacity-50"
      >
        {pending ? "Menyimpan..." : "Simpan Banner"}
      </button>
    </form>
  );
}
