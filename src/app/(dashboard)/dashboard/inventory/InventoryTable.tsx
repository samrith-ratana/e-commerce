"use client";

import { Edit3, Trash2, Package } from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  title: string;
  status: string;
  price: number;
  stock: number;
}

export default function InventoryTable({ products, token }: { products: Product[]; token: string }) {
  const router = useRouter();

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete item.");
      }
    } catch {
      alert("An error occurred while deleting.");
    }
  };

  if (products.length === 0) {
    return (
      <tr>
        <td colSpan={5} className="px-4 py-16 text-center text-[var(--text-muted)]">
          <div className="flex flex-col items-center gap-2">
            <Package size={28} className="opacity-25" />
            <p className="text-sm font-medium">No products found in your inventory.</p>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      {products.map((p) => (
        <tr key={p.id} className="transition-colors hover:bg-[var(--state-hover)]">
          <td className="px-4 py-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--bg-muted)] text-[var(--text-muted)]">
                <Package size={16} />
              </div>
              <span className="font-semibold text-[var(--text-strong)]">{p.title}</span>
            </div>
          </td>
          <td className="px-4 py-3">
            <span
              className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase ${
                p.status === "published"
                  ? "border-[color:var(--state-success)]/30 bg-[color:var(--state-success)]/10 text-[var(--state-success)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-muted)] text-[var(--text-muted)]"
              }`}
            >
              {p.status}
            </span>
          </td>
          <td className="px-4 py-3 text-sm font-medium text-[var(--text-body)]">${p.price.toLocaleString()}</td>
          <td className="px-4 py-3 text-sm">
            <span className={`font-semibold ${p.stock < 5 ? "text-[var(--state-warning)]" : "text-[var(--text-body)]"}`}>{p.stock}</span>
          </td>
          <td className="px-4 py-3 text-right">
            <div className="flex justify-end gap-1">
              <button className="rounded-md p-2 text-[var(--text-muted)] transition hover:bg-[var(--state-hover)] hover:text-[var(--action-600)]">
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="rounded-md p-2 text-[var(--text-muted)] transition hover:bg-red-50 hover:text-[var(--state-danger)]"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
