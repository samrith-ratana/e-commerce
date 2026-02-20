import Link from "next/link";
import { postService } from "@/modules/services/Post-Service-v1";
import { orderService } from "@/modules/services/Order-Service-v1";
import { ShoppingCart, DollarSign, Package, BarChart3 } from "lucide-react";
import { requireCurrentUser } from "@/lib/auth/currentUser";

function toCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

export default async function DashboardPage() {
  const user = await requireCurrentUser("/dashboard");
  const myPosts = postService.getPostsByAuthor(user.id);
  const salesOrders = orderService.getSalesOrdersBySeller(user.id);
  const purchaseOrders = orderService.getOrdersByBuyer(user.id);

  const activeListings = myPosts.filter((post) => post.status === "published" && post.stock > 0).length;
  const salesCompleted = salesOrders.filter((order) => order.status === "created");
  const totalRevenue = salesCompleted.reduce((sum, order) => sum + order.totalAmount, 0);

  const stats = [
    { label: "Total Revenue", value: toCurrency(totalRevenue), icon: DollarSign, color: "bg-[var(--action-100)] text-[var(--action-600)]" },
    { label: "Active Listings", value: activeListings, icon: Package, color: "bg-[var(--bg-muted)] text-[var(--text-body)]" },
    { label: "Sales Orders", value: salesCompleted.length, icon: BarChart3, color: "bg-[color:var(--state-success)]/10 text-[var(--state-success)]" },
    { label: "My Purchases", value: purchaseOrders.length, icon: ShoppingCart, color: "bg-[var(--tertiary-100)] text-[var(--tertiary-700)]" },
  ];

  const recentSales = salesOrders.slice(0, 5);
  const recentPurchases = purchaseOrders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-strong)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Welcome back, {user.email}. Here is what is happening with your shop today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="surface-card p-4">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-md ${stat.color}`}>
              <stat.icon size={18} />
            </div>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-table)]">{stat.label}</p>
            <p className="mt-1 text-[18px] font-semibold text-[var(--text-strong)]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="surface-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-4">
            <h2 className="text-sm font-semibold text-[var(--text-strong)]">Recent Sales</h2>
            <Link href="/dashboard/orders" className="text-sm font-semibold text-[var(--action-600)] hover:text-[var(--action-700)]">View All</Link>
          </div>
          <div className="p-4">
            {recentSales.length === 0 ? (
              <p className="py-2 text-center text-xs text-[var(--text-muted)]">No sales yet.</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-wide text-[var(--text-table)]">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentSales.map((order) => (
                    <tr key={order.id} className="border-t border-[var(--border-subtle)]">
                      <td className="py-3 font-medium text-[var(--text-strong)]">{order.title}</td>
                      <td className="py-3 text-[var(--text-body)]">{order.buyerEmail}</td>
                      <td className="py-3 text-[var(--text-body)]">{toCurrency(order.totalAmount)}</td>
                      <td className="py-3 text-right">
                        <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase ${order.status === "created" ? "bg-[color:var(--state-success)]/10 text-[var(--state-success)]" : "bg-[color:var(--state-danger)]/10 text-[var(--state-danger)]"}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="surface-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-4">
            <h2 className="text-sm font-semibold text-[var(--text-strong)]">Recent Purchases</h2>
            <Link href="/my-orders" className="text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-body)]">History</Link>
          </div>
          <div className="p-4">
            {recentPurchases.length === 0 ? (
              <p className="py-2 text-center text-xs text-[var(--text-muted)]">No recent purchases to display.</p>
            ) : (
              <div className="space-y-3">
                {recentPurchases.map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] p-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-strong)]">{order.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[var(--text-strong)]">{toCurrency(order.totalAmount)}</p>
                      <p className="text-xs uppercase text-[var(--text-muted)]">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
