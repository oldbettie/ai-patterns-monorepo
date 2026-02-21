'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: Left sidebar showing thumbnail previews of all PDF pages with active page highlight

import { useEffect, useRef, useState } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

interface PDFPageThumbnailsProps {
  pdfBytes: Uint8Array
  totalPages: number
  activePage: number
  onPageClick: (pageIndex: number) => void
}

export function PDFPageThumbnails({ pdfBytes, totalPages, activePage, onPageClick }: PDFPageThumbnailsProps) {
  const thumbRefs = useRef<(HTMLDivElement | null)[]>([])

  // Create the file object exactly once per mount. The thumbnail panel only needs
  // the original bytes (overlays are rendered as HTML, not embedded in the PDF),
  // so a one-time copy is both correct and prevents react-pdf's "file changed" warning.
  const [file] = useState(() => ({ data: pdfBytes.slice() }))

  // Scroll the active thumbnail into view when activePage changes
  useEffect(() => {
    thumbRefs.current[activePage]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activePage])

  return (
    <div
      className="w-[152px] flex-shrink-0 overflow-y-auto border-r border-border bg-background flex flex-col gap-2 py-2 px-2"
    >
      <Document file={file} loading={null} error={null}>
        {Array.from({ length: totalPages }, (_, i) => (
          <div
            key={i}
            ref={el => { thumbRefs.current[i] = el }}
            onClick={() => onPageClick(i)}
            className={`flex flex-col items-center gap-1 cursor-pointer rounded p-1 transition-colors hover:bg-accent/50 ${
              activePage === i ? 'ring-2 ring-primary rounded' : ''
            }`}
          >
            <div className="pointer-events-none">
              <Page
                pageIndex={i}
                width={120}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={<div className="w-[120px] h-[160px] bg-muted animate-pulse rounded" />}
              />
            </div>
            <span className="text-xs text-muted-foreground select-none">{i + 1}</span>
          </div>
        ))}
      </Document>
    </div>
  )
}
