'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: Client-side PDF editor shell — loads document from IndexedDB and orchestrates editor state

import { useEffect, useState, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { usePDFEditor } from '@/components/hooks/usePDFEditor'
import { useIndexedDB } from '@/components/hooks/useIndexedDB'
import { useEditorActions } from '@/lib/context/EditorActionsContext'
import { PDFViewer } from '@/components/pdf/PDFViewer'
import { TextElement } from '@/components/pdf/TextElement'
import { SignatureElement } from '@/components/pdf/SignatureElement'
import { TextToolbar } from '@/components/pdf/TextToolbar'
import { PageNavigator } from '@/components/pdf/PageNavigator'
import { SignatureDrawingModal } from '@/components/pdf/SignatureDrawingModal'
import { PDFEditorHeader } from '@/components/pdf/PDFEditorHeader'
import { loadPDFBytes, getPDFPageCount, exportPDF, downloadPDF } from '@/lib/pdf/pdfEditor'
import type { StoredSignature } from '@quick-pdfs/common'

const MIN_SCALE = 0.25
const MAX_SCALE = 3
const SCALE_STEP = 0.001

interface PDFEditorShellProps {
  documentId: string
}

export function PDFEditorShell({ documentId }: PDFEditorShellProps) {
  const t = useTranslations('pages.editor')
  const { getDocument, saveSignature, getSignature, getAllSignatures, deleteSignature } = useIndexedDB()
  const editor = usePDFEditor()
  const { setExportFn, clearExportFn } = useEditorActions()
  const scrollRef = useRef<HTMLDivElement>(null)

  const [toolbarState, setToolbarState] = useState({
    fontFamily: 'Helvetica',
    fontSize: 14,
    color: '#000000',
  })
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [signatureImages, setSignatureImages] = useState<Map<string, string>>(new Map())
  const [documentName, setDocumentName] = useState('document.pdf')
  const [scale, setScale] = useState(1)
  const [storedSignatures, setStoredSignatures] = useState<StoredSignature[]>([])
  const [editingSignatureElementId, setEditingSignatureElementId] = useState<string | null>(null)
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null)

  // Load document and stored signatures on mount
  useEffect(() => {
    const loadDocument = async () => {
      editor.setLoading(true)
      const doc = await getDocument(documentId)
      if (!doc) { editor.setLoading(false); return }
      setDocumentName(doc.name)
      const bytes = await loadPDFBytes(doc.originalFile)
      const pageCount = await getPDFPageCount(bytes)
      editor.setPdfBytes(bytes, pageCount)
    }
    loadDocument()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId])

  // Load stored signatures on mount
  useEffect(() => {
    const loadSignatures = async () => {
      const sigs = await getAllSignatures()
      setStoredSignatures(sigs.sort((a, b) => b.createdAt - a.createdAt))
    }
    loadSignatures()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Register export function in context whenever relevant state changes
  useEffect(() => {
    if (!editor.pdfBytes) return
    const pdfBytes = editor.pdfBytes
    const textElements = editor.textElements
    const signatureElements = editor.signatureElements
    const images = signatureImages
    const filename = documentName
    setExportFn(async () => {
      const bytes = await exportPDF(pdfBytes, textElements, signatureElements, images)
      downloadPDF(bytes, filename)
    })
    return clearExportFn
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.pdfBytes, editor.textElements, editor.signatureElements, signatureImages, documentName])

  // Ctrl/Cmd + scroll to zoom; also intercept browser pinch-zoom on the canvas area
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      setScale(prev =>
        Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev - e.deltaY * SCALE_STEP))
      )
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  const handleAddText = () => {
    editor.addTextElement(100, 100, editor.activePage, toolbarState)
  }

  const handleAddSignature = () => {
    if (storedSignatures.length > 0) {
      const last = storedSignatures[0]
      setSignatureImages(prev => new Map(prev).set(last.id, last.imageData))
      editor.addSignatureElement(100, 100, 120, 60, editor.activePage, last.id)
    } else {
      setShowSignatureModal(true)
    }
  }

  const handleSaveSignature = useCallback(async (newSig: StoredSignature) => {
    if (editingSignatureElementId !== null) {
      // Update in-place: reuse the element's existing signatureId so db.put overwrites the record
      const el = editor.signatureElements.find(e => e.id === editingSignatureElementId)
      if (el) {
        const updatedSig: StoredSignature = { ...newSig, id: el.signatureId }
        await saveSignature(updatedSig)
        setSignatureImages(prev => new Map(prev).set(el.signatureId, newSig.imageData))
        setStoredSignatures(prev => {
          const exists = prev.some(s => s.id === el.signatureId)
          return exists
            ? prev.map(s => s.id === el.signatureId ? updatedSig : s)
            : [updatedSig, ...prev]
        })
      }
      setEditingSignatureElementId(null)
    } else {
      await saveSignature(newSig)
      setSignatureImages(prev => new Map(prev).set(newSig.id, newSig.imageData))
      editor.addSignatureElement(100, 100, 120, 60, editor.activePage, newSig.id)
      setStoredSignatures(prev => [newSig, ...prev])
    }
    setShowSignatureModal(false)
  }, [editingSignatureElementId, editor, saveSignature])

  const handleEditSignature = useCallback((elementId: string) => {
    setEditingSignatureElementId(elementId)
    setShowSignatureModal(true)
  }, [])

  const handleDeleteSignature = useCallback(async (elementId: string, signatureId: string) => {
    await deleteSignature(signatureId)
    editor.removeSignatureElement(elementId)
    setSignatureImages(prev => { const m = new Map(prev); m.delete(signatureId); return m })
    setStoredSignatures(prev => prev.filter(s => s.id !== signatureId))
  }, [deleteSignature, editor])

  // Load signature images for placed signatures not yet in cache
  useEffect(() => {
    const loadImages = async () => {
      const newImages = new Map(signatureImages)
      let changed = false
      for (const sig of editor.signatureElements) {
        if (!newImages.has(sig.signatureId)) {
          const stored = await getSignature(sig.signatureId)
          if (stored) { newImages.set(sig.signatureId, stored.imageData); changed = true }
        }
      }
      if (changed) setSignatureImages(newImages)
    }
    loadImages()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.signatureElements])

  if (editor.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-neutral-400 text-sm">{t('title')}</div>
      </div>
    )
  }

  if (!editor.pdfBytes) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-neutral-400 text-sm">Document not found</div>
      </div>
    )
  }

  const activeTextElements = editor.textElements.filter(el => el.pageIndex === editor.activePage)
  const activeSignatureElements = editor.signatureElements.filter(el => el.pageIndex === editor.activePage)

  return (
    <div className="flex flex-col h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header with filename and navigation */}
      <PDFEditorHeader documentName={documentName} />

      {/* Top toolbar */}
      <div className="flex items-center gap-2 px-4 h-12 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 pr-36">
        <button
          onClick={handleAddText}
          className="px-3 py-1.5 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          {t('addText')}
        </button>
        <button
          onClick={handleAddSignature}
          className="px-3 py-1.5 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          {t('addSignature')}
        </button>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => setScale(prev => Math.max(MIN_SCALE, prev - 0.1))}
            className="w-7 h-7 flex items-center justify-center rounded text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            onClick={() => setScale(1)}
            className="min-w-[3.5rem] text-center text-xs tabular-nums px-1.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            aria-label="Reset zoom"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={() => setScale(prev => Math.min(MAX_SCALE, prev + 0.1))}
            className="w-7 h-7 flex items-center justify-center rounded text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>

      {/* Text toolbar */}
      <TextToolbar
        fontFamily={toolbarState.fontFamily}
        fontSize={toolbarState.fontSize}
        color={toolbarState.color}
        onFontFamilyChange={v => {
          setToolbarState(p => ({ ...p, fontFamily: v }))
          if (selectedTextId) editor.updateTextElement(selectedTextId, { fontFamily: v })
        }}
        onFontSizeChange={v => {
          setToolbarState(p => ({ ...p, fontSize: v }))
          if (selectedTextId) editor.updateTextElement(selectedTextId, { fontSize: v })
        }}
        onColorChange={v => {
          setToolbarState(p => ({ ...p, color: v }))
          if (selectedTextId) editor.updateTextElement(selectedTextId, { color: v })
        }}
      />

      {/* Canvas area — wheel listener attached here for zoom */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto flex items-start justify-center p-8"
        onClick={() => setSelectedTextId(null)}
      >
        <div className="relative shadow-xl">
          <PDFViewer
            pdfBytes={editor.pdfBytes}
            pageIndex={editor.activePage}
            scale={scale}
          />
          {/* Text overlays */}
          {activeTextElements.map(el => (
            <TextElement
              key={el.id}
              element={el}
              scale={scale}
              isSelected={el.id === selectedTextId}
              onUpdate={editor.updateTextElement}
              onRemove={editor.removeTextElement}
              onSelect={() => setSelectedTextId(el.id)}
            />
          ))}
          {/* Signature overlays */}
          {activeSignatureElements.map(el => {
            const imgData = signatureImages.get(el.signatureId)
            if (!imgData) return null
            return (
              <SignatureElement
                key={el.id}
                element={el}
                imageData={imgData}
                scale={scale}
                onUpdate={editor.updateSignatureElement}
                onRemove={editor.removeSignatureElement}
                onEdit={handleEditSignature}
                onDelete={handleDeleteSignature}
              />
            )
          })}
        </div>
      </div>

      {/* Page navigator */}
      <div className="flex items-center justify-center h-12 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
        <PageNavigator
          currentPage={editor.activePage}
          totalPages={editor.totalPages}
          onPageChange={editor.setActivePage}
        />
      </div>

      {showSignatureModal && (
        <SignatureDrawingModal
          onSave={handleSaveSignature}
          onClose={() => {
            setShowSignatureModal(false)
            setEditingSignatureElementId(null)
          }}
        />
      )}
    </div>
  )
}
