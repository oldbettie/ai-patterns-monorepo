import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import {
  defaultLocale,
  LOCALE_COOKIE_NAME,
  locales,
  type Locale,
} from './constants'

export default getRequestConfig(async () => {
  let locale: Locale = defaultLocale

  // Check for saved locale in cookie first
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)

  if (localeCookie?.value && locales.includes(localeCookie.value as Locale)) {
    locale = localeCookie.value as Locale
  } else {
    // Fallback to device language detection
    const headersList = await headers()
    const acceptLanguage = headersList.get('accept-language')

    if (acceptLanguage) {
      const languages = acceptLanguage
        .split(',')
        .map(lang => lang.split(';')[0].trim())
        .map(lang => lang.split('-')[0])

      for (const lang of languages) {
        if (locales.includes(lang as Locale)) {
          locale = lang as Locale
          break
        }
      }
    }

    // finally if no cookie and the language is not supported fallback to english
    if (!locales.find(l => l === locale)) {
      locale = 'en'
    }
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
