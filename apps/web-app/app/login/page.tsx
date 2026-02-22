'use client'

import { authClient } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { AppRoutes, FeatureToggles } from '@/lib/config/featureToggles'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  
  // Redirect if login is disabled
  useEffect(() => {
    if (!FeatureToggles.enableLogin) {
      router.push(AppRoutes.home)
    }
  }, [router])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const pageT = useTranslations('pages.login')
  const commonT = useTranslations('common')
  const errorsT = useTranslations('errors')
  const verifyEmailT = useTranslations('pages.verifyEmail')

  if (!FeatureToggles.enableLogin) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      })

      if (result.error) {
        const errorMessage =
          result.error.message || errorsT('invalidCredentials')

        // Check if the error is due to unverified email
        if (errorMessage === 'Email not verified') {
          // Send verification email and show message
          try {
            await authClient.sendVerificationEmail({
              email,
              callbackURL: `${window.location.origin}${AppRoutes.verifyEmailSuccess}`,
            })

            setError(verifyEmailT('description'))
            return
          } catch (verifyError) {
            console.error(verifyError)
            setError(verifyEmailT('checkEmail'))
            return
          }
        }

        setError(errorMessage)
      } else {
        router.push(AppRoutes.home)
      }
    } catch (err) {
      console.error(err)
      setError(errorsT('somethingWentWrong'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <div>
          <Link href={AppRoutes.home} className="flex justify-center mb-6">
            <h1 className="font-display text-4xl font-medium tracking-tight">SimplifiedPDF</h1>
          </Link>
          <h2 className='mt-2 text-center text-3xl font-display font-medium text-foreground'>
            {pageT('title')}
          </h2>
        </div>
        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          {error && (
            <div className='rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-destructive text-sm'>
              {error}
            </div>
          )}

          <div className='space-y-4 bg-card p-8 rounded-xl border border-border shadow-sm'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-foreground'
              >
                {commonT('email')}
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                className='mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm'
                placeholder={pageT('emailPlaceholder')}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-foreground'
              >
                {commonT('password')}
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                required
                className='mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm'
                placeholder={pageT('passwordPlaceholder')}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <div>
              <button
                type='submit'
                disabled={loading}
                className='group relative flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm'
              >
                {loading ? commonT('loading') : pageT('loginButton')}
              </button>
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <Link
              href={AppRoutes.forgotPassword}
              className='text-sm font-medium text-primary hover:text-primary/80 transition-colors'
            >
              {pageT('forgotPassword')}
            </Link>
          </div>

          <div className='text-center'>
            <Link
              href={AppRoutes.signup}
              className='font-medium text-primary hover:text-primary/80 transition-colors'
            >
              {pageT('dontHaveAccount')} {pageT('signUpInstead')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
