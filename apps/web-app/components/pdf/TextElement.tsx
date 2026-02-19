'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: Draggable text overlay element for the PDF editor canvas

import { useState, useRef } from 'react'
import type { TextElement as TextElementType } from '@quick-pdfs/common'

interface TextElementProps {
  element: TextElementType
  scale: number
  isSelected: boolean
  onUpdate: (id: string, updates: Partial<TextElementType>) => void
  onRemove: (id: string) => void
  onSelect: () => void
}

// Parse font family to extract base font and style information for CSS
function parseFontForCSS(fontFamily: string): {
  baseFontFamily: string
  fontWeight: 'normal' | 'bold'
  fontStyle: 'normal' | 'italic'
} {
  const isBold = fontFamily.includes('Bold')
  const isItalic = fontFamily.includes('Oblique') || fontFamily.includes('Italic')
  
  // Map PDF font names to CSS font families
  let baseFontFamily = 'Helvetica, Arial, sans-serif'
  if (fontFamily.startsWith('Times')) {
    baseFontFamily = '"Times New Roman", Times, serif'
  } else if (fontFamily.startsWith('Courier')) {
    baseFontFamily = '"Courier New", Courier, monospace'
  } else if (fontFamily.startsWith('Symbol')) {
    baseFontFamily = 'Symbol'
  } else if (fontFamily.startsWith('ZapfDingbats')) {
    baseFontFamily = '"Zapf Dingbats"'
  }
  
  return {
    baseFontFamily,
    fontWeight: isBold ? 'bold' : 'normal',
    fontStyle: isItalic ? 'italic' : 'normal',
  }
}

export function TextElement({ element, scale, isSelected, onUpdate, onRemove, onSelect }: TextElementProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const hasDragged = useRef(false)

  const { baseFontFamily, fontWeight, fontStyle } = parseFontForCSS(element.fontFamily)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEditing) return
    e.preventDefault()
    hasDragged.current = false
    setIsDragging(true)
    dragOffset.current = {
      x: e.clientX - element.x * scale,
      y: e.clientY - element.y * scale,
    }

    const handleMouseMove = (e: MouseEvent) => {
      hasDragged.current = true
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

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (hasDragged.current) return
    if (!isEditing) onSelect()
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: element.x * scale,
        top: element.y * scale,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      className={`group ${isSelected ? 'ring-2 ring-primary rounded' : ''}`}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <input
          autoFocus
          value={element.text}
          onChange={e => onUpdate(element.id, { text: e.target.value })}
          onBlur={() => setIsEditing(false)}
          onKeyDown={e => { if (e.key === 'Enter') setIsEditing(false) }}
          style={{
            fontSize: element.fontSize * scale,
            color: element.color,
            fontFamily: baseFontFamily,
            fontWeight,
            fontStyle,
            background: 'transparent',
            border: '1px dashed var(--color-primary)',
            outline: 'none',
            minWidth: 80,
          }}
        />
      ) : (
        <>
          {/* Icon cluster — floats above the element, visible on hover */}
          <div className="absolute -top-6 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Edit */}
            <button
              onClick={e => { e.stopPropagation(); setIsEditing(true) }}
              title="Edit text"
              className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-2.5 h-2.5">
                <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L3.75 9.777a2.25 2.25 0 0 0-.596 1.083l-.479 2.155a.5.5 0 0 0 .607.607l2.155-.479a2.25 2.25 0 0 0 1.083-.596l7.264-7.263a1.75 1.75 0 0 0 0-2.475Z" />
              </svg>
            </button>
            {/* Delete */}
            <button
              onClick={e => { e.stopPropagation(); onRemove(element.id) }}
              title="Delete text"
              className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-2.5 h-2.5">
                <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5A.75.75 0 0 1 9.95 6Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div
            style={{
              fontSize: element.fontSize * scale,
              color: element.color,
              fontFamily: baseFontFamily,
              fontWeight,
              fontStyle,
              border: '1px dashed transparent',
              padding: '4px 8px',
              whiteSpace: 'pre',
            }}
            className="group-hover:border-primary"
          >
            {element.text}
          </div>
        </>
      )}
    </div>
  )
}
