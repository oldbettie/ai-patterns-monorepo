'use client'
// @feature:dashboard @domain:documents @frontend
// @summary: Drag-and-drop PDF upload zone that saves documents to IndexedDB

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { v4 as uuidv4 } from 'uuid'
import { useIndexedDB } from '@/components/hooks/useIndexedDB'
import { getPDFPageCount, loadPDFBytes } from '@/lib/pdf/pdfEditor'
import type { PDFDocument } from '@quick-pdfs/common'

export function FileUploadZone() {
  const t = useTranslations('pages.dashboard')
  const router = useRouter()
  const { saveDocument } = useIndexedDB()
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [storageWarning, setStorageWarning] = useState(false)

  const processFile = useCallback(async (file: File) => {
    if (!file.type.includes('pdf')) return
    setIsProcessing(true)

    try {
      // Check storage estimate
      if ('storage' in navigator) {
        const estimate = await navigator.storage.estimate()
        const usedPercent = (estimate.usage ?? 0) / (estimate.quota ?? 1)
        if (usedPercent > 0.85) { setStorageWarning(true) }
      }

      const bytes = await loadPDFBytes(file)
      const pageCount = await getPDFPageCount(bytes)
      const id = uuidv4()

      const doc: PDFDocument = {
        id,
        name: file.name,
        originalFile: new Blob([bytes], { type: 'application/pdf' }),
        modifiedFile: null,
        thumbnail: null,
        pageCount,
        fileSize: file.size,
        textElements: [],
        signatureData: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      await saveDocument(doc)
      router.push(`/editor/${id}`)
    } finally {
      setIsProcessing(false)
    }
  }, [saveDocument, router])

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  return (
    <div>
      {storageWarning && (
        <div className="mb-3 px-3 py-2 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm">
          {t('storage.warning')}
        </div>
      )}
      <label
        onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${
          isDragOver
            ? 'border-primary/50 bg-accent/20'
            : 'border-border hover:border-primary/30 bg-card hover:bg-accent/10'
        }`}
      >
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="sr-only"
          disabled={isProcessing}
        />
        <div className="text-muted-foreground">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3M20 16.5A3.5 3.5 0 0016.5 13H15a5 5 0 10-9.9 1A4 4 0 005 21h14.5" />
          </svg>
        </div>
        <div className="text-sm font-medium text-foreground">
          {isProcessing ? t('upload.label') : t('upload.dragDrop')}
        </div>
        <div className="text-xs text-muted-foreground">{t('upload.accept')}</div>
      </label>
    </div>
  )
}
