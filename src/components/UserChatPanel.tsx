"use client";

import { useEffect, useMemo, useState } from "react";
import { Send, Users } from "lucide-react";

type ChatUser = {
  id: string;
  email: string;
};

type InboxItem = {
  conversationId: string;
  partnerId: string;
  partnerEmail: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  readAt?: string;
};

type ConversationResponse = {
  conversationId: string | null;
  partnerId: string;
  partnerEmail: string;
  messages: ChatMessage[];
};

function toTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Now";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function UserChatPanel({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [activeUserId, setActiveUserId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeUser = useMemo(() => users.find((user) => user.id === activeUserId) || null, [users, activeUserId]);

  async function loadUsersAndInbox() {
    setLoading(true);
    setError(null);

    try {
      const [usersRes, inboxRes] = await Promise.all([
        fetch("/api/chats/users", { credentials: "include", cache: "no-store" }),
        fetch("/api/chats", { credentials: "include", cache: "no-store" }),
      ]);

      if (!usersRes.ok || !inboxRes.ok) {
        throw new Error("Failed to load chat data");
      }

      const usersData = (await usersRes.json()) as { users?: ChatUser[] };
      const inboxData = (await inboxRes.json()) as { inbox?: InboxItem[] };

      const nextUsers = usersData.users || [];
      const nextInbox = inboxData.inbox || [];

      setUsers(nextUsers);
      setInbox(nextInbox);

      setActiveUserId((prev) => {
        if (prev && nextUsers.some((user) => user.id === prev)) return prev;
        if (nextInbox[0]?.partnerId) return nextInbox[0].partnerId;
        return nextUsers[0]?.id || "";
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load chat data");
    } finally {
      setLoading(false);
    }
  }

  async function loadConversation(userId: string) {
    if (!userId) {
      setMessages([]);
      return;
    }

    try {
      const response = await fetch(`/api/chats?with=${encodeURIComponent(userId)}`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load conversation");
      }

      const data = (await response.json()) as ConversationResponse;
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load conversation");
    }
  }

  async function handleSend() {
    if (!activeUserId || !draft.trim() || sending) return;

    const text = draft.trim();
    setDraft("");
    setSending(true);

    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ toUserId: activeUserId, text }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Failed to send message");
      }

      await Promise.all([loadConversation(activeUserId), loadUsersAndInbox()]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      setDraft(text);
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    loadUsersAndInbox();
  }, []);

  useEffect(() => {
    if (!activeUserId) return;
    loadConversation(activeUserId);

    const timer = setInterval(() => {
      loadConversation(activeUserId);
      loadUsersAndInbox();
    }, 5000);

    return () => clearInterval(timer);
  }, [activeUserId]);

  return (
    <div className="surface-card grid h-full min-h-0 grid-cols-1 overflow-hidden lg:grid-cols-[320px_1fr]">
      <aside className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] lg:border-b-0 lg:border-r">
        <div className="border-b border-[var(--border-subtle)] px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--text-body)]">
            <Users size={16} /> People
          </h2>
        </div>

        <div className="max-h-72 overflow-y-auto lg:max-h-none lg:h-[calc(100%-57px)]">
          {loading && users.length === 0 ? (
            <p className="p-4 text-sm text-[var(--text-muted)]">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="p-4 text-sm text-[var(--text-muted)]">No users available.</p>
          ) : (
            users.map((user) => {
              const inboxItem = inbox.find((item) => item.partnerId === user.id);
              const isActive = activeUserId === user.id;

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setActiveUserId(user.id)}
                  className={`block w-full border-b border-[var(--border-subtle)] px-4 py-3 text-left transition ${
                    isActive ? "bg-[var(--action-100)]" : "hover:bg-[var(--bg-muted)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-[var(--text-strong)]">{user.email}</p>
                    {inboxItem?.unreadCount ? (
                      <span className="rounded-full bg-[var(--action-600)] px-2 py-0.5 text-[10px] font-bold text-white">
                        {inboxItem.unreadCount}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-[var(--text-muted)]">
                    {inboxItem?.lastMessage || "Start a conversation"}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section className="flex min-h-0 flex-1 flex-col bg-[var(--bg-canvas)]">
        <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-3">
          <h3 className="text-sm font-bold text-[var(--text-strong)]">
            {activeUser ? `Chat with ${activeUser.email}` : "Select a user"}
          </h3>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          {error ? (
            <p className="rounded-lg border border-[color:var(--state-danger)]/30 bg-red-50 px-3 py-2 text-sm text-[var(--state-danger)]">
              {error}
            </p>
          ) : null}

          {!activeUser ? (
            <p className="text-sm text-[var(--text-muted)]">Choose a user from the left to start chatting.</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No messages yet. Send the first one.</p>
          ) : (
            messages.map((message) => {
              const isMine = message.senderId === currentUserId;
              return (
                <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      isMine
                        ? "rounded-tr-sm bg-[var(--action-600)] text-white"
                        : "rounded-tl-sm border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-body)]"
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className={`mt-1 text-[10px] ${isMine ? "text-white/75" : "text-[var(--text-muted)]"}`}>
                      {toTimeLabel(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={activeUser ? "Type your message..." : "Select a user first"}
              disabled={!activeUser || sending}
              className="app-input !rounded-xl !py-2.5"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!activeUser || !draft.trim() || sending}
              className="btn-primary min-h-11 min-w-11 rounded-xl px-3 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

