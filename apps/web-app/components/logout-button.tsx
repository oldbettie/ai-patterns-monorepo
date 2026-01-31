// @feature:user-auth @domain:auth @frontend
// @summary: Logout button component for header navigation with Better Auth integration

'use client'

import { authClient, useUser } from '@/lib/auth'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { isAuthenticated } = useUser()
  const componentT = useTranslations('components.authStatus')

  // Don't render if user is not authenticated
  if (!isAuthenticated) {
    return null
  }

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    try {
      await authClient.signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      aria-label={componentT('logout')}
      className="h-9 w-9 rounded-md border border-neutral-200 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
      title={componentT('logout')}
    >
      {/* Logout/Exit door icon */}
      <svg 
        className="mx-auto h-5 w-5" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        aria-hidden="true"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16,17 21,12 16,7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </button>
  )
}