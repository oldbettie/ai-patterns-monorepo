'use client'

import { usePathname } from 'next/navigation'
import ThemeToggle from '@/components/theme-toggle'
import { UserAccountButton } from '@/components/UserAccountButton'
import { LanguageSelector } from '@/components/language-selector'
import { ExportButtonSlot } from '@/lib/context/EditorActionsContext'
import { Navbar } from '@/components/landing/Navbar'
import { AppPageNav } from '@/components/AppPageNav'

const LANDING_ROUTES = ['/sign-pdf', '/edit-pdf', '/privacy', '/alternatives']
const APP_PAGE_ROUTES = ['/profile', '/donate']

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

  // Editor gets the app nav without the Open Editor link, but with the export slot
  if (pathname.startsWith('/editor')) {
    return <AppPageNav showEditorLink={false} showExportSlot />
  }

  // App pages (profile, donate) get the full app nav
  if (APP_PAGE_ROUTES.some((route) => pathname.startsWith(route))) {
    return <AppPageNav />
  }

  // Editor and auth pages get the minimal floating header
  return (
    <header className='absolute top-2 right-4 z-50'>
      <nav aria-label="Global" className='flex items-center gap-2'>
        <ExportButtonSlot />
        <UserAccountButton />
        <ThemeToggle />
        <LanguageSelector />
      </nav>
    </header>
  )
}
