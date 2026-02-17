'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: Export button that generates and downloads the annotated PDF

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { exportPDF, downloadPDF } from '@/lib/pdf/pdfEditor'
import type { TextElement, SignatureData } from '@quick-pdfs/common'

interface ExportButtonProps {
  pdfBytes: Uint8Array
  textElements: TextElement[]
  signatureElements: SignatureData[]
  signatureImages: Map<string, string>
  filename?: string
}

export function ExportButton({
  pdfBytes,
  textElements,
  signatureElements,
  signatureImages,
  filename = 'document.pdf',
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)
  const t = useTranslations('pages.editor')

  const handleExport = async () => {
    setExporting(true)
    try {
      const bytes = await exportPDF(pdfBytes, textElements, signatureElements, signatureImages)
      downloadPDF(bytes, filename)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export PDF: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {exporting ? t('export.generating') : t('download')}
    </button>
  )
}
