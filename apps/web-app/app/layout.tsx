import { Inter } from 'next/font/google'
import './globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { LanguageSelector } from '@/components/language-selector'
import ThemeToggle from '@/components/theme-toggle'
import LogoutButton from '@/components/logout-button'
import { EditorActionsProvider, ExportButtonSlot } from '@/lib/context/EditorActionsContext'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'), // replace localhost with real domain when available
  title: {
    default: 'Quick PDFs',
    template: '%s — Quick PDFs',
  },
  description:
    'Modern PDF editing and management platform built with Next.js, Better Auth, TailwindCSS and PostgreSQL Drizzle.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
      </head>
      <body className={`${inter.variable} bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100`}>
        <NextIntlClientProvider messages={messages}> {/* REMOVABLE_FEATURE: Internationalization */}
          <EditorActionsProvider>
            <div className='relative min-h-screen'>
              <header className='absolute top-4 right-4 z-50'>
                <nav aria-label="Global" className='flex items-center gap-2'>
                  <LogoutButton />
                  <ExportButtonSlot />
                  <ThemeToggle />
                  <LanguageSelector /> {/* REMOVABLE_FEATURE: Internationalization */}
                </nav>
              </header>
              <main id="main-content" role="main">{children}</main>
              <footer aria-label="Site footer" />
            </div>
          </EditorActionsProvider>
        </NextIntlClientProvider> {/* REMOVABLE_FEATURE: Internationalization */}
      </body>
    </html>
  )
}

