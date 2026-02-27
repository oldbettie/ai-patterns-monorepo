'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: Client wrapper for PDFEditorShell to enable dynamic import with ssr: false

import dynamic from 'next/dynamic'

// Dynamic import with ssr: false to prevent server-side rendering
// This avoids DOMMatrix and other browser-only API errors from pdf.js
const PDFEditorShell = dynamic(
  () => import('@/components/pdf/PDFEditorShell').then(mod => ({ default: mod.PDFEditorShell })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading PDF editor...</div>
      </div>
    )
  }
)

interface PDFEditorWrapperProps {
  documentId: string
}

export function PDFEditorWrapper({ documentId }: PDFEditorWrapperProps) {
  return <PDFEditorShell documentId={documentId} />
}
