"use client";

import { useState } from "react";
import { deleteCategoryAction } from "@/features/catalog/actions";

type CategoryWithChildren = {
  id: string;
  name: string;
  parentId: string | null;
  icon: string | null;
  children: { id: string; name: string; _count?: { products: number } }[];
  _count?: { products: number };
};

export function CategoryManager({ categories }: { categories: CategoryWithChildren[] }) {
  const [items, setItems] = useState(categories);

  async function handleDelete(id: string) {
    if (!confirm("Hapus kategori ini?")) return;
    await deleteCategoryAction(id);
    setItems((prev) => prev.filter((c) => c.id !== id));
  }

  if (items.length === 0) {
    return <p className="text-sm text-neutral-500">Belum ada kategori.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((cat) => (
        <div key={cat.id} className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">{cat.name}</span>
            <button
              onClick={() => handleDelete(cat.id)}
              className="text-xs text-danger hover:underline"
            >
              Hapus
            </button>
          </div>
          <span className="text-xs text-neutral-500">{cat._count?.products ?? 0} produk</span>
          {cat.children.length > 0 && (
            <div className="ml-4 mt-2 space-y-1 border-l border-border pl-3">
              {cat.children.map((child) => (
                <div key={child.id} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">
                    {child.name} ({child._count?.products ?? 0})
                  </span>
                  <button
                    onClick={() => handleDelete(child.id)}
                    className="text-xs text-danger hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
