import { Users, ShoppingBag, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { requireCurrentUser } from "@/lib/auth/currentUser";
import { orderService } from "@/modules/services/Order-Service-v1";
import { postService } from "@/modules/services/Post-Service-v1";

type DailyPoint = {
  label: string;
  revenue: number;
};

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

export default async function ShopAnalyticsPage() {
  const user = await requireCurrentUser("/dashboard/shop");
  const salesOrders = orderService.getSalesOrdersBySeller(user.id);
  const completedSales = salesOrders.filter((order) => order.status === "created");
  const myPosts = postService.getPostsByAuthor(user.id);

  const now = new Date();
  const todayStart = startOfDay(now);

  const dailyData: DailyPoint[] = Array.from({ length: 7 }, (_, idx) => {
    const day = addDays(todayStart, idx - 6);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    const revenue = completedSales
      .filter((order) => {
        const created = new Date(order.createdAt);
        return created >= dayStart && created <= dayEnd;
      })
      .reduce((sum, order) => sum + order.totalAmount, 0);

    const label = day.toLocaleDateString(undefined, { weekday: "short" });
    return { label, revenue };
  });

  const current7Revenue = dailyData.reduce((sum, point) => sum + point.revenue, 0);

  const previous7Start = addDays(todayStart, -13);
  const previous7End = endOfDay(addDays(todayStart, -7));
  const previous7Revenue = completedSales
    .filter((order) => {
      const created = new Date(order.createdAt);
      return created >= previous7Start && created <= previous7End;
    })
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const growthRate =
    previous7Revenue <= 0
      ? current7Revenue > 0
        ? 100
        : 0
      : ((current7Revenue - previous7Revenue) / previous7Revenue) * 100;

  const uniqueCustomers = new Set(completedSales.map((order) => order.buyerId)).size;
  const ordersPerListing = myPosts.length > 0 ? completedSales.length / myPosts.length : 0;

  const maxDailyRevenue = Math.max(...dailyData.map((point) => point.revenue), 1);

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">Shop Performance</h1>
          <p className="text-sm text-[var(--text-muted)]">Real analytics generated from your listings and orders.</p>
        </div>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-semibold text-[var(--text-body)]">
          Last 7 days
        </div>
      </div>

      <div className="surface-card p-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--text-muted)]">Total Revenue (All Time)</p>
            <h2 className="text-4xl font-black text-[var(--text-strong)]">
              {toCurrency(completedSales.reduce((sum, order) => sum + order.totalAmount, 0))}
            </h2>
          </div>
          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1 text-sm font-bold ${
                growthRate >= 0 ? "text-[var(--state-success)]" : "text-[var(--state-danger)]"
              }`}
            >
              {growthRate >= 0 ? <ArrowUpRight size={17} /> : <ArrowDownRight size={17} />}
              {growthRate >= 0 ? "+" : ""}
              {growthRate.toFixed(1)}%
            </span>
            <p className="text-xs text-[var(--text-muted)]">last 7 days vs previous 7 days</p>
          </div>
        </div>

        <div className="flex h-52 items-end gap-2 md:gap-3">
          {dailyData.map((point, i) => {
            const heightPercent = Math.max((point.revenue / maxDailyRevenue) * 100, point.revenue > 0 ? 8 : 4);

            return (
              <div key={i} className="group relative flex-1 cursor-pointer rounded-t-lg bg-[var(--bg-muted)]">
                <div
                  style={{ height: `${heightPercent}%`, backgroundColor: "var(--viz-2)" }}
                  className="w-full rounded-t-lg transition-opacity group-hover:opacity-85"
                />
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-[var(--primary-700)] px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {toCurrency(point.revenue)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          {dailyData.map((point) => (
            <span key={point.label}>{point.label}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="surface-card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--text-strong)]">
            <Users size={18} className="text-[var(--viz-3)]" /> Unique Customers
          </h3>
          <p className="text-3xl font-black text-[var(--text-strong)]">
            {uniqueCustomers} <span className="text-sm font-medium text-[var(--text-muted)]">buyers</span>
          </p>
        </div>

        <div className="surface-card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--text-strong)]">
            <ShoppingBag size={18} className="text-[var(--viz-2)]" /> Orders Per Listing
          </h3>
          <p className="text-3xl font-black text-[var(--text-strong)]">
            {ordersPerListing.toFixed(2)} <span className="text-sm font-medium text-[var(--text-muted)]">avg</span>
          </p>
        </div>
      </div>
    </section>
  );
}
