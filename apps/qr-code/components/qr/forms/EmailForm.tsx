'use client'
// @feature:qr-generator @domain:qr @frontend
// @summary: Email form — to address, optional subject and body

import { useTranslations } from 'next-intl'

export interface EmailFormData {
  to: string
  subject: string
  body: string
}

interface EmailFormProps {
  value: EmailFormData
  onChange: (data: EmailFormData) => void
}

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors'

export function EmailForm({ value, onChange }: EmailFormProps) {
  const t = useTranslations('pages.generate.forms.email')
  const tCommon = useTranslations('common')
  const update = (partial: Partial<EmailFormData>) => onChange({ ...value, ...partial })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email-to" className="text-sm font-medium text-foreground">
          {t('to')} <span className="text-destructive">*</span>
        </label>
        <input
          id="email-to"
          type="email"
          value={value.to}
          onChange={(e) => update({ to: e.target.value })}
          placeholder={t('toPlaceholder')}
          className={inputClass}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email-subject" className="text-sm font-medium text-foreground">
          {t('subject')} <span className="text-muted-foreground text-xs font-normal">{tCommon('optional')}</span>
        </label>
        <input
          id="email-subject"
          type="text"
          value={value.subject}
          onChange={(e) => update({ subject: e.target.value })}
          placeholder={t('subjectPlaceholder')}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email-body" className="text-sm font-medium text-foreground">
          {t('body')} <span className="text-muted-foreground text-xs font-normal">{tCommon('optional')}</span>
        </label>
        <textarea
          id="email-body"
          value={value.body}
          onChange={(e) => update({ body: e.target.value })}
          placeholder={t('bodyPlaceholder')}
          rows={4}
          className={`${inputClass} resize-none`}
        />
        <p className="text-xs text-muted-foreground">{t('hint')}</p>
      </div>
    </div>
  )
}
