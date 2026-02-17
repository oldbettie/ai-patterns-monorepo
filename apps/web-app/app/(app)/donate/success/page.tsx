// @feature:donations @domain:donations @frontend
// @summary: Donation success page shown after successful payment

import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('pages.donate.success')
  return { title: t('title') }
}

export default async function DonateSuccessPage() {
  const t = await getTranslations('pages.donate')

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
        {t('success.title')}
      </h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8">
        {t('success.message')}
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        {t('success.backToDashboard')}
      </Link>
    </div>
  )
}
