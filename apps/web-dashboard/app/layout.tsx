import { Inter } from 'next/font/google'
import './globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { LanguageSelector } from '@/components/language-selector'
import ThemeToggle from '@/components/theme-toggle'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://autoclip.example'), // replace with real domain when available
  title: {
    default: 'Auto Clipboard Sync — Copy once, paste anywhere',
    template: '%s — Auto Clipboard Sync',
  },
  description:
    'Cross-device clipboard that securely synchronizes text and images in real time across your devices.',
  applicationName: 'Auto Clipboard Sync',
  keywords: [
    'clipboard sync',
    'copy paste across devices',
    'realtime sync',
    'websocket',
    'privacy',
  ],
  authors: [{ name: 'Auto Clipboard Sync' }],
  creator: 'Auto Clipboard Sync',
  publisher: 'Auto Clipboard Sync',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Auto Clipboard Sync — Copy once, paste anywhere',
    description:
      'Cross-device clipboard that securely synchronizes text and images in real time across your devices.',
    url: 'https://autoclip.example/',
    siteName: 'Auto Clipboard Sync',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Auto Clipboard Sync',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Auto Clipboard Sync — Copy once, paste anywhere',
    description:
      'Cross-device clipboard that securely synchronizes text and images in real time across your devices.',
    images: ['/opengraph-image.png'],
  },
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

