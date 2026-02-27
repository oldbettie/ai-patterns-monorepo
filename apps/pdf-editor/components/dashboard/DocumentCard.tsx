'use client'
// @feature:dashboard @domain:documents @frontend
// @summary: Card component displaying a PDF document with thumbnail and action buttons

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { PDFDocument } from '@quick-pdfs/common'

interface DocumentCardProps {
  document: PDFDocument
  onDelete: (id: string) => void
}

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const t = useTranslations('pages.dashboard.documents')

  const lastEdited = new Date(document.updatedAt).toLocaleDateString()

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="aspect-[3/4] bg-muted flex items-center justify-center overflow-hidden">
        {document.thumbnail ? (
          <img
            src={document.thumbnail}
            alt={document.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground/50">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground truncate">{document.name}</p>
        <p className="text-xs text-muted-foreground">{t('pages', { count: document.pageCount })}</p>
        <p className="text-xs text-muted-foreground/80">{t('lastEdited', { date: lastEdited })}</p>
      </div>

      {/* Actions */}
      <div className="flex border-t border-border">
        <Link
          href={`/editor/${document.id}`}
          className="flex-1 text-center text-xs py-2 text-primary hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {t('edit')}
        </Link>
        <button
          onClick={() => onDelete(document.id)}
          className="flex-1 text-xs py-2 text-destructive hover:bg-destructive/10 transition-colors border-l border-border"
        >
          {t('delete')}
        </button>
      </div>
    </div>
  )
}
