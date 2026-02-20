"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type SearchBarProps = {
  defaultValue: string;
  compact?: boolean;
  className?: string;
};

export default function SearchBar({ defaultValue, compact = false, className = "" }: SearchBarProps) {
  const [text, setText] = useState(defaultValue);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setText(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (text === defaultValue) return;

      const params = new URLSearchParams(searchParams.toString());
      if (text) params.set("q", text);
      else params.delete("q");

      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [text, router, searchParams, defaultValue]);

  return (
    <div className={`group relative mx-auto w-full max-w-2xl ${className}`.trim()}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search products"
        className={`app-input rounded-2xl pr-4 ${compact ? "!pl-10 py-2.5 text-sm" : "!pl-12 py-4 text-base"} ${
          compact ? "shadow-sm" : "shadow-lg"
        }`}
      />

      <div className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${compact ? "left-3" : "left-4"}`}>
        {isPending ? (
          <div className="h-4 w-6 rounded shimmer" />
        ) : (
          <svg className="h-5 w-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-4.3-4.3m1.3-5.2a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
          </svg>
        )}
      </div>
    </div>
  );
}
