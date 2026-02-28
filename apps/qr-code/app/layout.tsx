import { Space_Grotesk, Inter } from 'next/font/google'
import './globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { GlobalHeader } from '@/components/GlobalHeader'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://qrcode.app'),
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
  title: {
    default: 'Simplified QR',
    template: '%s — Simplified QR',
  },
  description:
    'Free QR code generator. Create QR codes for URLs, WiFi, vCards, SMS, and more. No signup required. Files never leave your device.',
  openGraph: {
    type: 'website',
    siteName: 'Simplified QR',
    title: 'Simplified QR',
    description:
      'Free QR code generator. Create QR codes for URLs, WiFi, vCards, SMS, and more. No signup required.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simplified QR',
    description:
      'Free QR code generator. Create QR codes for URLs, WiFi, vCards, SMS, and more. No signup required.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF8' },
    { media: '(prefers-color-scheme: dark)', color: '#141412' },
  ],
}

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
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
        <meta name="theme-color" content="#FAFAF8" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#141412" media="(prefers-color-scheme: dark)" />
      </head>
      <body className={`${bodyFont.variable} ${displayFont.variable} font-sans bg-background text-foreground antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <div className='flex flex-col h-screen overflow-hidden relative'>
            <div className='flex-1 relative flex flex-col min-h-0'>
              <GlobalHeader />
              <main id="main-content" role="main" className="flex-1 flex flex-col overflow-y-auto min-h-0">{children}</main>
              <footer aria-label="Site footer" />
            </div>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
