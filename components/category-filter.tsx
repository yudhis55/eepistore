"use client";

import { useSearchParams, useRouter } from "next/navigation";
import type { Category } from "@/lib/generated/prisma/client";

type CategoryWithChildren = Category & {
  children: (Category & { _count: { products: number } })[];
  _count: { products: number };
};

export function CategoryFilter({ categories }: { categories: CategoryWithChildren[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCat = searchParams.get("cat");

  function selectCategory(catId: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (catId) {
      params.set("cat", catId);
    } else {
      params.delete("cat");
    }
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div className="space-y-1">
      <h3 className="mb-3 text-sm font-semibold text-neutral-900">Kategori</h3>

      <button
        onClick={() => selectCategory(null)}
        className={`block w-full rounded px-2 py-1.5 text-left text-sm transition-colors ${
          !activeCat ? "bg-brand-navy-900 text-white" : "text-neutral-500 hover:bg-neutral-100"
        }`}
      >
        Semua Kategori
      </button>

      {categories.map((cat) => (
        <div key={cat.id}>
          <button
            onClick={() => selectCategory(cat.id)}
            className={`block w-full rounded px-2 py-1.5 text-left text-sm transition-colors ${
              activeCat === cat.id
                ? "bg-brand-navy-900 text-white"
                : "text-neutral-500 hover:bg-neutral-100"
            }`}
          >
            {cat.name}
            <span className="ml-1 text-xs opacity-60">({cat._count.products})</span>
          </button>

          {cat.children.length > 0 && (
            <div className="ml-3 border-l border-border pl-2">
              {cat.children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => selectCategory(child.id)}
                  className={`block w-full rounded px-2 py-1 text-left text-xs transition-colors ${
                    activeCat === child.id
                      ? "font-medium text-brand-navy-900"
                      : "text-neutral-500 hover:bg-neutral-100"
                  }`}
                >
                  {child.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
