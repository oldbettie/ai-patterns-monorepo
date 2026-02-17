// @feature:dashboard @domain:users @frontend
// @summary: Client-side dashboard — public by default, auth only needed for donation CTA

'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { SectionHeader } from './dashboard/SectionHeader'
import { FileUploadZone } from './dashboard/FileUploadZone'
import { DocumentGrid } from './dashboard/DocumentGrid'
import type { User } from './dashboard/types'
import { AppRoutes } from '@/lib/config/featureToggles'

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
    <section className="rounded-xl border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-foreground">{t('title')}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{t('subtitle')}</p>
      </div>
      {user ? (
        <Link
          href={AppRoutes.donate}
          className="shrink-0 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {t('cta')}
        </Link>
      ) : (
        <Link
          href={AppRoutes.login}
          className="shrink-0 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {t('signInCta')}
        </Link>
      )}
    </section>
  )
}
