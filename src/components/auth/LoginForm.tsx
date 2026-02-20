"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

interface LoginResponse {
  user?: { id: string; email: string };
  message?: string;
  error?: string;
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok || !data.user) {
        setError(data.message || data.error || "Invalid email or password.");
        return;
      }

      window.location.href = redirectPath;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card w-full max-w-md space-y-8 p-8 sm:p-10">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-black tracking-tight text-[var(--text-strong)]">
          Welcome <span className="text-[var(--action-600)]">Back</span>
        </h2>
        <p className="text-sm text-[var(--text-muted)]">Sign in to manage your store and products.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="app-input !pl-12"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Password</label>
            <Link href="/forgot-password" className="text-xs font-semibold text-[var(--action-600)] hover:text-[var(--action-700)]">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="app-input !pl-12"
              placeholder="********"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-[color:var(--state-danger)]/30 bg-red-50 px-4 py-3 text-sm font-semibold text-[var(--state-danger)]">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full gap-2 disabled:opacity-70">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <>Sign In <ArrowRight size={16} /></>}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--text-muted)]">
        New to OpenShop?{" "}
        <Link href="/signup" className="font-semibold text-[var(--action-600)] hover:text-[var(--action-700)]">
          Create account
        </Link>
      </p>
    </div>
  );
}

