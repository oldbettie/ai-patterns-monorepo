export const locales = ['en', 'ja'] as const
export const defaultLocale = 'en' as const

export type Locale = (typeof locales)[number]

export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE'
