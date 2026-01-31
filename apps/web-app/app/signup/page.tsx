'use client'

import { authClient } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

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
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
      }
    } catch (err) {
      console.error(err)
      setError(errorsT('somethingWentWrong'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100'>
      <div className='w-full max-w-md space-y-8 px-4'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-neutral-900 dark:text-neutral-100'>
            {pageT('title')}
          </h2>
        </div>
        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          {error && (
            <div className='rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300'>
              {error}
            </div>
          )}

          <div className='space-y-4'>
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-neutral-700 dark:text-neutral-300'
              >
                {commonT('name')}
              </label>
              <input
                id='name'
                name='name'
                type='text'
                autoComplete='name'
                required
                className='mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-neutral-300 sm:text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-neutral-700 dark:focus:border-neutral-700'
                placeholder={pageT('namePlaceholder')}
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-neutral-700 dark:text-neutral-300'
              >
                {commonT('email')}
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                className='mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-neutral-300 sm:text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-neutral-700 dark:focus:border-neutral-700'
                placeholder={pageT('emailPlaceholder')}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-neutral-700 dark:text-neutral-300'
              >
                {commonT('password')}
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='new-password'
                required
                className='mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-neutral-300 sm:text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-neutral-700 dark:focus:border-neutral-700'
                placeholder={pageT('passwordPlaceholder')}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type='submit'
              disabled={loading}
              className='group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400'
            >
              {loading ? commonT('loading') : pageT('signupButton')}
            </button>
          </div>

          <div className='text-center'>
            <a
              href='/login'
              className='font-medium text-blue-600 hover:text-blue-600/90 dark:text-blue-400 dark:hover:text-blue-300'
            >
              {pageT('alreadyHaveAccount')} {pageT('signInInstead')}
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
