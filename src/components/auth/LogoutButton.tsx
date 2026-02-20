"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

type LogoutButtonProps = {
  className?: string;
  compact?: boolean;
  showLabel?: boolean;
  label?: string;
};

export default function LogoutButton({
  className = "",
  compact = false,
  showLabel = false,
  label = "Logout",
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      router.push("/login");
      router.refresh();
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] text-sm font-semibold text-[var(--text-body)] transition hover:border-[var(--primary-500)] hover:bg-[var(--state-hover)] ${
          showLabel ? "min-w-0 px-4" : "min-w-11 p-3"
        } ${className}`.trim()}
      >
        <LogOut className="h-4 w-4" />
        {showLabel ? <span className="leading-none">{label}</span> : null}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-sm font-semibold text-[var(--text-body)] transition hover:bg-[var(--bg-muted)] disabled:opacity-60 ${className}`}
    >
      <LogOut className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
