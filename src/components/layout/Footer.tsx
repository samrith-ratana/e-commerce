import Link from "next/link";
import { Store, Facebook, Twitter, Instagram, Github, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { label: "All Products", href: "/" },
      { label: "Electronics", href: "/?cat=Electronics" },
      { label: "Fashion", href: "/?cat=Fashion" },
      { label: "Home & Living", href: "/?cat=Home" },
    ],
    support: [
      { label: "Order Tracking", href: "/dashboard/orders" },
      { label: "Help Center", href: "/help" },
      { label: "Shipping Policy", href: "/shipping" },
      { label: "Returns", href: "/returns" },
    ],
  };

  return (
    <footer className="mt-20 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] pt-14 pb-8">
      <div className="container-page">
        <div className="mb-14 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="rounded-lg bg-[var(--primary-600)] p-1.5">
                <Store className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-[var(--text-strong)]">
                OPEN<span className="text-[var(--primary-600)]">SHOP</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-6 text-[var(--text-muted)]">
              A simple and reliable e-commerce experience for browsing, listing products, and managing orders.
            </p>
            <div className="flex gap-2">
              {[Facebook, Twitter, Instagram, Github].map((Icon, i) => (
                <a key={i} href="#" className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-muted)] p-2 text-[var(--text-muted)] transition hover:bg-[var(--state-hover)] hover:text-[var(--primary-600)]" aria-label="social link">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-[var(--text-strong)]">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-[var(--text-muted)] transition hover:text-[var(--primary-600)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-[var(--text-strong)]">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-[var(--text-muted)] transition hover:text-[var(--primary-600)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-[var(--text-strong)]">Contact</h4>
            <ul className="space-y-3 text-sm text-[var(--text-muted)]">
              <li className="flex items-start gap-2.5"><MapPin size={16} className="mt-0.5 shrink-0 text-[var(--primary-600)]" /> 123 Market St, San Francisco, CA</li>
              <li className="flex items-center gap-2.5"><Phone size={16} className="shrink-0 text-[var(--primary-600)]" /> +1 (555) 000-0000</li>
              <li className="flex items-center gap-2.5"><Mail size={16} className="shrink-0 text-[var(--primary-600)]" /> hello@openmart.com</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-[var(--border-subtle)] pt-6 md:flex-row md:items-center">
          <p className="text-xs font-medium text-[var(--text-muted)]">&copy; {currentYear} OpenMart. All rights reserved.</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Payments: Visa, Stripe, PayPal</p>
        </div>
      </div>
    </footer>
  );
}
