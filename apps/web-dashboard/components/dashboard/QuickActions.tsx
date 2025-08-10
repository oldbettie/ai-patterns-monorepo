"use client"

export function QuickActions() {
  return (
    <div className="col-span-1 rounded-xl border border-neutral-300 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
      <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Sync</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
          Pause Sync
        </button>
        <button className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
          Clear History
        </button>
      </div>
    </div>
  )
}

