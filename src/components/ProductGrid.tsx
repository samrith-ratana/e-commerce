"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Post } from "@/modules/services/Post-Service-v1";

type ApiError = {
  error?: string;
  message?: string;
};

export default function ProductGrid({ products }: { products: Post[] }) {
  const router = useRouter();
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [messageById, setMessageById] = useState<Record<string, string>>({});

  async function handleBuy(postId: string) {
    setBuyingId(postId);
    setMessageById((prev) => ({ ...prev, [postId]: "" }));

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ postId, quantity: 1 }),
      });

      if (response.status === 401) {
        const redirect = encodeURIComponent("/my-orders");
        window.location.href = `/login?redirect=${redirect}`;
        return;
      }

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as ApiError;
        setMessageById((prev) => ({
          ...prev,
          [postId]: data.error || data.message || "Unable to place order",
        }));
        return;
      }

      setMessageById((prev) => ({ ...prev, [postId]: "Order created" }));
      router.push("/my-orders");
      router.refresh();
    } catch {
      setMessageById((prev) => ({ ...prev, [postId]: "Network error" }));
    } finally {
      setBuyingId(null);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {products.map((product) => {
        const isOutOfStock = product.stock <= 0 || product.status === "sold_out";
        const isBuying = buyingId === product.id;

        return (
          <article
            key={product.id}
            className="group overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[var(--action-500)] hover:shadow-lg"
          >
            <Link
              href={`/product/${product.id}`}
              className="relative block aspect-square overflow-hidden bg-[var(--bg-muted)]"
            >
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-semibold text-[var(--text-muted)]">
                  No image
                </div>
              )}
            </Link>

            <div className="space-y-3 p-6">
              <Link href={`/product/${product.id}`} className="block">
                <h3 className="line-clamp-2 min-h-10 text-xl font-bold leading-tight text-[var(--text-strong)] group-hover:text-[var(--action-600)]">
                  {product.title}
                </h3>
              </Link>

              <div className="space-y-2">
                <div className="text-2xl font-medium text-[var(--action-600)]">${product.price.toFixed(2)}</div>
                <div className="flex items-center gap-2 text-sm font-normal text-[var(--text-muted)]">
                  <span className="rounded bg-[var(--bg-muted)] px-2 py-1">Free shipping</span>
                  <span>Stock: {product.stock}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleBuy(product.id)}
                  disabled={isBuying || isOutOfStock}
                  className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isOutOfStock ? "Sold out" : isBuying ? "Buying..." : "Buy now"}
                </button>
                {messageById[product.id] ? (
                  <p className="text-xs font-semibold text-[var(--state-danger)]">{messageById[product.id]}</p>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
