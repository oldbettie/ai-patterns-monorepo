'use client'
// @feature:navigation @domain:shared @frontend @reusable
// @summary: Full nav header for authenticated app pages (profile, donate, generate, etc.)

import Link from 'next/link'
import { AppRoutes } from '@/lib/config/featureToggles'
import ThemeToggle from '@/components/theme-toggle'
import { LanguageSelector } from '@/components/language-selector'
import { useTranslations } from 'next-intl'
import { UserAccountButton } from '@/components/UserAccountButton'

interface AppPageNavProps {
  showGeneratorLink?: boolean
}

export function AppPageNav({ showGeneratorLink = true }: AppPageNavProps) {
  const t = useTranslations('components.appNav')

  return (
    <nav className='w-full border-b border-border bg-background/95 backdrop-blur-md py-3'>
      <div className='container mx-auto px-6 relative flex items-center'>
        {/* Left: logo */}
        <div className='flex items-center gap-3'>
          <Link
            href={AppRoutes.home}
            className='font-display text-2xl text-foreground font-medium tracking-tight'
          >
            Quick QR
          </Link>
        </div>

        {/* Right: action buttons */}
        <div className='flex items-center gap-4 ml-auto'>
          <UserAccountButton />
          <ThemeToggle />
          <LanguageSelector />
          {showGeneratorLink && (
            <Link
              href={AppRoutes.generate}
              className='bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-all hover:shadow-md font-medium text-sm'
            >
              {t('openGenerator')} →
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
