'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth'
import { useTranslations } from 'next-intl'

interface ResetPasswordClientProps {
  token: string
}

export default function ResetPasswordClient({
  token,
}: ResetPasswordClientProps) {
  const t = useTranslations('pages.resetPassword')
  const commonT = useTranslations('common')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const verifyResetToken = async () => {
      if (!token) {
        setError(t('invalidResetLink'))
        setLoading(false)
        return
      }
    }

    verifyResetToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      setError(t('invalidResetLink'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'))
      return
    }

    if (password.length < 8) {
      setError(t('passwordTooShort'))
      return
    }

    setLoading(true)
    setError('')

    try {
      // Use Better Auth's reset password functionality
      const result = await authClient.resetPassword({
        token,
        newPassword: password,
      })

      if (result.error) {
        setError(result.error.message || 'Failed to reset password')
      } else {
        setSuccess(true)
        router.push('/login')
      }
    } catch (err) {
      setError(commonT('error'))
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className='mt-8'>
        <div className='rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300'>
          {t('invalidResetLink')}
        </div>
        <div className='mt-6 text-center'>
          <button
            onClick={() => router.push('/auth/forgot-password')}
            className='font-medium text-blue-600 hover:text-blue-600/90 dark:text-blue-400 dark:hover:text-blue-300'
          >
            {t('requestNewResetLink')}
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className='mt-8 text-center'>
        <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100'>
          <svg
            className='h-6 w-6 text-green-600'
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
        <h3 className='mt-6 text-lg font-medium text-neutral-900 dark:text-neutral-100'>
          {t('passwordResetSuccess')}
        </h3>
        <p className='mt-2 text-sm text-neutral-600 dark:text-neutral-300'>{t('passwordUpdated')}</p>
        <div className='mt-6'>
          <button
            onClick={() => router.push('/login')}
            className='group relative flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-600/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500'
          >
            {t('signInWithNewPassword')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
      {error && (
        <div className='rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300'>
          {error}
        </div>
      )}

      <div className='space-y-4'>
        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-neutral-700 dark:text-neutral-300'
          >
            {t('newPassword')}
          </label>
          <input
            id='password'
            name='password'
            type='password'
            autoComplete='new-password'
            required
            className='mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-neutral-300 sm:text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-neutral-700 dark:focus:border-neutral-700'
            placeholder={t('newPasswordPlaceholder')}
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8}
          />
          <p className='mt-1 text-xs text-neutral-500 dark:text-neutral-400'>
            {t('passwordRequirement')}
          </p>
        </div>

        <div>
          <label
            htmlFor='confirmPassword'
            className='block text-sm font-medium text-neutral-700 dark:text-neutral-300'
          >
            {t('confirmPassword')}
          </label>
          <input
            id='confirmPassword'
            name='confirmPassword'
            type='password'
            autoComplete='new-password'
            required
            className='mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-neutral-300 sm:text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-neutral-700 dark:focus:border-neutral-700'
            placeholder={t('confirmPasswordPlaceholder')}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            minLength={8}
          />
        </div>
      </div>

      <div>
        <button
          type='submit'
          disabled={loading}
          className='group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400'
        >
          {loading ? t('resettingPassword') : t('resetButton')}
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
  )
}
