'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: Centralizes react-pdf worker configuration. Renders nothing; mounted once in root layout.
// pdfjs is imported dynamically inside useEffect so it is never evaluated during SSR.

import { useEffect } from 'react'

export function PDFWorkerSetup() {
  useEffect(() => {
    import('react-pdf').then(({ pdfjs }) => {
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.mjs'
    })
  }, [])
  return null
}
