'use client'

import { useSession, authClient } from '@/lib/auth'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { AppRoutes, FeatureToggles } from '@/lib/config/featureToggles'

export default function AuthStatus() {
  const { data: session, isPending } = useSession()
  const componentT = useTranslations('components.authStatus')
  const commonT = useTranslations('common')

  if (isPending) {
    return (
      <div className='bg-white rounded-lg shadow-md p-4 max-w-md mx-auto'>
        <div className='animate-pulse'>
          <div className='h-4 bg-gray-200 rounded w-1/2 mb-2' />
          <div className='h-4 bg-gray-200 rounded w-3/4' />
        </div>
      </div>
    )
  }

  if (!session) {
    // Don't show auth status if auth features are disabled
    if (!FeatureToggles.enableLogin && !FeatureToggles.enableSignup) {
      return null
    }

    return (
      <div className='bg-white rounded-lg shadow-md p-6 max-w-md mx-auto'>
        <h3 className='text-lg font-semibold text-gray-800 mb-4'>
          {componentT('authenticationStatus')}
        </h3>
        <p className='text-gray-600 mb-4'>{componentT('loggedOut')}</p>
        <div className='flex space-x-3'>
          {FeatureToggles.enableLogin && (
            <Link
              href={AppRoutes.login}
              className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors'
            >
              {componentT('login')}
            </Link>
          )}
          {FeatureToggles.enableSignup && (
            <Link
              href={AppRoutes.signup}
              className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors'
            >
              {componentT('signup')}
            </Link>
          )}
        </div>
      </div>
    )
  }

  const handleSignOut = async () => {
    await authClient.signOut()
  }

  return (
    <div className='bg-white rounded-lg shadow-md p-6 max-w-md mx-auto'>
      <h3 className='text-lg font-semibold text-gray-800 mb-4'>
        {componentT('authenticationStatus')}
      </h3>
      <div className='space-y-2 mb-4'>
        <p className='text-gray-600'>
          <span className='font-medium'>{commonT('name')}:</span>{' '}
          {session.user.name}
        </p>
        <p className='text-gray-600'>
          <span className='font-medium'>{commonT('email')}:</span>{' '}
          {session.user.email}
        </p>
        <p className='text-gray-600'>
          <span className='font-medium'>{componentT('verified')}:</span>{' '}
          {session.user.emailVerified ? commonT('yes') : commonT('no')}
        </p>
      </div>

      <div className='flex space-x-3'>
        <button
          onClick={handleSignOut}
          className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors'
        >
          {componentT('logout')}
        </button>
      </div>
    </div>
  )
}
