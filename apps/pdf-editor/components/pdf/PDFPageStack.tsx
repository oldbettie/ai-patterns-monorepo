'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: Scrollable document viewport rendering all pages with text and signature overlays

import { forwardRef, useImperativeHandle, useEffect, useRef } from 'react'
import { Page } from 'react-pdf'
import { TextElement } from '@/components/pdf/TextElement'
import { SignatureElement } from '@/components/pdf/SignatureElement'
import { MIN_SCALE, MAX_SCALE } from '@/components/pdf/EditorTopBar'
import type { ActiveTool } from '@/components/pdf/EditorTopBar'
import type { TextElement as TextElementData, SignatureData } from '@quick-pdfs/common'

const SCALE_STEP = 0.001

interface PDFPageStackProps {
  totalPages: number
  pageOrder: number[]
  scale: number
  onScaleChange: (scale: number) => void
  activeTool: ActiveTool
  pendingTextPlacement: boolean
  textElements: TextElementData[]
  signatureElements: SignatureData[]
  signatureImages: Map<string, string>
  selectedTextId: string | null
  onPageChange: (pageIndex: number) => void
  onPageClick: (e: React.MouseEvent<HTMLDivElement>, pageIndex: number) => void
  onClearSelection: () => void
  onTextUpdate: (id: string, updates: Partial<TextElementData>) => void
  onTextRemove: (id: string) => void
  onTextSelect: (id: string) => void
  onSignatureUpdate: (id: string, updates: Partial<SignatureData>) => void
  onSignatureRemove: (id: string) => void
  onSignatureEdit: (elementId: string) => void
  onSignatureDelete: (elementId: string, signatureId: string) => void
  onSignatureSelect: () => void
}

export interface PDFPageStackHandle {
  scrollToPage: (index: number) => void
}

export const PDFPageStack = forwardRef<PDFPageStackHandle, PDFPageStackProps>(function PDFPageStack(
  {
    totalPages,
    pageOrder,
    scale,
    onScaleChange,
    activeTool,
    pendingTextPlacement,
    textElements,
    signatureElements,
    signatureImages,
    selectedTextId,
    onPageChange,
    onPageClick,
    onClearSelection,
    onTextUpdate,
    onTextRemove,
    onTextSelect,
    onSignatureUpdate,
    onSignatureRemove,
    onSignatureEdit,
    onSignatureDelete,
    onSignatureSelect,
  },
  ref
) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<(HTMLDivElement | null)[]>([])
  const suppressObserverRef = useRef(false)
  const suppressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intersectionRatiosRef = useRef<Map<Element, number>>(new Map())

  // Keep a ref to current scale so the wheel handler doesn't go stale without
  // needing to re-register the listener on every zoom step.
  const scaleRef = useRef(scale)
  scaleRef.current = scale

  useImperativeHandle(ref, () => ({
    scrollToPage(index: number) {
      suppressObserverRef.current = true
      if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current)
      suppressTimerRef.current = setTimeout(() => { suppressObserverRef.current = false }, 800)
      pageRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
  }))

  // Ctrl/Cmd + scroll to zoom; also intercepts browser pinch-zoom on the canvas area
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      onScaleChange(Math.min(MAX_SCALE, Math.max(MIN_SCALE, scaleRef.current - e.deltaY * SCALE_STEP)))
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
    // onScaleChange is setScale — a stable React setter, so this registers once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onScaleChange])

  // IntersectionObserver to track which page is most visible.
  // We maintain a running map of every observed element's latest ratio so the
  // callback always picks the globally most-visible page, not just the most-visible
  // among the entries that happened to change in the current batch.
  useEffect(() => {
    if (!totalPages) return
    const ratios = intersectionRatiosRef.current
    ratios.clear()

    const observer = new IntersectionObserver((entries) => {
      if (suppressObserverRef.current) return
      for (const e of entries) {
        ratios.set(e.target, e.intersectionRatio)
      }
      let bestEl: Element | null = null
      let bestRatio = 0
      ratios.forEach((ratio, el) => {
        if (ratio > bestRatio) { bestRatio = ratio; bestEl = el }
      })
      if (bestEl) {
        const idx = pageRefs.current.findIndex(el => el === bestEl)
        if (idx !== -1) onPageChange(idx)
      }
    }, { root: scrollRef.current, threshold: [0.1, 0.3, 0.5, 0.7, 1.0] })

    pageRefs.current.forEach(el => el && observer.observe(el))
    return () => { observer.disconnect(); ratios.clear() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages, onPageChange])

  const cursorClass = activeTool === 'text' && pendingTextPlacement
    ? 'cursor-text'
    : activeTool === 'signature'
      ? 'cursor-crosshair'
      : ''

  return (
    <div
      ref={scrollRef}
      className={`flex-1 overflow-auto p-8 ${cursorClass}`}
      onClick={onClearSelection}
    >
      <div className="flex flex-col items-center gap-8">
        {pageOrder.map((originalPageIdx, visualPos) => (
          <div
            key={originalPageIdx}
            ref={el => { pageRefs.current[visualPos] = el }}
            className={`relative shadow-xl ${cursorClass}`}
            onClick={e => onPageClick(e, originalPageIdx)}
          >
            <Page
              pageIndex={originalPageIdx}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
            {textElements.filter(el => el.pageIndex === originalPageIdx).map(el => (
              <TextElement
                key={el.id}
                element={el}
                scale={scale}
                isSelected={el.id === selectedTextId}
                onUpdate={onTextUpdate}
                onRemove={onTextRemove}
                onSelect={() => onTextSelect(el.id)}
              />
            ))}
            {signatureElements.filter(el => el.pageIndex === originalPageIdx).map(el => {
              const imgData = signatureImages.get(el.signatureId)
              if (!imgData) return null
              return (
                <SignatureElement
                  key={el.id}
                  element={el}
                  imageData={imgData}
                  scale={scale}
                  onUpdate={onSignatureUpdate}
                  onRemove={onSignatureRemove}
                  onEdit={onSignatureEdit}
                  onDelete={onSignatureDelete}
                  onSelect={onSignatureSelect}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
})
