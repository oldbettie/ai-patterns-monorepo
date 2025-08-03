import { Inter } from 'next/font/google'
import './globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { LanguageSelector } from '@/components/language-selector'
import ThemeToggle from '@/components/theme-toggle'

export const metadata = {
  metadataBase: new URL('https://familyprivacyproxy.example'), // replace with real domain when available
  title: {
    default: 'Family Privacy Proxy — Privacy when it matters, Performance when you need it!',
    template: '%s — Family Privacy Proxy',
  },
  description:
    "Family focused VPN and smart routing. You decide what's best for your family online—fast for games and calls, private for tracking-heavy sites.",
  applicationName: 'Family Privacy Proxy',
  keywords: [
    'family vpn',
    'privacy',
    'parental controls',
    'cloudflare',
    'proxy',
    'low latency gaming',
    'hybrid routing',
  ],
  authors: [{ name: 'Family Privacy Proxy' }],
  creator: 'Family Privacy Proxy',
  publisher: 'Family Privacy Proxy',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Family Privacy Proxy — Privacy when it matters, Performance when you need it!',
    description:
      "Family focused VPN and smart routing. You decide what's best for your family online—fast for games and calls, private for tracking-heavy sites.",
    url: 'https://familyprivacyproxy.example/',
    siteName: 'Family Privacy Proxy',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Family Privacy Proxy',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Family Privacy Proxy — Privacy when it matters, Performance when you need it!',
    description:
      "Family focused VPN and smart routing. You decide what's best for your family online—fast for games and calls, private for tracking-heavy sites.",
    images: ['/opengraph-image.png'],
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
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

