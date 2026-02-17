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

export function TextElement({ element, scale, isSelected, onUpdate, onRemove, onSelect }: TextElementProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const hasDragged = useRef(false)

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
    if (hasDragged.current) return
    e.stopPropagation()
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
      className={isSelected ? 'ring-2 ring-blue-500 rounded' : ''}
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
            fontFamily: element.fontFamily,
            background: 'transparent',
            border: '1px dashed #3b82f6',
            outline: 'none',
            minWidth: 80,
          }}
        />
      ) : (
        <div
          style={{
            fontSize: element.fontSize * scale,
            color: element.color,
            fontFamily: element.fontFamily,
            border: '1px dashed transparent',
            padding: '0 2px',
            whiteSpace: 'pre',
          }}
          className="hover:border-blue-400 group"
        >
          {element.text}
          <button
            onClick={e => { e.stopPropagation(); onRemove(element.id) }}
            className="ml-1 opacity-0 group-hover:opacity-100 text-red-500 text-xs leading-none"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
