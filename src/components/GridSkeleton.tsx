export default function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="aspect-square shimmer" />
          <div className="space-y-3 p-6">
            <div className="h-5 w-4/5 rounded shimmer" />
            <div className="h-7 w-2/5 rounded shimmer" />
            <div className="h-4 w-3/5 rounded shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
