// @feature:dashboard @domain:documents @frontend
// @summary: Loading skeleton for the dashboard page

export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 rounded bg-neutral-200 dark:bg-neutral-700 mb-2" />
        <div className="h-4 w-64 rounded bg-neutral-200 dark:bg-neutral-700" />
      </div>

      {/* Upload zone skeleton */}
      <div className="h-40 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 mb-8" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="aspect-[3/4] bg-neutral-200 dark:bg-neutral-700" />
            <div className="p-3 space-y-1.5">
              <div className="h-4 rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-3 w-16 rounded bg-neutral-200 dark:bg-neutral-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
