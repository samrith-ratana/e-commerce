import { postService } from "@/modules/services/Post-Service-v1";
import ProductGrid from "@/components/ProductGrid";
import { User, Package, Settings, Plus } from "lucide-react";
import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/currentUser";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function ProfilePage() {
  const user = await requireCurrentUser("/dashboard/account");
  const userPosts = await postService.getPostsByAuthor(user.id);

  return (
    <div className="min-h-screen pb-16">
      <header className=" rounded-lg border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="container-page  py-10">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--action-100)] text-[var(--action-600)]">
              <User size={44} strokeWidth={1.5} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-[var(--text-strong)]">{user.email}</h1>
              <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
                <div className="rounded-full bg-[var(--bg-muted)] px-4 py-2 text-sm font-medium text-[var(--text-body)]">
                  {userPosts.length} Listings
                </div>
                <div className="rounded-full bg-[color:var(--state-success)]/10 px-4 py-2 text-sm font-medium text-[var(--state-success)]">
                  4.9 Star Rating
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/inventory/add" className="btn-primary gap-2">
                <Plus size={16} /> List New Item
              </Link>
              <button className="btn-secondary px-4" aria-label="Open settings">
                <Settings size={18} />
              </button>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <section className="container-page py-8">
        <div className="mb-8 flex items-center gap-2 border-b border-[var(--border-subtle)]">
          <button className="flex items-center gap-2 border-b-2 border-[var(--action-600)] px-4 py-4 text-sm font-bold text-[var(--action-600)]">
            <Package size={16} /> My Listings
          </button>
          <button className="px-4 py-4 text-sm font-medium text-[var(--text-muted)] transition hover:text-[var(--text-body)]">
            Purchase History
          </button>
        </div>

        {userPosts.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--text-strong)]">Manage Your Products</h2>
            <ProductGrid products={userPosts} />
          </div>
        ) : (
          <div className="surface-card border-dashed py-20 text-center">
            <Package className="mx-auto mb-4 text-[var(--text-muted)]" size={42} />
            <h3 className="text-lg font-bold text-[var(--text-strong)]">You have not listed anything yet</h3>
            <p className="mb-6 mt-2 text-sm text-[var(--text-muted)]">Start selling by creating your first listing.</p>
            <Link href="/dashboard/inventory/add" className="btn-primary">Create My First Listing</Link>
          </div>
        )}
      </section>
    </div>
  );
}