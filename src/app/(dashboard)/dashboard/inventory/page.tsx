import { postService } from "@/modules/services/Post-Service-v1";
import Link from "next/link";
import { requireCurrentUser, getAccessTokenFromCookies } from "@/lib/auth/currentUser";
import InventoryTable from "./InventoryTable";

export default async function InventoryPage() {
  const user = await requireCurrentUser("/dashboard/inventory");
  const token = (await getAccessTokenFromCookies()) || "";
  const products = await postService.getInventory(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-strong)]">Inventory</h1>
        <Link href="/dashboard/inventory/add" className="btn-primary">
          + Add Product
        </Link>
      </div>

      <div className="surface-card overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[var(--bg-muted)] text-xs font-bold uppercase tracking-wide text-[var(--text-table)]">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            <InventoryTable products={products} token={token} />
          </tbody>
        </table>
      </div>
    </div>
  );
}
