'use client'

import { usePathname } from 'next/navigation'
import ThemeToggle from '@/components/theme-toggle'
import { UserAccountButton } from '@/components/UserAccountButton'
import { LanguageSelector } from '@/components/language-selector'
import { Navbar } from '@/components/landing/Navbar'
import { AppPageNav } from '@/components/AppPageNav'

const APP_PAGE_ROUTES = ['/profile', '/donate', '/generate']

export function GlobalHeader() {
  const pathname = usePathname()

  // Homepage has its own Navbar inside LandingPage
  if (pathname === '/') {
    return null
  }

  // App pages (profile, donate, generate) get the full app nav
  if (APP_PAGE_ROUTES.some((route) => pathname.startsWith(route))) {
    return <AppPageNav />
  }

  // Privacy and other SEO pages get the landing Navbar
  if (pathname.startsWith('/privacy') || pathname.startsWith('/alternatives')) {
    return <Navbar />
  }

  // Auth and other pages get the minimal floating header
  return (
    <header className='absolute top-2 right-4 z-50'>
      <nav aria-label="Global" className='flex items-center gap-2'>
        <UserAccountButton />
        <ThemeToggle />
        <LanguageSelector />
      </nav>
    </header>
  )
}
