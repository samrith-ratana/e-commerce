"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UploadResponse = {
  url?: string;
  error?: string;
};

export default function CreatePostForm({ token }: { token: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl("");
      return;
    }

    const localUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(localUrl);

    return () => {
      URL.revokeObjectURL(localUrl);
    };
  }, [imageFile]);

  async function uploadImage(file: File): Promise<string> {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/uploads/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const body = (await res.json().catch(() => ({}))) as UploadResponse;

      if (!res.ok || !body.url) {
        throw new Error(body.error || "Failed to upload image");
      }

      return body.url;
    } finally {
      setUploading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!imageFile) {
      setError("Image is required");
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);

    try {
      const imageUrl = await uploadImage(imageFile);

      const data = {
        title: String(formData.get("title") || "").trim(),
        content: String(formData.get("content") || "").trim(),
        category: String(formData.get("category") || "").trim(),
        price: Number(formData.get("price")),
        stock: Number(formData.get("stock")),
        images: [imageUrl],
        status: "published",
      };

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create product");
      }

      router.push("/dashboard/inventory");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card w-full">
      <div className="border-b border-[var(--border-subtle)] px-6 py-5 sm:px-8">
        <h2 className="text-2xl font-bold text-[var(--text-strong)]">Add New Product</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Upload product image and publish listing.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6 sm:px-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="title" className="text-sm font-semibold text-[var(--text-body)]">Product title</label>
            <input id="title" name="title" required className="app-input" placeholder="Wireless Noise Cancelling Headphones" />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-semibold text-[var(--text-body)]">Category</label>
            <select id="category" name="category" className="app-input">
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Home">Home</option>
              <option value="Sports">Sports</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-semibold text-[var(--text-body)]">Price ($)</label>
            <input id="price" name="price" type="number" min="0" step="0.01" required className="app-input" placeholder="0.00" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="image" className="text-sm font-semibold text-[var(--text-body)]">Product image</label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <input
              id="image"
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              required
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImageFile(file);
                setError("");
              }}
              className="app-input flex-1 file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--bg-muted)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[var(--text-body)]"
            />

            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)]">
              {previewUrl ? (
                <div className="relative h-full w-full">
                  <Image src={previewUrl} alt="Preview" fill unoptimized className="object-cover" />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center px-1 text-center text-[10px] font-semibold text-[var(--text-muted)]">No preview</div>
              )}
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)]">Accepted: JPG, PNG, WEBP, GIF. Max 5MB. File will auto-rename on upload.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-semibold text-[var(--text-body)]">Description</label>
          <textarea id="content" name="content" rows={5} required className="app-input resize-none" placeholder="Describe features, condition, dimensions, and shipping details." />
        </div>

        <div className="max-w-40 space-y-2">
          <label htmlFor="stock" className="text-sm font-semibold text-[var(--text-body)]">Stock</label>
          <input id="stock" name="stock" type="number" min="0" defaultValue="1" required className="app-input" />
        </div>

        {error && <div className="rounded-xl border border-[color:var(--state-danger)]/30 bg-red-50 px-4 py-3 text-sm font-semibold text-[var(--state-danger)]">{error}</div>}

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[var(--border-subtle)] pt-5">
          <button type="button" onClick={() => router.back()} className="btn-secondary">Discard</button>
          <button type="submit" disabled={loading || uploading} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
            {uploading ? "Uploading image..." : loading ? "Publishing..." : "Publish Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
