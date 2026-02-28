'use client'
// @feature:qr-generator @domain:qr @frontend
// @summary: WiFi form — collects SSID, password, security type, hidden flag

import { useTranslations } from 'next-intl'

export interface WiFiFormData {
  ssid: string
  password: string
  encryption: 'WPA' | 'WEP' | 'nopass'
  hidden: boolean
}

interface WiFiFormProps {
  value: WiFiFormData
  onChange: (data: WiFiFormData) => void
}

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors'

export function WiFiForm({ value, onChange }: WiFiFormProps) {
  const t = useTranslations('pages.generate.forms.wifi')
  const update = (partial: Partial<WiFiFormData>) => onChange({ ...value, ...partial })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="wifi-ssid" className="text-sm font-medium text-foreground">
          {t('ssid')} <span className="text-destructive">*</span>
        </label>
        <input
          id="wifi-ssid"
          type="text"
          value={value.ssid}
          onChange={(e) => update({ ssid: e.target.value })}
          placeholder={t('ssidPlaceholder')}
          className={inputClass}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="wifi-password" className="text-sm font-medium text-foreground">
          {t('password')}
        </label>
        <input
          id="wifi-password"
          type="text"
          value={value.password}
          onChange={(e) => update({ password: e.target.value })}
          placeholder={t('passwordPlaceholder')}
          className={inputClass}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">{t('security')}</span>
        <div className="flex gap-2">
          {(['WPA', 'WEP', 'nopass'] as const).map((enc) => (
            <button
              key={enc}
              onClick={() => update({ encryption: enc })}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                value.encryption === enc
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:bg-muted'
              }`}
            >
              {enc === 'nopass' ? t('encNone') : enc}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={value.hidden}
          onChange={(e) => update({ hidden: e.target.checked })}
          className="w-4 h-4 rounded border-border accent-primary"
        />
        <span className="text-sm text-foreground">{t('hidden')}</span>
      </label>
    </div>
  )
}
