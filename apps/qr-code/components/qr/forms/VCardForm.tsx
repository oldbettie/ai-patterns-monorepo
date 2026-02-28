'use client'
// @feature:qr-generator @domain:qr @frontend
// @summary: vCard form — collects contact fields (name required, rest optional)

import { useTranslations } from 'next-intl'

export interface VCardFormData {
  name: string
  phone: string
  email: string
  org: string
  title: string
  url: string
  address: string
}

interface VCardFormProps {
  value: VCardFormData
  onChange: (data: VCardFormData) => void
}

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors'

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
        autoComplete="off"
      />
    </div>
  )
}

export function VCardForm({ value, onChange }: VCardFormProps) {
  const t = useTranslations('pages.generate.forms.vcard')
  const update = (partial: Partial<VCardFormData>) => onChange({ ...value, ...partial })

  return (
    <div className="flex flex-col gap-4">
      <Field id="vc-name" label={t('name')} value={value.name} onChange={(v) => update({ name: v })} placeholder={t('namePlaceholder')} required />
      <Field id="vc-phone" label={t('phone')} value={value.phone} onChange={(v) => update({ phone: v })} placeholder={t('phonePlaceholder')} type="tel" />
      <Field id="vc-email" label={t('email')} value={value.email} onChange={(v) => update({ email: v })} placeholder={t('emailPlaceholder')} type="email" />
      <Field id="vc-org" label={t('org')} value={value.org} onChange={(v) => update({ org: v })} placeholder={t('orgPlaceholder')} />
      <Field id="vc-title" label={t('title')} value={value.title} onChange={(v) => update({ title: v })} placeholder={t('titlePlaceholder')} />
      <Field id="vc-url" label={t('url')} value={value.url} onChange={(v) => update({ url: v })} placeholder={t('urlPlaceholder')} type="url" />
      <Field id="vc-address" label={t('address')} value={value.address} onChange={(v) => update({ address: v })} placeholder={t('addressPlaceholder')} />
    </div>
  )
}
