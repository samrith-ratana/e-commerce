"use client";

import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  User,
  Settings,
  BarChart3,
  Home,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { label: "My Shop", icon: BarChart3, href: "/dashboard/shop" },
    { label: "Inventory", icon: Package, href: "/dashboard/inventory" },
    { label: "My Orders", icon: ShoppingBag, href: "/dashboard/orders" },
    { label: "Chat", icon: MessageSquare, href: "/dashboard/chat" },
    { label: "Account", icon: User, href: "/dashboard/account" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--bg-canvas)]">
      <aside className="fixed bottom-0 left-0 top-16 hidden w-64 overflow-y-auto border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] md:block">
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                  active ? "nav-active-left" : "text-[var(--text-body)] hover:bg-[var(--state-hover)]"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="p-6 md:ml-64 md:p-8">{children}</main>
    </div>
  );
}
