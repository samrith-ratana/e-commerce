import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenShop",
  description: "OpenMart e-commerce platform for buyers and sellers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-strong)]">{children}</body>
    </html>
  );
}
