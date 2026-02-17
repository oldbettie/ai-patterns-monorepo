'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: PDF editor header with filename and navigation buttons

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'

interface PDFEditorHeaderProps {
  documentName: string
}

export function PDFEditorHeader({ documentName }: PDFEditorHeaderProps) {
  const t = useTranslations('pages.editor.header')

  return (
    <div className="flex items-center justify-between gap-4 px-4 h-14 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      {/* Left: Navigation buttons */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          aria-label={t('backToDocuments')}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToDocuments')}</span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          aria-label={t('home')}
        >
          <Home className="w-4 h-4" />
          <span>{t('home')}</span>
        </Link>
      </div>

      {/* Center: Document name */}
      <div className="flex-1 text-center">
        <h1 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
          {documentName}
        </h1>
      </div>

      {/* Right: Spacer to balance the layout */}
      <div className="w-[200px]" />
    </div>
  )
}
