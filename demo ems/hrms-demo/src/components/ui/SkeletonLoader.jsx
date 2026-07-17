export function SkeletonCard({ rows = 3 }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-3">
      <div className="h-4 shimmer rounded-lg w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`h-3 shimmer rounded-lg ${i === rows - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-700">
      <div className="w-9 h-9 shimmer rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 shimmer rounded w-1/4" />
        <div className="h-2.5 shimmer rounded w-1/3" />
      </div>
      <div className="h-6 shimmer rounded-full w-16" />
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 shimmer rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 h-64 shimmer rounded-2xl" />
        <div className="h-64 shimmer rounded-2xl" />
      </div>
      <div className="h-48 shimmer rounded-2xl" />
    </div>
  );
}
