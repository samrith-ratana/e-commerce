"use client";

import { useState } from "react";
import Image from "next/image";
import { Clock, XCircle } from "lucide-react";
import type { Order } from "@/modules/services/Order-Service-v1";

type FilterStatus = "all" | "created" | "cancelled";

type ApiError = {
  error?: string;
};

export default function BuyerOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const filteredOrders = filter === "all" ? orders : orders.filter((item) => item.status === filter);

  async function handleCancel(orderId: string) {
    setWorkingId(orderId);
    setError("");

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "cancel" }),
      });

      const data = (await response.json().catch(() => ({}))) as Order & ApiError;

      if (!response.ok) {
        setError(data.error || "Unable to cancel order");
        return;
      }

      setOrders((prev) => prev.map((item) => (item.id === orderId ? { ...item, ...data } : item)));
    } catch {
      setError("Network error");
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-[18px] font-semibold text-[var(--text-strong)]">My Orders</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">View and manage your purchase history.</p>
      </div>

      <div className="flex w-fit items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1">
        {(["all", "created", "cancelled"] as FilterStatus[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-md px-4 py-2 text-sm font-semibold capitalize transition ${
              filter === tab ? "bg-[var(--action-600)] text-white" : "text-[var(--text-body)] hover:bg-[var(--state-hover)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm font-semibold text-[var(--state-danger)]">{error}</p> : null}

      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const canCancel = order.status === "created";

            return (
              <div key={order.id} className="surface-card p-4">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                  <div className="flex w-full items-center gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-md border border-[var(--border-subtle)] bg-[var(--bg-muted)]">
                      {order.image ? <Image src={order.image} alt={order.title} fill className="object-cover" /> : null}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-table)]">{order.id}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <h3 className="text-sm font-semibold text-[var(--text-strong)]">{order.title}</h3>
                      <p className="text-xs text-[var(--text-muted)]">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-between border-t border-[var(--border-subtle)] pt-4 md:w-auto md:gap-8 md:border-0 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-table)]">Total</p>
                      <p className="text-xl font-semibold text-[var(--text-strong)]">${order.totalAmount.toFixed(2)}</p>
                    </div>
                    {canCancel ? (
                      <button
                        type="button"
                        onClick={() => handleCancel(order.id)}
                        disabled={workingId === order.id}
                        className="rounded-md border border-[var(--state-danger)]/40 px-3 py-1.5 text-xs font-bold uppercase text-[var(--state-danger)] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {workingId === order.id ? "Cancelling..." : "Cancel"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyOrders />
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const styles = {
    created: "border-[color:var(--action-500)]/30 bg-[color:var(--action-500)]/10 text-[var(--action-600)]",
    cancelled: "border-[color:var(--state-danger)]/30 bg-[color:var(--state-danger)]/10 text-[var(--state-danger)]",
  }[status];

  const icons = {
    created: <Clock size={12} />,
    cancelled: <XCircle size={12} />,
  }[status];

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${styles}`}>
      {icons} {status}
    </span>
  );
}

function EmptyOrders() {
  return (
    <div className="surface-card border-dashed py-16 text-center">
      <p className="text-sm font-semibold text-[var(--text-strong)]">No orders yet</p>
      <p className="mt-1 text-xs text-[var(--text-muted)]">Buy a product to see it here.</p>
    </div>
  );
}