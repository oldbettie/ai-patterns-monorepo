'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: PDF editor header with filename and navigation buttons

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'
import { AppRoutes } from '@/lib/config/featureToggles'

interface PDFEditorHeaderProps {
  documentName: string
}

export function PDFEditorHeader({ documentName }: PDFEditorHeaderProps) {
  const t = useTranslations('pages.editor.header')

  return (
    <div className="flex items-center justify-between gap-4 px-4 h-14 bg-background border-b border-border">
      {/* Left: Navigation buttons */}
      <div className="flex items-center gap-2">
        <Link
          href={AppRoutes.dashboard}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-accent hover:bg-accent/80 transition-colors text-foreground"
          aria-label={t('backToDocuments')}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToDocuments')}</span>
        </Link>

        <Link
          href={AppRoutes.home}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-accent hover:bg-accent/80 transition-colors text-foreground"
          aria-label={t('home')}
        >
          <Home className="w-4 h-4" />
          <span>{t('home')}</span>
        </Link>
      </div>

      {/* Center: Document name */}
      <div className="flex-1 text-center">
        <h1 className="text-sm font-medium text-foreground truncate">
          {documentName}
        </h1>
      </div>

      {/* Right: Spacer to balance the layout */}
      <div className="w-[200px]" />
    </div>
  )
}
