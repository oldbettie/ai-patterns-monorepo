'use client'

import { authClient } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

interface VerificationSuccessClientProps {
  token: string
}

export default function VerificationSuccessClient({
  token,
}: VerificationSuccessClientProps) {
  const t = useTranslations('pages.verifyEmail')
  const commonT = useTranslations('common')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const session = await authClient.getSession()

        if (session.data?.user) {
          setSuccess(true)
          router.push('/')
        } else {
          setError(t('emailVerificationCompletedButLoginFailed'))
        }
      } catch (err) {
        setError(t('unexpectedErrorDuringVerification'))
        setLoading(false)
      }
    }

    checkVerificationStatus()
  }, [router, success])

  if (loading) {
    return (
      <div className='text-center'>
        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20'>
          <svg
            className='h-6 w-6 animate-spin text-blue-600 dark:text-blue-400'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
        </div>
        <h2 className='mt-6 text-center text-3xl font-extrabold text-neutral-900 dark:text-neutral-100'>
          {t('verifyingEmail')}
        </h2>
        <p className='mt-2 text-center text-sm text-neutral-600 dark:text-neutral-300'>
          {t('pleaseWait')}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='text-center'>
        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20'>
          <svg
            className='h-6 w-6 text-red-600 dark:text-red-400'
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
          {t('verificationFailed')}
        </h2>
        <p className='mt-2 text-center text-sm text-neutral-600 dark:text-neutral-300'>{error}</p>
        <div className='mt-6'>
          <button
            onClick={() => router.push('/login')}
            className='group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
          >
            {t('backToLogin')}
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className='text-center'>
        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20'>
          <svg
            className='h-6 w-6 text-green-600 dark:text-green-400'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 13l4 4L19 7'
            />
          </svg>
        </div>
        <h2 className='mt-6 text-center text-3xl font-extrabold text-neutral-900 dark:text-neutral-100'>
          {t('emailVerifiedSuccessfully')}
        </h2>
        <p className='mt-2 text-center text-sm text-neutral-600 dark:text-neutral-300'>
          {t('accountVerifiedRedirect')}
        </p>
        <div className='mt-6'>
          <button
            onClick={() => router.push('/')}
            className='group relative flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-600/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500'
          >
            {t('continueToDashboard')}
          </button>
        </div>
      </div>
    )
  }

  return null
}
