'use client'

import { authClient } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AppRoutes } from '@/lib/config/featureToggles'
import Link from 'next/link'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const pageT = useTranslations('pages.signup')
  const commonT = useTranslations('common')
  const errorsT = useTranslations('errors')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      })

      if (result.error) {
        setError(result.error.message || errorsT('somethingWentWrong'))
      } else {
        // Redirect to email verification page since email verification is required
        router.push(`${AppRoutes.verifyEmail}?email=${encodeURIComponent(email)}`)
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
                htmlFor='name'
                className='block text-sm font-medium text-foreground'
              >
                {commonT('name')}
              </label>
              <input
                id='name'
                name='name'
                type='text'
                autoComplete='name'
                required
                className='mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm'
                placeholder={pageT('namePlaceholder')}
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

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
                autoComplete='new-password'
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
                {loading ? commonT('loading') : pageT('signupButton')}
              </button>
            </div>
          </div>

          <div className='text-center'>
            <Link
              href={AppRoutes.login}
              className='font-medium text-primary hover:text-primary/80 transition-colors'
            >
              {pageT('alreadyHaveAccount')} {pageT('signInInstead')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
