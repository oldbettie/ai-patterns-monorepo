// @feature:dashboard @domain:users @frontend
// @summary: Client-side dashboard with user welcome interface

'use client'

import { useTranslations } from 'next-intl'
import { SectionHeader } from './dashboard/SectionHeader'
import { UserCard } from './dashboard/UserCard'
import type { User } from './dashboard/types'

interface DashboardClientProps {
  user: User
}

export function DashboardClient({ user }: DashboardClientProps) {
  const t = useTranslations('pages.dashboard')

  return (
    <main className="container-balanced py-8 md:py-20">
      <SectionHeader title={t('title')} subtitle={t('subtitle')} />

      {/* User card and quick actions */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <UserCard user={user} subscriptionLabel={t('subscriptionActive')} memberSinceLabel={t('memberSince')} />

        {/* Quick actions placeholder */}
        <div className="col-span-1 rounded-xl border border-neutral-300 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{t('quickActions.title')}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-sm text-blue-800 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50">
              {t('quickActions.settings')}
            </button>
            <button className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              {t('quickActions.profile')}
            </button>
            <button className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              {t('quickActions.support')}
            </button>
          </div>
        </div>

        {/* Placeholder column for layout */}
        <div className="col-span-1" />
      </section>

      {/* Feature sections */}
      <section className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t('sections.analytics.title')}</h3>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{t('sections.analytics.description')}</p>
          <div className="mt-4 h-24 rounded-lg bg-neutral-100 dark:bg-neutral-800" />
        </div>

        <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t('sections.activity.title')}</h3>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{t('sections.activity.description')}</p>
          <div className="mt-4 space-y-2">
            <div className="h-4 rounded bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-4 w-3/4 rounded bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-4 w-1/2 rounded bg-neutral-100 dark:bg-neutral-800" />
          </div>
        </div>

        <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t('sections.settings.title')}</h3>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{t('sections.settings.description')}</p>
          <div className="mt-4 flex gap-2">
            <div className="h-8 w-16 rounded bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-8 w-20 rounded bg-neutral-100 dark:bg-neutral-800" />
          </div>
        </div>
      </section>
    </main>
  )
}