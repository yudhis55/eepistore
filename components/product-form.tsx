"use client";

import { useState, useActionState } from "react";
import { createProductAction, type ProductActionState } from "@/features/product/actions";

type Category = { id: string; name: string };

export function ProductForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState<ProductActionState, FormData>(
    createProductAction,
    {},
  );

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError("");

    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
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
        newUrls.push(publicUrl);
      }
      setImageUrls((prev) => [...prev, ...newUrls]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(idx: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Nama Produk
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          Deskripsi (opsional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="mb-1 block text-sm font-medium">
            Harga (IDR)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            required
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
          />
        </div>

        <div>
          <label htmlFor="stock" className="mb-1 block text-sm font-medium">
            Stok
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            required
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="condition" className="mb-1 block text-sm font-medium">
            Kondisi
          </label>
          <select
            id="condition"
            name="condition"
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
          >
            <option value="NEW">Baru</option>
            <option value="PRELOVED">Preloved</option>
          </select>
        </div>

        <div>
          <label htmlFor="categoryId" className="mb-1 block text-sm font-medium">
            Kategori
          </label>
          <select
            id="categoryId"
            name="categoryId"
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
          >
            <option value="">Pilih kategori...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="status" className="mb-1 block text-sm font-medium">
          Status
        </label>
        <select
          id="status"
          name="status"
          className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
        >
          <option value="DRAFT">Draft (sembunyikan)</option>
          <option value="ACTIVE">Aktif (tampilkan)</option>
        </select>
      </div>

      {/* Image upload */}
      <div>
        <label className="mb-1 block text-sm font-medium">Foto Produk</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleUpload}
          disabled={uploading || imageUrls.length >= 8}
          className="w-full text-sm"
        />
        {uploadError && <p className="mt-1 text-xs text-danger">{uploadError}</p>}
        {uploading && <p className="mt-1 text-xs text-neutral-500">Mengupload...</p>}
        {imageUrls.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="relative h-20 w-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Foto ${idx + 1}`}
                  className="h-20 w-20 rounded border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs text-white"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
        <input type="hidden" name="images" value={JSON.stringify(imageUrls)} />
      </div>

      {/* Variants (simple JSON input for now) */}
      <input type="hidden" name="variants" value="[]" />

      {(state.error || !imageUrls.length) && state.error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending || uploading || imageUrls.length === 0}
        className="rounded-lg bg-brand-navy-900 px-6 py-2.5 font-medium text-white transition-colors hover:bg-brand-navy-700 disabled:opacity-50"
      >
        {pending ? "Menyimpan..." : "Simpan Produk"}
      </button>
    </form>
  );
}
