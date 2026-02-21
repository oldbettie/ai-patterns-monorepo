import { Instrument_Serif, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { EditorActionsProvider } from '@/lib/context/EditorActionsContext'
import { GlobalHeader } from '@/components/GlobalHeader'
import { PDFWorkerSetup } from '@/components/pdf/PDFWorkerSetup'
import { AnnouncementBanner } from '@/components/landing/AnnouncementBanner'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://simplifiedpdf.com'),
  verification: {
    google: 'MqoJOkIY5M9o2d-HAXo76DvJFHoOVXw1B6dMeXYJPSw', // from Step 1
  },
  title: {
    default: 'SimplifiedPDF',
    template: '%s — SimplifiedPDF',
  },
  description:
    'Modern , simple and free PDF editing software for everyone, browser based and local first',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF8' },
    { media: '(prefers-color-scheme: dark)', color: '#141412' },
  ],
}

const displayFont = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const bodyFont = Plus_Jakarta_Sans({
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
          <PDFWorkerSetup />
          <EditorActionsProvider>
            <div className='flex flex-col min-h-screen relative'>
              <AnnouncementBanner />
              <div className='flex-1 relative flex flex-col'>
                <GlobalHeader />
                <main id="main-content" role="main" className="flex-1">{children}</main>
                <footer aria-label="Site footer" />
              </div>
            </div>
          </EditorActionsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
