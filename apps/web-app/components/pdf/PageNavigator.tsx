'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: Page navigation controls for the PDF editor

import { useTranslations } from 'next-intl'

interface PageNavigatorProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PageNavigator({ currentPage, totalPages, onPageChange }: PageNavigatorProps) {
  const t = useTranslations('pages.editor')

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="px-3 py-1.5 rounded-md bg-accent disabled:opacity-40 hover:bg-accent/80 transition-colors text-sm text-foreground"
      >
        ←
      </button>
      <span className="text-sm text-muted-foreground">
        {t('page', { current: currentPage + 1, total: totalPages })}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="px-3 py-1.5 rounded-md bg-accent disabled:opacity-40 hover:bg-accent/80 transition-colors text-sm text-foreground"
      >
        →
      </button>
    </div>
  )
}
