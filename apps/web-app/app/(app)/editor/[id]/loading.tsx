// @feature:pdf-editor @domain:pdf @frontend
// @summary: Loading skeleton for the PDF editor page

export default function EditorLoading() {
  return (
    <div className="flex flex-col h-screen bg-neutral-50 dark:bg-neutral-950 animate-pulse">
      {/* Toolbar skeleton */}
      <div className="h-12 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3 px-4">
        <div className="h-7 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-7 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="ml-auto h-8 w-28 rounded bg-neutral-200 dark:bg-neutral-700" />
      </div>
      {/* Canvas skeleton */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-[595px] h-[842px] bg-white dark:bg-neutral-800 rounded shadow-md" />
        </div>
      </div>
      {/* Page navigator skeleton */}
      <div className="h-12 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-center gap-3">
        <div className="h-7 w-8 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-5 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-7 w-8 rounded bg-neutral-200 dark:bg-neutral-700" />
      </div>
    </div>
  )
}
