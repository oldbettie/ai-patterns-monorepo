'use client'
// @feature:qr-generator @domain:qr @frontend
// @summary: Plain text form — textarea for any text content

import { useTranslations } from 'next-intl'

interface TextFormProps {
  value: string
  onChange: (formatted: string) => void
}

export function TextForm({ value, onChange }: TextFormProps) {
  const t = useTranslations('pages.generate.forms.text')

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="qr-text-input" className="text-sm font-medium text-foreground">
        {t('label')}
      </label>
      <textarea
        id="qr-text-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('placeholder')}
        rows={5}
        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
      />
      <p className="text-xs text-muted-foreground">
        {t('hint')}
      </p>
    </div>
  )
}
