import { getConversations } from "@/features/chat/actions";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pesan — EEPISTORE",
};

export default async function ChatListPage() {
  const conversations = await getConversations();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy-900">Pesan</h1>

      {conversations.length === 0 ? (
        <div className="rounded-lg border border-border bg-neutral-100 p-12 text-center">
          <p className="text-neutral-500">Belum ada percakapan.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-brand-navy-900 px-4 py-2 font-medium text-white hover:bg-brand-navy-700"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/chat/${c.id}`}
              className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-neutral-100"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy-900 text-sm font-medium text-white">
                {c.store.storeName?.[0] ?? "S"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium">{c.store.storeName}</p>
                  {c.unreadCount > 0 && (
                    <span className="ml-2 rounded-full bg-danger px-2 py-0.5 text-xs text-white">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
                {c.messages[0] && (
                  <p className="truncate text-xs text-neutral-500">{c.messages[0].content}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
