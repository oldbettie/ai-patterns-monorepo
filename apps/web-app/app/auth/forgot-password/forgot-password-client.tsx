'use client'

import { authClient } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function ForgotPasswordClient() {
  const t = useTranslations('pages.forgotPassword')
  const commonT = useTranslations('common')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Use Better Auth's forget password functionality
      const result = await authClient.forgetPassword({
        email,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (result.error) {
        setError(result.error.message || 'Failed to send reset email')
      } else {
        setMessage(t('emailSent'))
      }
    } catch (error) {
      console.error(error)
      setError(commonT('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='mt-8'>
      {message ? (
        <div className='space-y-6'>
          <div className='rounded-md border border-green-300 bg-green-50 px-4 py-3 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300'>
            {message}
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
                <p className='text-sm text-blue-700 dark:text-blue-300'>{t('checkEmail')}</p>
              </div>
            </div>
          </div>

          <div className='text-center'>
            <button
              onClick={() => router.push('/login')}
              className='font-medium text-blue-600 hover:text-blue-600/90 dark:text-blue-400 dark:hover:text-blue-300'
            >
              {t('backToLogin')}
            </button>
          </div>
        </div>
      ) : (
        <form className='space-y-6' onSubmit={handleSubmit}>
          {error && (
            <div className='rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300'>
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-neutral-700 dark:text-neutral-300'
            >
              {t('emailLabel')}
            </label>
            <input
              id='email'
              name='email'
              type='email'
              autoComplete='email'
              required
              className='mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-neutral-300 sm:text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-neutral-700 dark:focus:border-neutral-700'
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type='submit'
              disabled={loading}
              className='group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400'
            >
              {loading ? commonT('loading') : t('sendResetLink')}
            </button>
          </div>

          <div className='text-center'>
            <button
              type='button'
              onClick={() => router.push('/login')}
              className='font-medium text-blue-600 hover:text-blue-600/90 dark:text-blue-400 dark:hover:text-blue-300'
            >
              {t('backToLogin')}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
