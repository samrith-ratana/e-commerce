import { Suspense } from "react";
import { postService } from "@/modules/services/Post-Service-v1";
import ProductGrid from "@/components/ProductGrid";
import CategoryFilter from "@/components/CategoryFilter";
import GridSkeleton from "@/components/GridSkeleton";
import { SearchX } from "lucide-react";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q: query = "", cat: category = "" } = await searchParams;
  const products = await postService.searchPosts(query, category);

  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] pb-16">
      <CategoryFilter activeCategory={category} />

      <section className="container-page mt-10">
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            {query || category ? "Filtered Results" : "All Products & Categorys"}
          </h2>
          <div className="h-px flex-1 bg-[var(--border-subtle)]" />
        </div>

        <Suspense key={query + category} fallback={<GridSkeleton />}>
          {products.length > 0 ? <ProductGrid products={products} /> : <NoResultsFound />}
        </Suspense>
      </section>
    </main>
  );
}

function NoResultsFound() {
  return (
    <div className="surface-card py-20 text-center">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-muted)] text-[var(--text-muted)]">
        <SearchX size={32} />
      </div>
      <h3 className="text-xl font-bold text-[var(--text-strong)]">No products found</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--text-muted)]">Try a broader keyword or switch to another category.</p>
    </div>
  );
}
