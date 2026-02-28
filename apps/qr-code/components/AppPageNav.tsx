'use client'
// @feature:navigation @domain:shared @frontend @reusable
// @summary: Full nav header for authenticated app pages (profile, donate, generate, etc.)

import Link from 'next/link'
import { AppRoutes } from '@/lib/config/featureToggles'
import ThemeToggle from '@/components/theme-toggle'
import { LanguageSelector } from '@/components/language-selector'
import { useTranslations } from 'next-intl'
import { UserAccountButton } from '@/components/UserAccountButton'
import { Link2, Wifi, User, MessageSquare, Mail, FileText, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const TOOL_CONFIGS = [
  { href: '/generate/url', icon: Link2, key: 'url' },
  { href: '/generate/wifi', icon: Wifi, key: 'wifi' },
  { href: '/generate/vcard', icon: User, key: 'vcard' },
  { href: '/generate/sms', icon: MessageSquare, key: 'sms' },
  { href: '/generate/email', icon: Mail, key: 'email' },
  { href: '/generate/text', icon: FileText, key: 'text' },
] as const

interface AppPageNavProps {
  showGeneratorLink?: boolean
}

export function AppPageNav({ showGeneratorLink = true }: AppPageNavProps) {
  const t = useTranslations('components.appNav')
  const tGenerate = useTranslations('pages.generate')
  const [toolsOpen, setToolsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <nav className='w-full border-b border-border bg-background/95 backdrop-blur-md py-3'>
      <div className='container mx-auto px-6 relative flex items-center'>
        {/* Left: logo */}
        <div className='flex items-center gap-3'>
          <Link
            href={AppRoutes.home}
            className='font-display text-2xl text-foreground font-medium tracking-tight'
          >
            Simplified QR
          </Link>
        </div>

        {/* Right: action buttons */}
        <div className='flex items-center gap-4 ml-auto'>
          <UserAccountButton />
          <ThemeToggle />
          <LanguageSelector />
          {showGeneratorLink && (
            <div ref={dropdownRef} className='relative'>
              <button
                onClick={() => setToolsOpen((o) => !o)}
                className='flex items-center gap-1.5 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-all hover:shadow-md font-medium text-sm'
              >
                {t('openGenerator')}
                <ChevronDown className={`w-4 h-4 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>

              {toolsOpen && (
                <div className='absolute right-0 top-full mt-2 w-44 bg-card border border-border rounded-xl shadow-lg py-1.5 z-50'>
                  <Link
                    href={AppRoutes.generate}
                    onClick={() => setToolsOpen(false)}
                    className='block px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                  >
                    {t('allTools')}
                  </Link>
                  <div className='border-t border-border my-1' />
                  {TOOL_CONFIGS.map(({ href, icon: Icon, key }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setToolsOpen(false)}
                      className='flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors'
                    >
                      <Icon className='w-3.5 h-3.5 text-muted-foreground' />
                      {tGenerate(`typeSelector.${key}`)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
