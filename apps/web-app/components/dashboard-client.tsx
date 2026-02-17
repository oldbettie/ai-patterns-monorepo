// @feature:dashboard @domain:users @frontend
// @summary: Client-side dashboard — public by default, auth only needed for donation CTA

'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { SectionHeader } from './dashboard/SectionHeader'
import { FileUploadZone } from './dashboard/FileUploadZone'
import { DocumentGrid } from './dashboard/DocumentGrid'
import type { User } from './dashboard/types'

interface DashboardClientProps {
  user: User | null
}

export function DashboardClient({ user }: DashboardClientProps) {
  const t = useTranslations('pages.dashboard')

  return (
    <main className="container-balanced py-8 md:py-20">
      <SectionHeader title={t('documents.title')} subtitle={t('documents.subtitle')} />

      <section className="mb-8">
        <FileUploadZone />
      </section>

      <section className="mb-12">
        <DocumentGrid />
      </section>

      <DonateBanner user={user} />
    </main>
  )
}

function DonateBanner({ user }: { user: User | null }) {
  const t = useTranslations('pages.dashboard.donateBanner')

  return (
    <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{t('title')}</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{t('subtitle')}</p>
      </div>
      {user ? (
        <Link
          href="/donate"
          className="shrink-0 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {t('cta')}
        </Link>
      ) : (
        <Link
          href="/login"
          className="shrink-0 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {t('signInCta')}
        </Link>
      )}
    </section>
  )
}
