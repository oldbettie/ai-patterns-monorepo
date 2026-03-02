'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: Client-side PDF editor shell — loads document from IndexedDB and orchestrates editor state

import { useEffect, useState, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Document } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { usePDFEditor } from '@/components/hooks/usePDFEditor'
import { useIndexedDB } from '@/components/hooks/useIndexedDB'
import { useEditorActions } from '@/lib/context/EditorActionsContext'
import { useSignatures } from '@/components/hooks/useSignatures'
import { TextToolbar } from '@/components/pdf/TextToolbar'
import { SignatureDrawingModal } from '@/components/pdf/SignatureDrawingModal'
import { PasswordDialog } from '@/components/pdf/PasswordDialog'
import { UnlockDialog } from '@/components/pdf/UnlockDialog'
import { PDFPageThumbnails } from '@/components/pdf/PDFPageThumbnails'
import { PDFPageStack } from '@/components/pdf/PDFPageStack'
import { EditorTopBar } from '@/components/pdf/EditorTopBar'
import { SignatureToolbar } from '@/components/pdf/SignatureToolbar'
import { loadPDFBytes, getPDFPageCount, exportPDF, downloadPDF, addBlankPage, reorderPDFPages } from '@/lib/pdf/pdfEditor'
import { protectPDFAction, unlockPDFAction } from '@/actions/pdf-crypto-actions'
import type { ActiveTool } from '@/components/pdf/EditorTopBar'
import type { PDFPageStackHandle } from '@/components/pdf/PDFPageStack'

interface PDFEditorShellProps {
  documentId: string
}

export function PDFEditorShell({ documentId }: PDFEditorShellProps) {
  const t = useTranslations('pages.editor')
  const router = useRouter()
  const { getDocument } = useIndexedDB()
  const editor = usePDFEditor()
  const { setExportFn, clearExportFn, setEditorTitle, clearEditorTitle } = useEditorActions()
  const signatures = useSignatures(editor)
  const pageStackRef = useRef<PDFPageStackHandle>(null)

  const [activeTool, setActiveTool] = useState<ActiveTool>('selector')
  const [pendingTextPlacement, setPendingTextPlacement] = useState(false)
  const [toolbarState, setToolbarState] = useState({
    fontFamily: 'Helvetica',
    fontSize: 14,
    color: '#000000',
  })
  const [documentName, setDocumentName] = useState('document.pdf')
  const [scale, setScale] = useState(1)
  const [pageOrder, setPageOrder] = useState<number[]>([])
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null)

  // Password protection state
  const [pdfPassword, setPdfPassword] = useState<string | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [awaitingUnlock, setAwaitingUnlock] = useState(false)
  const [unlockError, setUnlockError] = useState<string | null>(null)
  const [encryptedBytes, setEncryptedBytes] = useState<Uint8Array | null>(null)

  // Create the file object exactly once when pdfBytes first becomes available.
  // A stable reference prevents react-pdf from reloading the document on every re-render.
  const mainFileRef = useRef<{ data: Uint8Array } | null>(null)
  if (editor.pdfBytes && !mainFileRef.current) {
    mainFileRef.current = { data: editor.pdfBytes.slice() }
  }
  const mainFile = mainFileRef.current

  // Load document on mount. The cancelled flag prevents Strict Mode's double-effect
  // execution from calling setPdfBytes twice with different Uint8Array references,
  // which would cause react-pdf to warn about an "equal but changed" file prop.
  useEffect(() => {
    let cancelled = false
    const loadDocument = async () => {
      editor.setLoading(true)
      const doc = await getDocument(documentId)
      if (cancelled) return
      if (!doc) { editor.setLoading(false); return }
      setDocumentName(doc.name)
      setEditorTitle(doc.name)
      const bytes = await loadPDFBytes(doc.originalFile)

      // Check for encrypted PDF — defer loading until password is entered
      try {
        const pageCount = await getPDFPageCount(bytes)
        if (cancelled) return
        editor.setPdfBytes(bytes, pageCount)
        setPageOrder(Array.from({ length: pageCount }, (_, i) => i))
      } catch {
        // pdf-lib throws on encrypted PDFs — prompt for password
        if (cancelled) return
        setEncryptedBytes(bytes)
        setAwaitingUnlock(true)
        editor.setLoading(false)
      }
    }
    loadDocument()
    return () => { cancelled = true; clearEditorTitle() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId])

  // Register export function in context whenever relevant state changes
  useEffect(() => {
    if (!editor.pdfBytes) return
    const pdfBytes = editor.pdfBytes
    const textElements = editor.textElements
    const signatureElements = editor.signatureElements
    const images = signatures.signatureImages
    const filename = documentName
    const order = pageOrder
    const exportPassword = pdfPassword
    setExportFn(async () => {
      const withOverlays = await exportPDF(pdfBytes, textElements, signatureElements, images)
      const reordered = await reorderPDFPages(withOverlays, order)
      const password = exportPassword
      if (password) {
        const protected_ = await protectPDFAction(reordered, password)
        downloadPDF(protected_ ?? reordered, filename)
      } else {
        downloadPDF(reordered, filename)
      }
    })
    return clearExportFn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.pdfBytes, editor.textElements, editor.signatureElements, signatures.signatureImages, documentName, pageOrder, pdfPassword])

  const handleThumbnailClick = useCallback((visualPos: number) => {
    editor.setActivePage(visualPos)
    pageStackRef.current?.scrollToPage(visualPos)
  }, [editor.setActivePage])

  const handleReorder = useCallback((newOrder: number[]) => {
    setPageOrder(newOrder)
  }, [])

  const handleAddPage = useCallback(async () => {
    if (!editor.pdfBytes) return
    const newBytes = await addBlankPage(editor.pdfBytes)
    const newCount = editor.totalPages + 1
    editor.setPdfBytes(newBytes, newCount)
    setPageOrder(prev => [...prev, newCount - 1])
    mainFileRef.current = { data: newBytes.slice() }
  }, [editor])

  const handleUnlock = useCallback(async (password: string) => {
    if (!encryptedBytes) return
    setUnlockError(null)
    editor.setLoading(true)
    const decrypted = await unlockPDFAction(encryptedBytes, password)
    if (!decrypted) {
      setUnlockError('incorrect')
      editor.setLoading(false)
      return
    }
    try {
      const pageCount = await getPDFPageCount(decrypted)
      editor.setPdfBytes(decrypted, pageCount)
      setPageOrder(Array.from({ length: pageCount }, (_, i) => i))
      mainFileRef.current = { data: decrypted.slice() }
      setPdfPassword(password)
      setAwaitingUnlock(false)
      setEncryptedBytes(null)
    } catch {
      setUnlockError('incorrect')
      editor.setLoading(false)
    }
  }, [encryptedBytes, editor])

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
      signatures.handlePlaceAt(x, y, pageIndex)
    }
    e.stopPropagation()
  }

  if (awaitingUnlock) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <UnlockDialog
          onUnlock={handleUnlock}
          onCancel={() => router.push('/editor?error=locked')}
          error={unlockError}
        />
      </div>
    )
  }

  if (editor.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-neutral-400 text-sm">{t('title')}</div>
      </div>
    )
  }

  if (!editor.pdfBytes || !mainFile) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-neutral-400 text-sm">Document not found</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      <EditorTopBar
        activeTool={activeTool}
        onToolChange={(tool) => { setActiveTool(tool); setPendingTextPlacement(false) }}
        scale={scale}
        onScaleChange={setScale}
        passwordSet={pdfPassword !== null}
        onPasswordClick={() => setShowPasswordDialog(true)}
      />

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

      {activeTool === 'signature' && (
        <SignatureToolbar
          storedSignatures={signatures.storedSignatures}
          onDraw={signatures.openDrawModal}
          onEditStoredSignature={signatures.handleEditStoredSignature}
          onRemoveStoredSignature={signatures.handleRemoveStoredSignature}
        />
      )}

      <Document file={mainFile} loading={null} error={null} className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex flex-1 overflow-hidden min-h-0">
          <PDFPageThumbnails
            pageOrder={pageOrder}
            activePage={editor.activePage}
            onPageClick={handleThumbnailClick}
            onReorder={handleReorder}
            onAddPage={handleAddPage}
          />

          <PDFPageStack
            ref={pageStackRef}
            totalPages={editor.totalPages}
            pageOrder={pageOrder}
            scale={scale}
            onScaleChange={setScale}
            activeTool={activeTool}
            pendingTextPlacement={pendingTextPlacement}
            textElements={editor.textElements}
            signatureElements={editor.signatureElements}
            signatureImages={signatures.signatureImages}
            selectedTextId={selectedTextId}
            onPageChange={editor.setActivePage}
            onPageClick={handlePageClick}
            onClearSelection={() => setSelectedTextId(null)}
            onTextUpdate={editor.updateTextElement}
            onTextRemove={editor.removeTextElement}
            onTextSelect={(id) => { setActiveTool('text'); setSelectedTextId(id) }}
            onSignatureUpdate={editor.updateSignatureElement}
            onSignatureRemove={editor.removeSignatureElement}
            onSignatureEdit={signatures.handleEditSignature}
            onSignatureDelete={signatures.handleDeleteSignature}
            onSignatureSelect={() => setActiveTool('signature')}
          />
        </div>
      </Document>

      {signatures.showSignatureModal && (
        <SignatureDrawingModal
          onSave={signatures.handleSaveSignature}
          onClose={signatures.closeModal}
        />
      )}

      {showPasswordDialog && (
        <PasswordDialog
          currentPassword={pdfPassword}
          onSet={(password) => { setPdfPassword(password); setShowPasswordDialog(false) }}
          onRemove={() => { setPdfPassword(null); setShowPasswordDialog(false) }}
          onClose={() => setShowPasswordDialog(false)}
        />
      )}
    </div>
  )
}
