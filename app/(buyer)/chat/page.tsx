import { getConversations } from "@/features/chat/actions";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pesan — EEPISTORE",
};

export default async function ChatListPage() {
  const conversations = await getConversations();

  return (
    <>
      <PageHeader title="Pesan" description="Percakapan Anda dengan toko penjual." />

      {conversations.length === 0 ? (
        <EmptyState
          title="Belum ada percakapan"
          description="Mulai percakapan dengan toko dari halaman produk untuk bertanya sebelum membeli."
          action={
            <Link className={buttonVariants({ variant: "primary" })} href="/products">
              Mulai Belanja
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/chat/${c.id}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy-700"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy-900 text-sm font-medium text-white">
                {c.store.storeName?.[0] ?? "S"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{c.store.storeName}</p>
                  {c.unreadCount > 0 && (
                    <Badge variant="danger" className="shrink-0">
                      {c.unreadCount}
                    </Badge>
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
    </>
  );
}
