"use client";

import { useState, useTransition, useRef, useEffect } from "react";

type Message = {
  id: string;
  content: string;
  createdAt: string | Date;
  sender: { id: string; name: string };
};

export function ChatWindow({
  conversationId,
  storeName,
  messages: initialMessages,
  currentUserId,
}: {
  conversationId: string;
  storeName: string;
  messages: Message[];
  currentUserId: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    // Optimistic update
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      content,
      createdAt: new Date(),
      sender: { id: currentUserId, name: "You" },
    };
    setMessages((prev) => [...prev, tempMsg]);
    const sentContent = content;
    setContent("");

    startTransition(async () => {
      const formData = new FormData();
      formData.set("storeId", ""); // Not needed for existing conversation
      formData.set("content", sentContent);
      // We need a different approach - use the conversation directly
      const res = await fetch(`/api/chat/${conversationId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: sentContent }),
      });

      if (res.ok) {
        const data = await res.json();
        // Replace temp message with real one
        setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? data.message : m)));
      }
    });
  }

  return (
    <div className="flex h-[600px] flex-col rounded-lg border border-border">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <p className="font-medium">{storeName}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-neutral-500">Mulai percakapan...</p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender.id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                    isOwn ? "bg-brand-navy-900 text-white" : "bg-neutral-100 text-neutral-900"
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-medium text-neutral-500">{msg.sender.name}</p>
                  )}
                  <p>{msg.content}</p>
                  <p className={`mt-0.5 text-xs ${isOwn ? "text-white/60" : "text-neutral-500"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-3">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ketik pesan..."
          maxLength={2000}
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-navy-700"
        />
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="rounded-lg bg-brand-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-700 disabled:opacity-50"
        >
          Kirim
        </button>
      </form>
    </div>
  );
}
