'use server'

import { type Locale, LOCALE_COOKIE_NAME, locales } from '@/lib/i18n/constants'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function setLanguageAction(locale: Locale) {
  // fallback to english if its not supported
  if (!locales.includes(locale)) {
    locale = 'en'
  }

  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: false, // Allow client-side access for reading
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  const headersList = await headers()
  const referer = headersList.get('referer')

  if (referer) {
    const url = new URL(referer)
    redirect(url.pathname + url.search)
  } else {
    // Fallback to homepage if no referer
    redirect('/')
  }
}
