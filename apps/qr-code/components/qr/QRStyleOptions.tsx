'use client'
// @feature:qr-generator @domain:qr @frontend @reusable
// @summary: QR appearance controls — foreground color, background color, dot style

import type { QRToolOptions } from '@/components/hooks/useQRTool'
import type { QRDotStyle } from '@/lib/qr/qrHistoryTypes'
import { useTranslations } from 'next-intl'

interface QRStyleOptionsProps {
  options: QRToolOptions
  onChange: (options: QRToolOptions) => void
}

const DOT_STYLE_KEYS: { value: QRDotStyle; tKey: string }[] = [
  { value: 'square', tKey: 'dotStyleSquare' },
  { value: 'rounded', tKey: 'dotStyleRounded' },
  { value: 'dots', tKey: 'dotStyleDots' },
]

export function QRStyleOptions({ options, onChange }: QRStyleOptionsProps) {
  const t = useTranslations('pages.generate.customise')

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium text-foreground">{t('label')}</h3>
      <div className="flex flex-wrap gap-4">
        {/* Foreground color */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="qr-fg-color" className="text-xs text-muted-foreground">
            {t('fgColor')}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="qr-fg-color"
              type="color"
              value={options.fgColor}
              onChange={(e) => onChange({ ...options, fgColor: e.target.value })}
              className="w-8 h-8 rounded-md border border-border cursor-pointer bg-background"
            />
            <span className="text-xs font-mono text-muted-foreground">{options.fgColor}</span>
          </div>
        </div>

        {/* Background color */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="qr-bg-color" className="text-xs text-muted-foreground">
            {t('bgColor')}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="qr-bg-color"
              type="color"
              value={options.bgColor}
              onChange={(e) => onChange({ ...options, bgColor: e.target.value })}
              className="w-8 h-8 rounded-md border border-border cursor-pointer bg-background"
            />
            <span className="text-xs font-mono text-muted-foreground">{options.bgColor}</span>
          </div>
        </div>

        {/* Dot style */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">{t('dotStyle')}</span>
          <div className="flex gap-1.5">
            {DOT_STYLE_KEYS.map((style) => (
              <button
                key={style.value}
                onClick={() => onChange({ ...options, dotStyle: style.value })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  options.dotStyle === style.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:bg-muted'
                }`}
              >
                {t(style.tKey)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
