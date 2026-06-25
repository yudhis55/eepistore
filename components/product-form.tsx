"use client";

import { useState, useActionState } from "react";
import { createProductAction, type ProductActionState } from "@/features/product/actions";
import { FileUpload } from "@/components/ui/file-upload";
import { Input, Textarea, Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Category = { id: string; name: string };

export function ProductForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState<ProductActionState, FormData>(
    createProductAction,
    {},
  );
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <FormField label="Nama Produk" htmlFor="name" required>
        <Input
          id="name"
          name="name"
          type="text"
          required
          placeholder="cth. Arduino Uno R3 + Kabel USB"
        />
      </FormField>

      <FormField label="Deskripsi" htmlFor="description">
        <Textarea
          id="description"
          name="description"
          placeholder="Kondisi, kelengkapan, catatan untuk pembeli…"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Harga (Rp)" htmlFor="price" required>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="500"
            required
            placeholder="85000"
          />
        </FormField>
        <FormField label="Stok" htmlFor="stock" required>
          <Input id="stock" name="stock" type="number" min="0" required defaultValue="1" />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Kondisi" htmlFor="condition">
          <Select id="condition" name="condition" defaultValue="NEW">
            <option value="NEW">Baru</option>
            <option value="PRELOVED">Preloved</option>
          </Select>
        </FormField>
        <FormField label="Kategori" htmlFor="categoryId">
          <Select id="categoryId" name="categoryId" defaultValue="">
            <option value="">Pilih kategori…</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Status" htmlFor="status">
        <Select id="status" name="status" defaultValue="ACTIVE">
          <option value="ACTIVE">Aktif (tampilkan)</option>
          <option value="DRAFT">Draft (sembunyikan)</option>
        </Select>
      </FormField>

      {/* Image upload — react-dropzone, multiple, presigned URL */}
      <FileUpload
        folder="products"
        multiple
        value={imageUrls}
        onChange={(v) => setImageUrls(Array.isArray(v) ? v : [v])}
        label="Foto Produk"
        help="Tambahkan hingga 8 foto. Foto pertama jadi sampul."
        disabled={imageUrls.length >= 8}
      />
      <input type="hidden" name="images" value={JSON.stringify(imageUrls)} />
      <input type="hidden" name="variants" value="[]" />

      {state.error && (
        <p
          role="alert"
          className="rounded-md bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
        >
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        loading={pending}
        disabled={imageUrls.length === 0}
        className="w-full sm:w-auto"
      >
        Simpan Produk
      </Button>
    </form>
  );
}
