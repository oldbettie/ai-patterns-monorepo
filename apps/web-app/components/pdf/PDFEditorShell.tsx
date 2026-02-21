'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: Client-side PDF editor shell — loads document from IndexedDB and orchestrates editor state

import { useEffect, useState, useCallback, useRef } from 'react'
import { MousePointer2, Type, PenLine } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { usePDFEditor } from '@/components/hooks/usePDFEditor'
import { useIndexedDB } from '@/components/hooks/useIndexedDB'
import { useEditorActions } from '@/lib/context/EditorActionsContext'
import { TextElement } from '@/components/pdf/TextElement'
import { SignatureElement } from '@/components/pdf/SignatureElement'
import { TextToolbar } from '@/components/pdf/TextToolbar'
import { SignatureDrawingModal } from '@/components/pdf/SignatureDrawingModal'
import { PDFEditorHeader } from '@/components/pdf/PDFEditorHeader'
import { PDFPageThumbnails } from '@/components/pdf/PDFPageThumbnails'
import { loadPDFBytes, getPDFPageCount, exportPDF, downloadPDF } from '@/lib/pdf/pdfEditor'
import type { StoredSignature } from '@quick-pdfs/common'

const MIN_SCALE = 0.25
const MAX_SCALE = 3
const SCALE_STEP = 0.001

type ActiveTool = 'selector' | 'text' | 'signature'

interface PDFEditorShellProps {
  documentId: string
}

export function PDFEditorShell({ documentId }: PDFEditorShellProps) {
  const t = useTranslations('pages.editor')
  const { getDocument, saveSignature, getSignature, getAllSignatures, deleteSignature } = useIndexedDB()
  const editor = usePDFEditor()
  const { setExportFn, clearExportFn } = useEditorActions()
  const scrollRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<(HTMLDivElement | null)[]>([])

  const [activeTool, setActiveTool] = useState<ActiveTool>('selector')
  const [pendingTextPlacement, setPendingTextPlacement] = useState(false)

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
  const [editingStoredSignatureId, setEditingStoredSignatureId] = useState<string | null>(null)
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null)

  // Create the file object exactly once when pdfBytes first becomes available.
  // A stable reference prevents react-pdf from reloading the document on every re-render.
  const mainFileRef = useRef<{ data: Uint8Array } | null>(null)
  if (editor.pdfBytes && !mainFileRef.current) {
    mainFileRef.current = { data: editor.pdfBytes.slice() }
  }
  const mainFile = mainFileRef.current

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

  // IntersectionObserver to track which page is most visible
  useEffect(() => {
    if (!editor.totalPages) return
    const observer = new IntersectionObserver((entries) => {
      let best: IntersectionObserverEntry | null = null
      for (const e of entries) {
        if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio))
          best = e
      }
      if (best) {
        const idx = pageRefs.current.findIndex(el => el === best!.target)
        if (idx !== -1) editor.setActivePage(idx)
      }
    }, { root: scrollRef.current, threshold: [0.1, 0.3, 0.5, 0.7, 1.0] })

    pageRefs.current.forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.totalPages, editor.setActivePage])

  const handleThumbnailClick = useCallback((pageIndex: number) => {
    pageRefs.current[pageIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>, pageIndex: number) => {
    if (activeTool === 'selector') return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale

    if (activeTool === 'text') {
      if (!pendingTextPlacement) return
      const newId = editor.addTextElement(x, y, pageIndex, toolbarState)
      setSelectedTextId(newId)
      setPendingTextPlacement(false)
    } else if (activeTool === 'signature') {
      if (storedSignatures.length > 0) {
        const last = storedSignatures[0]
        const placementId = crypto.randomUUID()
        setSignatureImages(prev => new Map(prev).set(placementId, last.imageData))
        editor.addSignatureElement(x, y, 120, 60, pageIndex, placementId)
      } else {
        setShowSignatureModal(true)
      }
    }
    e.stopPropagation()
  }

  const handleSaveSignature = useCallback(async (newSig: StoredSignature) => {
    if (editingSignatureElementId !== null) {
      // Edit a specific canvas element — only update its in-memory image, no storage changes
      const el = editor.signatureElements.find(e => e.id === editingSignatureElementId)
      if (el) {
        setSignatureImages(prev => new Map(prev).set(el.signatureId, newSig.imageData))
      }
      setEditingSignatureElementId(null)
    } else if (editingStoredSignatureId !== null) {
      // Edit the toolbar template — delete old, save new; canvas elements are untouched
      await deleteSignature(editingStoredSignatureId)
      await saveSignature(newSig)
      setStoredSignatures(prev => [newSig, ...prev.filter(s => s.id !== editingStoredSignatureId)])
      setEditingStoredSignatureId(null)
    } else {
      // New signature drawn — save as template, place a separate copy on canvas
      await saveSignature(newSig)
      setStoredSignatures(prev => [newSig, ...prev])
      const placementId = crypto.randomUUID()
      setSignatureImages(prev => new Map(prev).set(placementId, newSig.imageData))
      editor.addSignatureElement(100, 100, 120, 60, editor.activePage, placementId)
    }
    setShowSignatureModal(false)
  }, [editingSignatureElementId, editingStoredSignatureId, editor, saveSignature, deleteSignature])

  const handleEditSignature = useCallback((elementId: string) => {
    setEditingSignatureElementId(elementId)
    setShowSignatureModal(true)
  }, [])

  const handleEditStoredSignature = useCallback((signatureId: string) => {
    setEditingStoredSignatureId(signatureId)
    setShowSignatureModal(true)
  }, [])

  const handleRemoveStoredSignature = useCallback(async (signatureId: string) => {
    await deleteSignature(signatureId)
    setStoredSignatures(prev => prev.filter(s => s.id !== signatureId))
  }, [deleteSignature])

  const handleDeleteSignature = useCallback((elementId: string, signatureId: string) => {
    editor.removeSignatureElement(elementId)
    setSignatureImages(prev => { const m = new Map(prev); m.delete(signatureId); return m })
  }, [editor])

  // Load signature images for placed signatures not yet in cache
  useEffect(() => {
    const loadImages = async () => {
      let missingIds: string[] = []

      setSignatureImages(prevImages => {
        missingIds = editor.signatureElements
          .map(sig => sig.signatureId)
          .filter(id => !prevImages.has(id))
        return prevImages
      })

      if (missingIds.length === 0) return

      const results = await Promise.all(
        missingIds.map(async id => {
          const stored = await getSignature(id)
          return stored ? { id, imageData: stored.imageData } : null
        })
      )

      setSignatureImages(currentImages => {
        const newImages = new Map(currentImages)
        let changed = false
        for (const result of results) {
          if (result && !newImages.has(result.id)) {
            newImages.set(result.id, result.imageData)
            changed = true
          }
        }
        return changed ? newImages : currentImages
      })
    }
    loadImages()
  }, [editor.signatureElements, getSignature])

  if (editor.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-neutral-400 text-sm">{t('title')}</div>
      </div>
    )
  }

  if (!editor.pdfBytes || !mainFile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-neutral-400 text-sm">Document not found</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header with filename and navigation */}
      <PDFEditorHeader documentName={documentName} />

      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 h-12 bg-background border-b border-border">
        {/* Left: Tool selector */}
        <div className="w-full flex items-center">
          <div className="flex items-center bg-accent rounded-lg p-1 gap-0.5">
            <button
              onClick={() => { setActiveTool('selector'); setPendingTextPlacement(false) }}
              className={`w-8 h-7 flex items-center justify-center rounded transition-colors ${activeTool === 'selector' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Selector tool"
            >
              <MousePointer2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setActiveTool('text'); setPendingTextPlacement(false) }}
              className={`w-8 h-7 flex items-center justify-center rounded transition-colors ${activeTool === 'text' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Text tool"
            >
              <Type className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setActiveTool('signature'); setPendingTextPlacement(false) }}
              className={`w-8 h-7 flex items-center justify-center rounded transition-colors ${activeTool === 'signature' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Signature tool"
            >
              <PenLine className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Zoom controls */}
        <div className="flex justify-center items-center gap-1">
          <button
            onClick={() => setScale(prev => Math.max(MIN_SCALE, prev - 0.1))}
            className="w-7 h-7 flex items-center justify-center rounded text-sm bg-accent hover:bg-accent/80 transition-colors text-foreground"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            onClick={() => setScale(1)}
            className="min-w-[3.5rem] text-center text-xs tabular-nums px-1.5 py-1 rounded bg-accent hover:bg-accent/80 transition-colors text-foreground"
            aria-label="Reset zoom"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={() => setScale(prev => Math.min(MAX_SCALE, prev + 0.1))}
            className="w-7 h-7 flex items-center justify-center rounded text-sm bg-accent hover:bg-accent/80 transition-colors text-foreground"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>

        {/* Right: spacer to balance tools on left */}
        <div className="flex-1" />
      </div>

      {/* Text toolbar — visible when text tool is active */}
      {activeTool === 'text' && (
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
          onAddText={() => setPendingTextPlacement(true)}
          pendingPlacement={pendingTextPlacement}
        />
      )}

      {/* Signature toolbar — visible when signature tool is active */}
      {activeTool === 'signature' && (
        <div className="flex items-center gap-3 px-4 h-10 bg-background border-b border-border">
          {storedSignatures.length === 0 ? (
            <button
              onClick={() => setShowSignatureModal(true)}
              className="px-3 py-1 text-sm rounded-md bg-accent hover:bg-accent/80 transition-colors text-foreground"
            >
              {t('signature.draw')}
            </button>
          ) : (
            <>
              <span className="text-xs text-muted-foreground">{t('signature.saved')}:</span>
              <img
                src={storedSignatures[0].imageData}
                alt="Signature preview"
                className="h-6 object-contain max-w-[120px] bg-white rounded px-1"
              />
              <button
                onClick={() => handleEditStoredSignature(storedSignatures[0].id)}
                title={t('signature.edit')}
                className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                  <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L3.75 9.777a2.25 2.25 0 0 0-.596 1.083l-.479 2.155a.5.5 0 0 0 .607.607l2.155-.479a2.25 2.25 0 0 0 1.083-.596l7.264-7.263a1.75 1.75 0 0 0 0-2.475Z" />
                </svg>
              </button>
              <button
                onClick={() => handleRemoveStoredSignature(storedSignatures[0].id)}
                title={t('signature.deleteFromStorage')}
                className="w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5A.75.75 0 0 1 9.95 6Z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="text-xs text-muted-foreground border-l border-border pl-3">
                {t('signature.clickToPlace')}
              </span>
            </>
          )}
        </div>
      )}

      {/* Main content: sidebar + scrollable pages */}
      <div className="flex flex-1 overflow-hidden">
        <PDFPageThumbnails
          pdfBytes={editor.pdfBytes}
          totalPages={editor.totalPages}
          activePage={editor.activePage}
          onPageClick={handleThumbnailClick}
        />

        {/* Scrollable page stack */}
        <div
          ref={scrollRef}
          className={`flex-1 overflow-auto p-8 ${activeTool === 'text' && pendingTextPlacement ? 'cursor-text' : activeTool === 'signature' ? 'cursor-crosshair' : ''}`}
          onClick={() => setSelectedTextId(null)}
        >
          <Document file={mainFile} loading={null} error={null}>
            <div className="flex flex-col items-center gap-8">
              {Array.from({ length: editor.totalPages }, (_, i) => (
                <div
                  key={i}
                  ref={el => { pageRefs.current[i] = el }}
                  className={`relative shadow-xl ${activeTool === 'text' && pendingTextPlacement ? 'cursor-text' : activeTool === 'signature' ? 'cursor-crosshair' : ''}`}
                  onClick={e => handlePageClick(e, i)}
                >
                  <Page
                    pageIndex={i}
                    scale={scale}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                  {/* Text overlays for this page */}
                  {editor.textElements.filter(el => el.pageIndex === i).map(el => (
                    <TextElement
                      key={el.id}
                      element={el}
                      scale={scale}
                      isSelected={el.id === selectedTextId}
                      onUpdate={editor.updateTextElement}
                      onRemove={editor.removeTextElement}
                      onSelect={() => { setActiveTool('text'); setSelectedTextId(el.id) }}
                    />
                  ))}
                  {/* Signature overlays for this page */}
                  {editor.signatureElements.filter(el => el.pageIndex === i).map(el => {
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
                        onSelect={() => setActiveTool('signature')}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </Document>
        </div>
      </div>

      {showSignatureModal && (
        <SignatureDrawingModal
          onSave={handleSaveSignature}
          onClose={() => {
            setShowSignatureModal(false)
            setEditingSignatureElementId(null)
            setEditingStoredSignatureId(null)
          }}
        />
      )}
    </div>
  )
}
