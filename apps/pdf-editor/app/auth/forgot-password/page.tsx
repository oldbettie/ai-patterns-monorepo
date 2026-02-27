import ForgotPasswordClient from './forgot-password-client'
import { useTranslations } from 'next-intl'
import { redirect } from 'next/navigation'
import { AppRoutes, FeatureToggles } from '@/lib/config/featureToggles'

export default function ForgotPasswordPage() {
  // Redirect if login is disabled
  if (!FeatureToggles.enableLogin) {
    redirect(AppRoutes.home)
  }

  const t = useTranslations('pages.forgotPassword')

  return (
    <div className='min-h-screen flex items-center justify-center bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100'>
      <div className='w-full max-w-md space-y-8 px-4'>
        <div className='text-center'>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-neutral-900 dark:text-neutral-100'>
            {t('title')}
          </h2>
          <p className='mt-2 text-center text-sm text-neutral-600 dark:text-neutral-300'>
            {t('description')}
          </p>
        </div>

        <ForgotPasswordClient />
      </div>
    </div>
  )
}
