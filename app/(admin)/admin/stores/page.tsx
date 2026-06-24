import { prisma } from "@/lib/prisma";
import { StoreActions } from "@/components/store-actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelola Toko — Admin EEPISTORE",
};

export default async function AdminStoresPage() {
  const stores = await prisma.storeProfile.findMany({
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy-900">Kelola Toko</h1>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3">Toko</th>
              <th className="px-4 py-3">Pemilik</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <p className="font-medium">{store.storeName}</p>
                  {store.description && (
                    <p className="line-clamp-1 text-xs text-neutral-500">{store.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {store.user.name}
                  <br />
                  <span className="text-xs">{store.user.email}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      store.status === "APPROVED"
                        ? "bg-success/20 text-success"
                        : store.status === "PENDING"
                          ? "bg-warning/20 text-warning"
                          : store.status === "REJECTED"
                            ? "bg-danger/20 text-danger"
                            : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {store.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {store.status === "PENDING" && <StoreActions storeId={store.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
