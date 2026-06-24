import { getMessages } from "@/features/chat/actions";
import { notFound } from "next/navigation";
import { ChatWindow } from "@/components/chat-window";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat — EEPISTORE",
};

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let data;
  try {
    data = await getMessages(id);
  } catch {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Link href="/chat" className="mb-4 inline-block text-sm text-neutral-500 hover:underline">
        ← Kembali ke Pesan
      </Link>
      <ChatWindow
        conversationId={data.conversation.id}
        storeName={data.conversation.store.storeName}
        messages={data.messages}
        currentUserId={data.currentUserId}
      />
    </main>
  );
}
