"use client";

import { useState, useActionState } from "react";
import { updateProductAction, type ProductActionState } from "@/features/product/actions";
import { FileUpload } from "@/components/ui/file-upload";
import { Input, Textarea, Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Category = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  description: string | null;
  price: { toNumber: () => number };
  stock: number;
  condition: string;
  status: string;
  categoryId: string | null;
  images: { id: string; imageUrl: string }[];
  variants: unknown[];
};

export function ProductEditForm({
  product,
  categories,
}: {
  product: Product;
  categories: Category[];
}) {
  const [state, formAction, pending] = useActionState<ProductActionState, FormData>(
    (prev, formData) => updateProductAction(product.id, prev, formData),
    {},
  );
  const [imageUrls, setImageUrls] = useState<string[]>(product.images.map((img) => img.imageUrl));

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <FormField label="Nama Produk" htmlFor="name" required>
        <Input id="name" name="name" type="text" required defaultValue={product.name} />
      </FormField>

      <FormField label="Deskripsi (opsional)" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={product.description ?? ""} />
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
            defaultValue={product.price.toNumber()}
          />
        </FormField>
        <FormField label="Stok" htmlFor="stock" required>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            required
            defaultValue={product.stock}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Kondisi" htmlFor="condition">
          <Select id="condition" name="condition" defaultValue={product.condition}>
            <option value="NEW">Baru</option>
            <option value="PRELOVED">Preloved</option>
          </Select>
        </FormField>
        <FormField label="Kategori" htmlFor="categoryId">
          <Select id="categoryId" name="categoryId" defaultValue={product.categoryId ?? ""}>
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
        <Select id="status" name="status" defaultValue={product.status}>
          <option value="ACTIVE">Aktif (tampilkan)</option>
          <option value="DRAFT">Draft (sembunyikan)</option>
          <option value="INACTIVE">Nonaktif</option>
        </Select>
      </FormField>

      <FileUpload
        folder="products"
        multiple
        value={imageUrls}
        onChange={(v) => setImageUrls(Array.isArray(v) ? v : [v])}
        label="Foto Produk"
        help="Foto pertama jadi sampul. Bisa tambah/hapus."
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

      <Button type="submit" loading={pending} className="w-full sm:w-auto">
        Update Produk
      </Button>
    </form>
  );
}
