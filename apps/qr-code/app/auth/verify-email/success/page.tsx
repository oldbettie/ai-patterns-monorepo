import { Suspense } from 'react'
import VerificationSuccessClient from './verification-success-client'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { AppRoutes, FeatureToggles } from '@/lib/config/featureToggles'

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function VerificationSuccessPage({
  searchParams,
}: PageProps) {
  // Redirect if signup is disabled
  if (!FeatureToggles.enableSignup) {
    redirect(AppRoutes.home)
  }
  const params = await searchParams
  const token = params.token || ''
  const t = await getTranslations('pages.verifyEmail')

  return (
    <div className='min-h-screen flex items-center justify-center bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100'>
      <div className='w-full max-w-md space-y-8 px-4'>
        <Suspense fallback={<div className='text-neutral-700 dark:text-neutral-300'>{t('verifyingEmail')}</div>}>
          <VerificationSuccessClient token={token} />
        </Suspense>
      </div>
    </div>
  )
}
