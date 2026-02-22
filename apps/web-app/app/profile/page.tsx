// @feature:user-auth @domain:auth @frontend
// @summary: User profile page displaying account information and membership status

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth/auth'
import { AppRoutes } from '@/lib/config/featureToggles'
import { createDonationRepository } from '@quick-pdfs/database/src/repositories/donationRepository'
import type { DonationTier } from '@quick-pdfs/database/src/types'

function getTierLabel(tier: DonationTier | null, t: Awaited<ReturnType<typeof getTranslations<'pages.profile'>>>) {
  switch (tier) {
    case 'supporter_pro': return t('supporterPro')
    case 'supporter_plus': return t('supporterPlus')
    case 'supporter': return t('supporter')
    default: return t('free')
  }
}

function getTierColors(tier: DonationTier | null) {
  switch (tier) {
    case 'supporter_pro':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    case 'supporter_plus':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'supporter':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    default:
      return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
  }
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect(AppRoutes.login)
  }

  const { user } = session
  const t = await getTranslations('pages.profile')

  const donationRepo = createDonationRepository()
  const donations = await donationRepo.findByUserId(user.id)
  const completed = donations.filter(d => d.status === 'completed')
  const latestDonation = completed.sort(
    (a, b) => new Date(b.donatedAt).getTime() - new Date(a.donatedAt).getTime()
  )[0]

  const isDonor = !!latestDonation
  const tier = latestDonation?.tier ?? null

  return (
    <main className='flex min-h-screen items-center justify-center p-4'>
      <div className='w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900'>
        <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 mx-auto'>
          <svg
            className='h-8 w-8 text-neutral-500 dark:text-neutral-400'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
          >
            <circle cx='12' cy='8' r='4' />
            <path d='M4 20c0-4 3.6-7 8-7s8 3 8 7' />
          </svg>
        </div>

        <h1 className='text-center text-xl font-semibold text-neutral-900 dark:text-neutral-100'>
          {user.name}
        </h1>
        <p className='mt-1 text-center text-sm text-neutral-500 dark:text-neutral-400'>
          {user.email}
        </p>

        <div className='mt-6 border-t border-neutral-200 dark:border-neutral-800 pt-4'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-neutral-600 dark:text-neutral-400'>
              {t('membership')}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${getTierColors(tier)}`}>
              {isDonor && (
                <svg className='h-3 w-3' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
                  <path d='M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z' />
                </svg>
              )}
              {getTierLabel(tier, t)}
            </span>
          </div>

          {isDonor && latestDonation?.expiresAt && (
            <p className='mt-2 text-xs text-neutral-500 dark:text-neutral-500 text-right'>
              {t('expires', { date: new Date(latestDonation.expiresAt).toLocaleDateString() })}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
