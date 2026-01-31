import { Suspense } from 'react'
import VerifyEmailClient from './verify-email-client'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  searchParams: Promise<{ email?: string }>
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams
  const email = params.email || ''
  const t = await getTranslations('pages.verifyEmail')
  const commonT = await getTranslations('common')

  return (
    <div className='min-h-screen flex items-center justify-center bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100'>
      <div className='w-full max-w-md space-y-8 px-4'>
        <div className='text-center'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-500/20'>
            <svg
              className='h-6 w-6 text-yellow-600 dark:text-yellow-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-neutral-900 dark:text-neutral-100'>
            {t('checkEmailTitle')}
          </h2>
          <p className='mt-2 text-center text-sm text-neutral-600 dark:text-neutral-300'>
            {t('emailSentTo')}
          </p>
          <p className='text-center text-sm font-medium text-neutral-900 dark:text-neutral-100'>
            {email}
          </p>
        </div>

        <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-blue-500 dark:text-blue-400'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm text-blue-700 dark:text-blue-300'>
                {t('clickLinkInstructions')}
              </p>
            </div>
          </div>
        </div>

        <Suspense fallback={<div className='text-neutral-700 dark:text-neutral-300'>{commonT('loading')}</div>}>
          <VerifyEmailClient email={email} />
        </Suspense>
      </div>
    </div>
  )
}
