import { Suspense } from 'react'
import ResetPasswordClient from './reset-password-client'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams
  const token = params.token || ''
  const t = await getTranslations('pages.resetPassword')
  const commonT = await getTranslations('common')

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

        <Suspense fallback={<div className='text-neutral-700 dark:text-neutral-300'>{commonT('loading')}</div>}>
          <ResetPasswordClient token={token} />
        </Suspense>
      </div>
    </div>
  )
}
