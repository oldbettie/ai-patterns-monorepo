import { Inter } from 'next/font/google'
import './globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { LanguageSelector } from '@/components/language-selector'
import ThemeToggle from '@/components/theme-toggle'

export const metadata = {
  title: 'Better Stack',
  description:
    'Build SaaS projects quickly with self hosted better-auth and postgres. Opinionated and strict to allow you to build quickly',
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
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100`}>
        <NextIntlClientProvider messages={messages}>
          <div className='relative min-h-screen'>
            <div className='absolute top-4 right-4 z-50 flex items-center gap-2'>
              <ThemeToggle />
              <LanguageSelector />
            </div>
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

