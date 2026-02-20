import Image from "next/image";
import { notFound } from "next/navigation";
import { postService } from "@/modules/services/Post-Service-v1";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = postService.getPostById(id);

  if (!product || product.status !== "published") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] py-8">
      <div className="container-page">
        <article className="surface-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative aspect-square bg-[var(--bg-muted)]">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-semibold text-[var(--text-muted)]">
                  No image
                </div>
              )}
            </div>

            <div className="space-y-5 p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">{product.category}</p>
              <h1 className="text-3xl font-black text-[var(--text-strong)]">{product.title}</h1>
              <p className="text-sm leading-7 text-[var(--text-body)]">{product.content}</p>

              <div className="space-y-2">
                <div className="text-3xl font-bold text-[var(--action-600)]">${product.price.toFixed(2)}</div>
                <p className="text-sm text-[var(--text-muted)]">Stock available: {product.stock}</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
