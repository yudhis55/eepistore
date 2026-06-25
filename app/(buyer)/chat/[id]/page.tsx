import { getMessages } from "@/features/chat/actions";
import { notFound } from "next/navigation";
import { ChatWindow } from "@/components/chat-window";
import { PageHeader, Breadcrumb } from "@/components/ui/page-header";
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
    <>
      <PageHeader
        title={data.conversation.store.storeName}
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Pesan", href: "/chat" },
              { label: data.conversation.store.storeName },
            ]}
          />
        }
      />
      <ChatWindow
        conversationId={data.conversation.id}
        storeName={data.conversation.store.storeName}
        messages={data.messages}
        currentUserId={data.currentUserId}
      />
    </>
  );
}
