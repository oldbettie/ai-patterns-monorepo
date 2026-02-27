'use client'
// @feature:donations @domain:donations @frontend
// @summary: Client-side donation form with Polar hosted checkout

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { authClient } from '@/lib/auth/client'
import { useOnlineStatus } from '@/components/hooks/useOnlineStatus'

const PRESET_AMOUNTS = [
  { amount: 500, slug: 'donate-supporter' },
  { amount: 1000, slug: 'donate-plus' },
  { amount: 2500, slug: 'donate-pro' },
]

interface DonateClientProps {
  isDonor: boolean
}

export function DonateClient({ isDonor }: DonateClientProps) {
  const t = useTranslations('pages.donate')
  const isOnline = useOnlineStatus()
  const [selectedSlug, setSelectedSlug] = useState(PRESET_AMOUNTS[1].slug)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleDonate = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      await authClient.checkout({ slug: selectedSlug })
      // authClient.checkout() redirects to Polar hosted checkout — no return on success
    } catch (err) {
      console.error('Checkout error:', err)
      setErrorMsg(err instanceof Error ? err.message : 'Failed to start checkout')
      setLoading(false)
    }
  }

  if (!isOnline) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-neutral-500 text-sm">{t('offlineMessage')}</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 text-center mb-2">
        {t('title')}
      </h1>
      <p className="text-neutral-500 text-sm text-center mb-8">{t('subtitle')}</p>

      {isDonor ? (
        <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-6 text-center">
          <p className="text-green-700 dark:text-green-400 text-sm">{t('alreadyDonor')}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('amount')}</p>
          <div className="flex gap-3">
            {PRESET_AMOUNTS.map(({ amount, slug }) => (
              <button
                key={slug}
                onClick={() => setSelectedSlug(slug)}
                className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                  selectedSlug === slug
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                ${(amount / 100).toFixed(0)}
              </button>
            ))}
          </div>
          {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
          <button
            onClick={handleDonate}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? t('processing') : t('donate')}
          </button>
        </div>
      )}
    </div>
  )
}
