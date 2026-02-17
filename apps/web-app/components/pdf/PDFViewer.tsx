'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: React PDF viewer component using react-pdf with worker configuration

import { useEffect, useState, useMemo } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

interface PDFViewerProps {
  pdfBytes: Uint8Array
  pageIndex: number
  scale?: number
  onPageLoad?: (width: number, height: number) => void
}

export function PDFViewer({ pdfBytes, pageIndex, scale = 1, onPageLoad }: PDFViewerProps) {
  const [workerReady, setWorkerReady] = useState(false)

  useEffect(() => {
    // Configure pdfjs worker in useEffect to avoid Next.js SSR issues
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
    setWorkerReady(true)
  }, [])

  // Give react-pdf its own copy so pdf.js can transfer/detach the ArrayBuffer
  // to its worker without emptying the Uint8Array held in editor state.
  const file = useMemo(() => ({ data: pdfBytes.slice() }), [pdfBytes])

  if (!workerReady) return null

  return (
    <Document file={file} loading={null} error={null}>
      <Page
        pageIndex={pageIndex}
        scale={scale}
        renderTextLayer={false}
        renderAnnotationLayer={false}
        onLoadSuccess={page => {
          // Report natural (unscaled) dimensions so the shell can track them
          onPageLoad?.(page.originalWidth, page.originalHeight)
        }}
      />
    </Document>
  )
}
