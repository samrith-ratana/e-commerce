"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const CATEGORIES = ["All", "Electronics", "Fashion", "Home", "Sports", "Toys", "Beauty"];

export default function CategoryFilter({ activeCategory }: { activeCategory: string }) {
  const searchParams = useSearchParams();

  return (
    <div className="sticky top-16 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 backdrop-blur">
      <div className="container-page overflow-x-auto">
        <div className="flex items-center gap-2 py-3">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat || (cat === "All" && !activeCategory);

            const params = new URLSearchParams(searchParams.toString());
            if (cat === "All") {
              params.delete("cat");
            } else {
              params.set("cat", cat);
            }

            return (
              <Link
                key={cat}
                href={`?${params.toString()}`}
                scroll={false}
                className={`whitespace-nowrap rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                  isActive
                    ? "border-[var(--primary-600)] bg-[var(--primary-600)] text-white"
                    : "border-[var(--border-subtle)] bg-[var(--bg-muted)] text-[var(--text-body)] hover:border-[var(--primary-500)] hover:bg-[var(--state-hover)]"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
