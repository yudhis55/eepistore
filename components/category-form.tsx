"use client";

import { useActionState } from "react";
import { createCategoryAction, type CategoryActionState } from "@/features/catalog/actions";

type Category = { id: string; name: string };

export function CategoryForm({ categories }: { categories: Category[] }) {
  const [, formAction, pending] = useActionState<CategoryActionState, FormData>(
    createCategoryAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      <input
        name="name"
        type="text"
        required
        placeholder="Nama kategori"
        className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
      />
      <select
        name="parentId"
        className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
      >
        <option value="">Kategori utama (tanpa parent)</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      <input
        name="icon"
        type="text"
        placeholder="Icon name (opsional)"
        className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-navy-900 px-4 py-2 font-medium text-white hover:bg-brand-navy-700 disabled:opacity-50"
      >
        {pending ? "Menambah..." : "Tambah"}
      </button>
    </form>
  );
}
