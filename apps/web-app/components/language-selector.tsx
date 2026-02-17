'use client'

import { setLanguageAction } from '@/actions/language-actions'
import { locales, type Locale } from '@/lib/i18n/constants'
import { useLocale, useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'

export function LanguageSelector() {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const currentLocale = useLocale() as Locale

  const handleLanguageChange = (locale: Locale) => {
    if (locale === currentLocale) {
      setIsOpen(false)
      return
    }

    startTransition(async () => {
      try {
        await setLanguageAction(locale)
      } catch (error) {
        console.error('Failed to change language:', error)
      }
    })
    setIsOpen(false)
  }

  const commonT = useTranslations('common')
  const componentT = useTranslations('components.languageSelector')

  const getLanguageLabel = (locale: Locale): string => {
    switch (locale) {
      case 'en':
        return 'Eng'
      case 'ja':
        return '日本語'
      default:
        return locale
    }
  }

  const getFullLanguageLabel = (locale: Locale): string => {
    switch (locale) {
      case 'en':
        return commonT('english')
      case 'ja':
        return commonT('japanese')
      default:
        return locale
    }
  }

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className='flex items-center space-x-1.5 px-3 py-2 text-sm border rounded-md hover:bg-gray-50 dark:hover:bg-neutral-800 dark:border-neutral-700 disabled:opacity-50'
      >
        <span>{getLanguageLabel(currentLocale)}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      {isOpen && (
        <div className='absolute top-full mt-1 w-full min-w-[120px] bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded-md shadow-lg z-50'>
          {locales.map(locale => (
            <button
              key={locale}
              onClick={() => handleLanguageChange(locale)}
              disabled={isPending}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-neutral-700 disabled:opacity-50 ${
                locale === currentLocale ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              {getFullLanguageLabel(locale)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
