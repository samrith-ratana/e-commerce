"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, Loader2, ShieldCheck } from "lucide-react";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Something went wrong");
      }

      window.location.href = "/dashboard?welcome=true";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card w-full max-w-md space-y-8 p-8 sm:p-10">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-black tracking-tight text-[var(--text-strong)]">
          Create <span className="text-[var(--action-600)]">Account</span>
        </h2>
        <p className="text-sm text-[var(--text-muted)]">Set up your account and start listing products.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Full Name</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input
              type="text"
              required
              className="app-input !pl-12"
              placeholder="John Doe"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input
              type="email"
              required
              className="app-input !pl-12"
              placeholder="john@example.com"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input
              type="password"
              required
              minLength={8}
              className="app-input !pl-12"
              placeholder="Min. 8 characters"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        {error && <p className="rounded-xl border border-[color:var(--state-danger)]/30 bg-red-50 p-3 text-sm font-semibold text-[var(--state-danger)]">{error}</p>}

        <div className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
          <ShieldCheck size={14} className="mt-0.5 text-[var(--state-success)]" />
          <span>By signing up, you agree to our Terms and Data Policy.</span>
        </div>

        <button disabled={loading} className="btn-primary w-full gap-2 disabled:opacity-70">
          {loading ? <Loader2 className="animate-spin" size={18} /> : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--text-muted)]">
        Already a member?{" "}
        <Link href="/login" className="font-semibold text-[var(--action-600)] hover:text-[var(--action-700)]">
          Sign In
        </Link>
      </p>
    </div>
  );
}

