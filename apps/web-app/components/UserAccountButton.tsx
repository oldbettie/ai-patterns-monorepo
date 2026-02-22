// @feature:user-auth @domain:auth @frontend
// @summary: User account button with sign-in link for unauthenticated and dropdown menu for authenticated users

'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { authClient, useUser } from '@/lib/auth'
import { useTranslations } from 'next-intl'
import { AppRoutes } from '@/lib/config/featureToggles'

export function UserAccountButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { isAuthenticated } = useUser()
  const componentT = useTranslations('components.authStatus')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    if (isLoggingOut) return
    setIsOpen(false)
    setIsLoggingOut(true)
    try {
      await authClient.signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Link
        href={AppRoutes.login}
        className='flex items-center px-3 py-2 text-sm border rounded-md hover:bg-gray-50 dark:hover:bg-neutral-800 dark:border-neutral-700'
      >
        {componentT('login')}
      </Link>
    )
  }

  return (
    <div className='relative' ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoggingOut}
        aria-label={componentT('profile')}
        className='h-9 w-9 flex items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800'
      >
        {/* Person icon */}
        <svg
          className='h-5 w-5'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden='true'
        >
          <circle cx='12' cy='8' r='4' />
          <path d='M4 20c0-4 3.6-7 8-7s8 3 8 7' />
        </svg>
      </button>

      {isOpen && (
        <div className='absolute right-0 top-full mt-1 min-w-[140px] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg z-50'>
          <Link
            href={AppRoutes.profile}
            onClick={() => setIsOpen(false)}
            className='block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-neutral-700'
          >
            {componentT('profile')}
          </Link>
          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className='block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-neutral-700 disabled:opacity-50'
          >
            {componentT('logout')}
          </button>
        </div>
      )}
    </div>
  )
}
