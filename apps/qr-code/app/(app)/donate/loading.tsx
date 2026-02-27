// @feature:donations @domain:donations @frontend
// @summary: Loading skeleton for the donate page

export default function DonateLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 animate-pulse">
      <div className="h-8 w-48 rounded bg-neutral-200 dark:bg-neutral-700 mb-3 mx-auto" />
      <div className="h-4 w-64 rounded bg-neutral-200 dark:bg-neutral-700 mb-10 mx-auto" />
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
        <div className="h-5 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="flex gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 flex-1 rounded-md bg-neutral-200 dark:bg-neutral-700" />
          ))}
        </div>
        <div className="h-10 rounded-md bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-10 w-full rounded-md bg-blue-200 dark:bg-blue-900/40" />
      </div>
    </div>
  )
}
