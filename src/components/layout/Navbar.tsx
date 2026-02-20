"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingCart, User, Menu, X, Store, PlusSquare, LayoutGrid, LogIn } from "lucide-react";
import SupportChat from "@/components/SupportChat";
import LogoutButton from "@/components/auth/LogoutButton";
import SearchBar from "@/components/SearchBar";

const primaryLinks = [
  { href: "/", label: "Browse", icon: LayoutGrid },
  { href: "/dashboard/inventory/add", label: "Sell", icon: PlusSquare },
];

const desktopPillBase =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-[var(--bg-muted)] hover:text-[var(--text-strong)]";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!active) return;
        setIsLoggedIn(response.ok);
      } catch {
        if (!active) return;
        setIsLoggedIn(false);
      }
    }

    checkAuth();

    return () => {
      active = false;
    };
  }, []);

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-xl">
      <nav className="container-page" aria-label="Main navigation">
        <div className="flex h-16 items-center gap-3 md:gap-4">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="OpenMart home">
            <span className="rounded-xl bg-[var(--primary-600)] p-2 transition-transform group-hover:rotate-6">
              <Store className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-black tracking-tight text-[var(--text-strong)] sm:text-xl">
              OPEN<span className="text-[var(--primary-600)]">SHOP</span>
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 xl:block">
            <SearchBar defaultValue={currentQuery} compact className="max-w-none" />
          </div>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            {primaryLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${desktopPillBase} ${
                    isActive
                      ? "border-[var(--action-500)] bg-[var(--action-100)] text-[var(--primary-700)]"
                      : ""
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}

            <Link href="/my-orders" className={desktopPillBase} aria-label="Orders">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </Link>

            <SupportChat showLabel label="Support" className="text-[var(--text-muted)] hover:text-[var(--text-strong)]" />

            <Link href="/dashboard/account" className={desktopPillBase} aria-label="Profile">
              <User className="h-4 w-4" />
              Profile
            </Link>

            {isLoggedIn ? (
              <LogoutButton
                compact
                showLabel
                label="Logout"
                className="border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-strong)]"
              />
            ) : (
              <Link href="/login" className={desktopPillBase} aria-label="Login">
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-body)] transition hover:bg-[var(--bg-muted)] md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav"
            type="button"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div id="mobile-nav" className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 pb-4 pt-3 shadow-lg md:hidden">
          <div className="mb-3">
            <SearchBar defaultValue={currentQuery} compact className="max-w-none" />
          </div>

          <div className="space-y-1">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[var(--text-body)] hover:bg-[var(--bg-muted)]"
            >
              <LayoutGrid className="h-4 w-4" /> Browse
            </Link>
            <Link
              href="/dashboard/inventory/add"
              onClick={closeMobileMenu}
              className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[var(--text-body)] hover:bg-[var(--bg-muted)]"
            >
              <PlusSquare className="h-4 w-4" /> Sell
            </Link>
            <Link
              href="/my-orders"
              onClick={closeMobileMenu}
              className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[var(--text-body)] hover:bg-[var(--bg-muted)]"
            >
              <ShoppingCart className="h-4 w-4" /> Orders
            </Link>
            <Link
              href="/dashboard/account"
              onClick={closeMobileMenu}
              className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[var(--text-body)] hover:bg-[var(--bg-muted)]"
            >
              <User className="h-4 w-4" /> Profile
            </Link>

            <div className="px-3 py-2">
              <SupportChat mobile />
            </div>
            <div className="px-3 pt-1">
              {isLoggedIn ? (
                <LogoutButton compact className="w-full justify-center rounded-xl" />
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 text-sm font-semibold text-[var(--text-body)] transition hover:bg-[var(--bg-muted)]"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
