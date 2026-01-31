'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth'
import { useTranslations } from 'next-intl'

interface VerifyEmailClientProps {
  email: string
}

export default function VerifyEmailClient({ email }: VerifyEmailClientProps) {
  const t = useTranslations('pages.verifyEmail')
  const commonT = useTranslations('common')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      )
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleResendEmail = async () => {
    if (resendCooldown > 0) {
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Use Better Auth's send verification email functionality
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: `${window.location.origin}/auth/verify-email/success`,
      })

      if (result.error) {
        setError(result.error.message || 'Failed to resend verification email')
      } else {
        setMessage(t('verificationEmailSent'))
        setResendCooldown(300) // 5 minutes cooldown
      }
    } catch (err) {
      setError(commonT('error'))
    } finally {
      setLoading(false)
    }
  }

  const formatCooldownTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className='mt-8 space-y-6'>
      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      )}

      {message && (
        <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded'>
          {message}
        </div>
      )}

      <div>
        <button
          type='button'
          disabled={loading || resendCooldown > 0}
          onClick={handleResendEmail}
          className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading
            ? t('sending')
            : resendCooldown > 0
              ? `${t('resendIn')} ${formatCooldownTime(resendCooldown)}`
              : t('resendVerificationEmail')}
        </button>
      </div>

      <div className='text-center'>
        <button
          onClick={() => router.push('/login')}
          className='font-medium text-indigo-600 hover:text-indigo-500'
        >
          {t('backToLogin')}
        </button>
      </div>
    </div>
  )
}
