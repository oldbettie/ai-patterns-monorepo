'use client'
// @feature:qr-generator @domain:qr @frontend
// @summary: URL input form — collects URL and passes formatted string up

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

interface URLFormProps {
  value: string
  onChange: (formatted: string) => void
}

export function URLForm({ value, onChange }: URLFormProps) {
  const t = useTranslations('pages.generate.forms.url')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange(raw)
    }, 300)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="qr-url-input" className="text-sm font-medium text-foreground">
        {t('label')}
      </label>
      <input
        id="qr-url-input"
        type="url"
        defaultValue={value}
        onChange={handleChange}
        placeholder={t('placeholder')}
        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
        autoComplete="off"
        spellCheck={false}
      />
      <p className="text-xs text-muted-foreground">
        {t('hint')}
      </p>
    </div>
  )
}
