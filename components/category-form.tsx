"use client";

import { useActionState } from "react";
import { createCategoryAction, type CategoryActionState } from "@/features/catalog/actions";
import { Input, Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Category = { id: string; name: string };

export function CategoryForm({ categories }: { categories: Category[] }) {
  const [, formAction, pending] = useActionState<CategoryActionState, FormData>(
    createCategoryAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      <FormField label="Nama Kategori" htmlFor="cat-name" required>
        <Input
          id="cat-name"
          name="name"
          type="text"
          required
          placeholder="cth. Alat & Komponen Praktikum"
        />
      </FormField>

      <FormField label="Kategori Induk (opsional)" htmlFor="cat-parent">
        <Select id="cat-parent" name="parentId" defaultValue="">
          <option value="">Kategori utama (tanpa induk)</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Ikon (opsional)" htmlFor="cat-icon" help="Nama ikon, mis. cpu, book, shirt">
        <Input id="cat-icon" name="icon" type="text" placeholder="cpu" />
      </FormField>

      <Button type="submit" loading={pending}>
        {pending ? "Menambah…" : "Tambah Kategori"}
      </Button>
    </form>
  );
}
