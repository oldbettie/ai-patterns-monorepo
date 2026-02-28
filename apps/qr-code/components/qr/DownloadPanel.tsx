'use client'
// @feature:qr-generator @domain:qr @frontend
// @summary: Download buttons for PNG, SVG, and print

import { useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface DownloadPanelProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  qrRef: React.MutableRefObject<any>
  disabled?: boolean
  label?: string
}

export function DownloadPanel({ qrRef, disabled, label = 'qr-code' }: DownloadPanelProps) {
  const t = useTranslations('pages.generate.download')
  const [downloadingPNG, setDownloadingPNG] = useState(false)
  const [downloadingSVG, setDownloadingSVG] = useState(false)

  const handleDownloadPNG = async () => {
    if (!qrRef.current) return
    setDownloadingPNG(true)
    try {
      const { downloadAsPNG } = await import('@/lib/qr/qrGenerator')
      await downloadAsPNG(qrRef.current, `${label}.png`)
    } finally {
      setDownloadingPNG(false)
    }
  }

  const handleDownloadSVG = async () => {
    if (!qrRef.current) return
    setDownloadingSVG(true)
    try {
      const { downloadAsSVG } = await import('@/lib/qr/qrGenerator')
      await downloadAsSVG(qrRef.current, `${label}.svg`)
    } finally {
      setDownloadingSVG(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={handleDownloadPNG}
        disabled={disabled || downloadingPNG || !qrRef.current}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        <Download className="w-4 h-4" />
        {downloadingPNG ? t('downloading') : t('png')}
      </button>

      <button
        onClick={handleDownloadSVG}
        disabled={disabled || downloadingSVG || !qrRef.current}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
      >
        <Download className="w-4 h-4" />
        {downloadingSVG ? t('downloading') : t('svg')}
      </button>

      <button
        onClick={handlePrint}
        disabled={disabled || !qrRef.current}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors print:hidden"
      >
        <Printer className="w-4 h-4" />
        {t('print')}
      </button>
    </div>
  )
}
