import { Inter } from 'next/font/google'
import './globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { LanguageSelector } from '@/components/language-selector'
import ThemeToggle from '@/components/theme-toggle'
import LogoutButton from '@/components/logout-button'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://better-stack.example'), // replace with real domain when available
  title: {
    default: 'Better Stack',
    template: '%s — Better Stack',
  },
  description:
    'Monorepo template using Next.js, Better Auth, TailwindCSS, and Drizzle.',
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
      </head>
      <body className={`${inter.variable} bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100`}>
        <NextIntlClientProvider messages={messages}>
          <div className='relative min-h-screen'>
            <header className='absolute top-4 right-4 z-50'>
              <nav aria-label="Global" className='flex items-center gap-2'>
                <LogoutButton />
                <ThemeToggle />
                <LanguageSelector />
              </nav>
            </header>
            <main id="main-content" role="main">{children}</main>
            <footer aria-label="Site footer" />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

