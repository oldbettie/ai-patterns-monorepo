'use client'

import { usePathname } from 'next/navigation'
import ThemeToggle from '@/components/theme-toggle'
import LogoutButton from '@/components/logout-button'
import { LanguageSelector } from '@/components/language-selector'
import { ExportButtonSlot } from '@/lib/context/EditorActionsContext'
import { Navbar } from '@/components/landing/Navbar'

const LANDING_ROUTES = ['/sign-pdf', '/edit-pdf', '/privacy', '/alternatives']

export function GlobalHeader() {
  const pathname = usePathname()

  // Homepage has its own Navbar inside LandingPage
  if (pathname === '/') {
    return null
  }

  // SEO landing pages get the full landing Navbar
  if (LANDING_ROUTES.some((route) => pathname.startsWith(route))) {
    return <Navbar />
  }

  // Editor and auth pages get the minimal floating header
  return (
    <header className='absolute top-2 right-4 z-50'>
      <nav aria-label="Global" className='flex items-center gap-2'>
        <LogoutButton />
        <ExportButtonSlot />
        <ThemeToggle />
        <LanguageSelector />
      </nav>
    </header>
  )
}
