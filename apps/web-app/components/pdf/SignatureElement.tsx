'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: Draggable signature image overlay for the PDF editor canvas

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import type { SignatureData } from '@quick-pdfs/common'

interface SignatureElementProps {
  element: SignatureData
  imageData: string
  scale: number
  onUpdate: (id: string, updates: Partial<SignatureData>) => void
  onRemove: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string, signatureId: string) => void
}

export function SignatureElement({ element, imageData, scale, onUpdate, onRemove, onEdit, onDelete }: SignatureElementProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const t = useTranslations('pages.editor.signature')

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
    dragOffset.current = {
      x: e.clientX - element.x * scale,
      y: e.clientY - element.y * scale,
    }

    const handleMouseMove = (e: MouseEvent) => {
      onUpdate(element.id, {
        x: (e.clientX - dragOffset.current.x) / scale,
        y: (e.clientY - dragOffset.current.y) / scale,
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: element.x * scale,
        top: element.y * scale,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        width: element.width * scale,
        height: element.height * scale,
      }}
      onMouseDown={handleMouseDown}
      className="group"
    >
      <img
        src={imageData}
        alt="Signature"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        draggable={false}
      />
      {/* Icon cluster — visible on hover */}
      <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Edit */}
        <button
          onClick={e => { e.stopPropagation(); onEdit(element.id) }}
          title={t('edit')}
          className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
            <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L3.75 9.777a2.25 2.25 0 0 0-.596 1.083l-.479 2.155a.5.5 0 0 0 .607.607l2.155-.479a2.25 2.25 0 0 0 1.083-.596l7.264-7.263a1.75 1.75 0 0 0 0-2.475Z" />
          </svg>
        </button>
        {/* Delete from storage */}
        <button
          onClick={e => { e.stopPropagation(); onDelete(element.id, element.signatureId) }}
          title={t('deleteFromStorage')}
          className="w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
            <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5A.75.75 0 0 1 9.95 6Z" clipRule="evenodd" />
          </svg>
        </button>
        {/* Remove from canvas only */}
        <button
          onClick={e => { e.stopPropagation(); onRemove(element.id) }}
          title={t('cancel')}
          className="w-6 h-6 rounded-full bg-muted-foreground text-background text-xs flex items-center justify-center hover:bg-muted-foreground/90 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  )
}
