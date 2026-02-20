"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { Order, SalesOrder } from "@/modules/services/Order-Service-v1";

type Tab = "sales" | "purchases";

export default function DashboardOrdersTabs({
  salesOrders,
  purchaseOrders,
}: {
  salesOrders: SalesOrder[];
  purchaseOrders: Order[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("sales");

  const orders = useMemo(
    () => (activeTab === "sales" ? salesOrders : purchaseOrders),
    [activeTab, salesOrders, purchaseOrders]
  );

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[var(--text-strong)]">Order Management</h1>
        <p className="text-sm text-[var(--text-muted)]">Track sales orders and your own purchases.</p>
      </div>

      <div className="flex w-fit items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1">
        <button
          type="button"
          onClick={() => setActiveTab("sales")}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            activeTab === "sales" ? "bg-[var(--action-600)] text-white" : "text-[var(--text-body)] hover:bg-[var(--state-hover)]"
          }`}
        >
          Sales Orders ({salesOrders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("purchases")}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            activeTab === "purchases" ? "bg-[var(--action-600)] text-white" : "text-[var(--text-body)] hover:bg-[var(--state-hover)]"
          }`}
        >
          My Purchases ({purchaseOrders.length})
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="surface-card py-10 text-center">
          <p className="text-sm font-semibold text-[var(--text-strong)]">No orders yet</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {activeTab === "sales"
              ? "When customers buy your items, sales appear here."
              : "Your purchases will appear here after checkout."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isSalesTab = activeTab === "sales";
            const salesOrder = order as SalesOrder;

            return (
              <article
                key={order.id}
                className="surface-card flex flex-col items-center justify-between gap-6 p-5 md:flex-row md:p-6"
              >
                <div className="flex w-full items-center gap-4 md:w-auto">
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-muted)]">
                    {order.image ? <Image src={order.image} alt={order.title} fill className="object-cover" /> : null}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-strong)]">{order.title}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                      {order.id} {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    {isSalesTab ? (
                      <p className="mt-1 text-xs text-[var(--text-body)]">
                        Customer: <span className="font-semibold">{salesOrder.buyerEmail}</span>
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      Qty: {order.quantity} x ${order.unitPrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex w-full items-center justify-between border-t border-[var(--border-subtle)] pt-4 md:w-auto md:gap-12 md:border-t-0 md:pt-0">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Total</p>
                    <p className="text-lg font-black text-[var(--text-strong)]">${order.totalAmount.toFixed(2)}</p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      order.status === "created"
                        ? "bg-[color:var(--action-500)]/10 text-[var(--action-600)]"
                        : "bg-[color:var(--state-danger)]/10 text-[var(--state-danger)]"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
