'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: Toolbar for controlling font, size, and color of text elements

import { useTranslations } from 'next-intl'

interface TextToolbarProps {
  fontFamily: string
  fontSize: number
  color: string
  onFontFamilyChange: (value: string) => void
  onFontSizeChange: (value: number) => void
  onColorChange: (value: string) => void
}

const FONT_OPTIONS = [
  'Helvetica',
  'Helvetica-Bold',
  'Helvetica-Oblique',
  'Helvetica-BoldOblique',
  'Times-Roman',
  'Times-Bold',
  'Times-Italic',
  'Times-BoldItalic',
  'Courier',
  'Courier-Bold',
  'Courier-Oblique',
  'Courier-BoldOblique',
  'Symbol',
  'ZapfDingbats'
]
const SIZE_OPTIONS = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72]

export function TextToolbar({
  fontFamily,
  fontSize,
  color,
  onFontFamilyChange,
  onFontSizeChange,
  onColorChange,
}: TextToolbarProps) {
  const t = useTranslations('pages.editor.text')

  return (
    <div className="flex items-center gap-3 p-2 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center gap-1">
        <label className="text-xs text-neutral-500">{t('fontFamily')}</label>
        <select
          value={fontFamily}
          onChange={e => onFontFamilyChange(e.target.value)}
          className="text-sm rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-1.5 py-0.5"
        >
          {FONT_OPTIONS.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <label className="text-xs text-neutral-500">{t('fontSize')}</label>
        <select
          value={fontSize}
          onChange={e => onFontSizeChange(Number(e.target.value))}
          className="text-sm rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-1.5 py-0.5"
        >
          {SIZE_OPTIONS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <label className="text-xs text-neutral-500">{t('color')}</label>
        <input
          type="color"
          value={color}
          onChange={e => onColorChange(e.target.value)}
          className="w-8 h-7 rounded border border-neutral-200 dark:border-neutral-700 cursor-pointer"
        />
      </div>
    </div>
  )
}
