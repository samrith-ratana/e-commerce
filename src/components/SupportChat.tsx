"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, X, Send, Paperclip, Smile, User } from "lucide-react";

type ChatRole = "support" | "user";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  time: string;
};

type SupportChatProps = {
  mobile?: boolean;
  showLabel?: boolean;
  label?: string;
  className?: string;
};

type SendApiResponse = {
  success?: boolean;
  messageId?: number | null;
  error?: string;
};

type MessagesApiResponse = {
  messages?: Array<{
    id: string;
    role: ChatRole;
    text: string;
    createdAt: string;
  }>;
};

const introMessage: ChatMessage = {
  id: "intro",
  role: "support",
  text: "Hi! Send your issue and we will forward it to support on Telegram.",
  time: "Now",
};

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Now";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function SupportChat({ mobile = false, showLabel = false, label = "Support", className = "" }: SupportChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([introMessage]);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/support/telegram/messages", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) return;
      const data = (await res.json().catch(() => ({}))) as MessagesApiResponse;

      const mapped = (data.messages || []).map((item) => ({
        id: item.id,
        role: item.role,
        text: item.text,
        time: formatTime(item.createdAt),
      }));

      setChatHistory([introMessage, ...mapped]);
    } catch {
      // keep existing chat state on polling errors
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    loadMessages();
    const interval = setInterval(loadMessages, 5000);

    return () => clearInterval(interval);
  }, [isOpen, loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isSending]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() || isSending) return;

    const userText = message.trim();
    setMessage("");
    setIsSending(true);

    const localMsg: ChatMessage = {
      id: `local_${Date.now()}`,
      role: "user",
      text: userText,
      time: formatTime(new Date().toISOString()),
    };
    setChatHistory((prev) => [...prev, localMsg]);

    try {
      const response = await fetch("/api/support/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: userText }),
      });

      const data = (await response.json().catch(() => ({}))) as SendApiResponse;

      if (!response.ok || !data.success) {
        setChatHistory((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            role: "support",
            text: data.error || "Could not send message to support. Please try again.",
            time: formatTime(new Date().toISOString()),
          },
        ]);
        return;
      }

      await loadMessages();
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          id: `net_${Date.now()}`,
          role: "support",
          text: "Network error. Please try again.",
          time: formatTime(new Date().toISOString()),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative">
      {isOpen && (
        <div
          className={`absolute right-0 top-[calc(100%+8px)] z-[70] flex h-[460px] flex-col overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl ${
            mobile ? "w-[min(90vw,360px)]" : "w-80"
          }`}
        >
          <div className="flex items-center justify-between bg-[var(--primary-700)] p-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                <User size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold">Marketplace Help</h3>
                <p className="flex items-center gap-1 text-[10px] text-slate-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--state-success)]" />
                  Telegram Connected
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded p-1.5 transition hover:bg-white/10" aria-label="Close chat">
              <X size={16} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[var(--bg-canvas)] p-3">
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl p-2.5 text-xs leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "rounded-tr-none bg-[var(--action-600)] text-white"
                      : "rounded-tl-none border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-body)]"
                  }`}
                >
                  {msg.text}
                  <div className={`mt-1 text-[10px] opacity-70 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-xl rounded-tl-none border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5">
                  <span className="h-1 w-1 animate-bounce rounded-full bg-[var(--text-muted)]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:120ms]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:240ms]" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
            <div className="flex items-center gap-1 rounded-lg bg-[var(--bg-muted)] px-2 py-1">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask support..."
                className="min-h-10 flex-1 bg-transparent px-2 text-xs text-[var(--text-body)] outline-none placeholder:text-[var(--text-muted)]"
              />
              <button type="button" className="rounded p-1.5 text-[var(--text-muted)] transition hover:bg-white hover:text-[var(--action-600)]">
                <Smile size={14} />
              </button>
              <button
                type="submit"
                disabled={!message.trim() || isSending}
                className="rounded p-1.5 text-[var(--action-600)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </div>

            <div className="mt-2 px-1">
              <button type="button" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--action-600)]">
                <Paperclip size={12} /> Attach
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`relative inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-[var(--text-muted)] transition hover:bg-[var(--state-hover)] hover:text-[var(--action-600)] ${
          showLabel ? "min-w-0 px-4" : "min-w-11"
        } ${isOpen ? "text-[var(--action-600)]" : ""} ${className}`.trim()}
        aria-label="Toggle support chat"
      >
        {isOpen ? <X size={18} /> : <MessageSquare size={18} />}
        {showLabel ? <span className="text-sm font-semibold leading-none">{label}</span> : null}
        {!isOpen && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[var(--state-danger)]" />}
      </button>
    </div>
  );
}
