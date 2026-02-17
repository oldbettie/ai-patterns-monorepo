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

const BASE_FONTS = [
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times-Roman', label: 'Times' },
  { value: 'Courier', label: 'Courier' },
  { value: 'Symbol', label: 'Symbol' },
  { value: 'ZapfDingbats', label: 'Zapf Dingbats' },
]
const SIZE_OPTIONS = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72]

// Parse font family to extract base font and styles
function parseFontFamily(fontFamily: string): { base: string; bold: boolean; italic: boolean } {
  const isBold = fontFamily.includes('Bold')
  const isItalic = fontFamily.includes('Oblique') || fontFamily.includes('Italic')
  
  // Extract base font by removing style suffixes
  let base = fontFamily
    .replace('-BoldOblique', '')
    .replace('-BoldItalic', '')
    .replace('-Bold', '')
    .replace('-Oblique', '')
    .replace('-Italic', '')
  
  // Times fonts need special handling - convert 'Times' to 'Times-Roman'
  if (base === 'Times') {
    base = 'Times-Roman'
  }
  
  return { base, bold: isBold, italic: isItalic }
}

// Construct full font family from base font and style flags
function constructFontFamily(base: string, bold: boolean, italic: boolean): string {
  // Symbol and ZapfDingbats don't have variants
  if (base === 'Symbol' || base === 'ZapfDingbats') {
    return base
  }
  
  if (bold && italic) {
    return base === 'Times-Roman' ? 'Times-BoldItalic' : `${base}-BoldOblique`
  }
  if (bold) {
    return `${base}-Bold`
  }
  if (italic) {
    return base === 'Times-Roman' ? 'Times-Italic' : `${base}-Oblique`
  }
  return base
}

export function TextToolbar({
  fontFamily,
  fontSize,
  color,
  onFontFamilyChange,
  onFontSizeChange,
  onColorChange,
}: TextToolbarProps) {
  const t = useTranslations('pages.editor.text')
  const { base, bold, italic } = parseFontFamily(fontFamily)
  const canToggleStyle = base !== 'Symbol' && base !== 'ZapfDingbats'

  const handleBaseChange = (newBase: string) => {
    onFontFamilyChange(constructFontFamily(newBase, bold, italic))
  }

  const handleBoldToggle = () => {
    onFontFamilyChange(constructFontFamily(base, !bold, italic))
  }

  const handleItalicToggle = () => {
    onFontFamilyChange(constructFontFamily(base, bold, !italic))
  }

  return (
    <div className="flex items-center gap-3 p-2 bg-background border-b border-border">
      <div className="flex items-center gap-1">
        <label className="text-xs text-muted-foreground">{t('fontFamily')}</label>
        <select
          value={base}
          onChange={e => handleBaseChange(e.target.value)}
          className="text-sm rounded border border-input bg-background px-1.5 py-0.5 text-foreground"
        >
          {BASE_FONTS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Bold/Italic buttons */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={handleBoldToggle}
          disabled={!canToggleStyle}
          className={`w-7 h-7 flex items-center justify-center rounded text-sm font-bold transition-colors ${
            bold
              ? 'bg-primary text-primary-foreground'
              : 'bg-accent text-accent-foreground hover:bg-accent/80'
          } disabled:opacity-30 disabled:cursor-not-allowed`}
          aria-label="Bold"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={handleItalicToggle}
          disabled={!canToggleStyle}
          className={`w-7 h-7 flex items-center justify-center rounded text-sm italic transition-colors ${
            italic
              ? 'bg-primary text-primary-foreground'
              : 'bg-accent text-accent-foreground hover:bg-accent/80'
          } disabled:opacity-30 disabled:cursor-not-allowed`}
          aria-label="Italic"
          title="Italic"
        >
          I
        </button>
      </div>

      <div className="flex items-center gap-1">
        <label className="text-xs text-muted-foreground">{t('fontSize')}</label>
        <select
          value={fontSize}
          onChange={e => onFontSizeChange(Number(e.target.value))}
          className="text-sm rounded border border-input bg-background px-1.5 py-0.5 text-foreground"
        >
          {SIZE_OPTIONS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <label className="text-xs text-muted-foreground">{t('color')}</label>
        <input
          type="color"
          value={color}
          onChange={e => onColorChange(e.target.value)}
          className="w-8 h-7 rounded border border-input cursor-pointer bg-transparent"
        />
      </div>
    </div>
  )
}
