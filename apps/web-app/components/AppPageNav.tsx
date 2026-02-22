'use client'
// @feature:navigation @domain:shared @frontend @reusable
// @summary: Full nav header for authenticated app pages (profile, donate, etc.)

import Link from 'next/link'
import { AppRoutes } from '@/lib/config/featureToggles'
import ThemeToggle from '@/components/theme-toggle'
import { LanguageSelector } from '@/components/language-selector'
import { useTranslations } from 'next-intl'
import { UserAccountButton } from '@/components/UserAccountButton'
import { ExportButtonSlot } from '@/lib/context/EditorActionsContext'

interface AppPageNavProps {
  showEditorLink?: boolean
  showExportSlot?: boolean
}

export function AppPageNav({ showEditorLink = true, showExportSlot = false }: AppPageNavProps) {
  const t = useTranslations('components.appNav')

  return (
    <nav className='w-full border-b border-border bg-background/95 backdrop-blur-md py-3'>
      <div className='container mx-auto px-6 flex items-center justify-between'>
        <Link
          href={AppRoutes.home}
          className='font-display text-2xl text-foreground font-medium tracking-tight'
        >
          SimplifiedPDF
        </Link>
        <div className='flex items-center gap-4'>
          {showExportSlot && <ExportButtonSlot />}
          <UserAccountButton />
          <ThemeToggle />
          <LanguageSelector />
          {showEditorLink && (
            <Link
              href={AppRoutes.editor}
              className='bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-all hover:shadow-md font-medium text-sm'
            >
              {t('openEditor')} →
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
