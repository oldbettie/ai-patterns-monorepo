'use client'

import { usePathname } from 'next/navigation'
import ThemeToggle from '@/components/theme-toggle'
import LogoutButton from '@/components/logout-button'
import { LanguageSelector } from '@/components/language-selector'
import { ExportButtonSlot } from '@/lib/context/EditorActionsContext'

export function GlobalHeader() {
  const pathname = usePathname()
  
  // Don't show global header on homepage as it has its own navigation
  if (pathname === '/') {
    return null
  }

  return (
    <header className='absolute top-4 right-4 z-50'>
      <nav aria-label="Global" className='flex items-center gap-2'>
        <LogoutButton />
        <ExportButtonSlot />
        <ThemeToggle />
        <LanguageSelector />
      </nav>
    </header>
  )
}
