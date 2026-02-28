'use client'
// @feature:qr-generator @domain:qr @frontend
// @summary: SMS form — phone number and optional pre-filled message

import { useTranslations } from 'next-intl'

export interface SMSFormData {
  phone: string
  message: string
}

interface SMSFormProps {
  value: SMSFormData
  onChange: (data: SMSFormData) => void
}

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors'

export function SMSForm({ value, onChange }: SMSFormProps) {
  const t = useTranslations('pages.generate.forms.sms')
  const tCommon = useTranslations('common')
  const update = (partial: Partial<SMSFormData>) => onChange({ ...value, ...partial })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="sms-phone" className="text-sm font-medium text-foreground">
          {t('phone')} <span className="text-destructive">*</span>
        </label>
        <input
          id="sms-phone"
          type="tel"
          value={value.phone}
          onChange={(e) => update({ phone: e.target.value })}
          placeholder={t('phonePlaceholder')}
          className={inputClass}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="sms-message" className="text-sm font-medium text-foreground">
          {t('message')} <span className="text-muted-foreground text-xs font-normal">{tCommon('optional')}</span>
        </label>
        <textarea
          id="sms-message"
          value={value.message}
          onChange={(e) => update({ message: e.target.value })}
          placeholder={t('messagePlaceholder')}
          rows={3}
          className={`${inputClass} resize-none`}
        />
        <p className="text-xs text-muted-foreground">{t('hint')}</p>
      </div>
    </div>
  )
}
