'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: Left sidebar with drag-to-reorder page thumbnails and add-blank-page button

import { useEffect, useRef, useState } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus } from 'lucide-react'

interface PDFPageThumbnailsProps {
  pdfBytes: Uint8Array
  pageOrder: number[]          // visual position → original page index
  activePage: number           // visual position of active page
  onPageClick: (visualPos: number) => void
  onReorder: (newPageOrder: number[]) => void
  onAddPage: () => void
}

interface SortableThumbnailItemProps {
  id: string
  originalPageIdx: number
  visualPos: number
  isActive: boolean
  onClick: () => void
  thumbRef: (el: HTMLDivElement | null) => void
}

function SortableThumbnailItem({
  id,
  originalPageIdx,
  visualPos,
  isActive,
  onClick,
  thumbRef,
}: SortableThumbnailItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  }

  return (
    <div
      ref={node => {
        setNodeRef(node)
        thumbRef(node)
      }}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative flex flex-col items-center gap-1 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} rounded p-1 transition-colors hover:bg-accent/50 ${
        isActive ? 'ring-2 ring-primary rounded' : ''
      }`}
      onClick={onClick}
    >
      {/* Drag hint icon */}
      <div className="absolute left-0.5 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <GripVertical className="w-3 h-3 text-muted-foreground" />
      </div>

      <div className="pointer-events-none">
        <Page
          pageIndex={originalPageIdx}
          width={120}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          loading={<div className="w-[120px] h-[160px] bg-muted animate-pulse rounded" />}
        />
      </div>
      <span className="text-xs text-muted-foreground select-none">{visualPos + 1}</span>
    </div>
  )
}

function ThumbnailPreview({ visualPos }: { visualPos: number }) {
  return (
    <div className="flex flex-col items-center gap-1 p-1 rounded shadow-2xl bg-background rotate-3 scale-105 opacity-95">
      <div className="w-[120px] h-[160px] bg-white border border-border rounded flex items-center justify-center">
        <span className="text-muted-foreground text-sm">{visualPos + 1}</span>
      </div>
    </div>
  )
}

export function PDFPageThumbnails({
  pdfBytes,
  pageOrder,
  activePage,
  onPageClick,
  onReorder,
  onAddPage,
}: PDFPageThumbnailsProps) {
  const thumbRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  // Only create a new file object when pdfBytes reference changes (new content).
  // useRef is immune to Strict Mode's memo-invalidation, preventing spurious reloads.
  const fileRef = useRef<{ data: Uint8Array } | null>(null)
  const prevPdfBytesRef = useRef<Uint8Array | null>(null)
  if (pdfBytes !== prevPdfBytesRef.current) {
    prevPdfBytesRef.current = pdfBytes
    fileRef.current = { data: pdfBytes.slice() }
  }
  const file = fileRef.current!

  // Scroll active thumbnail into view
  useEffect(() => {
    thumbRefs.current[activePage]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activePage])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const sortableIds = pageOrder.map((_, i) => `page-${i}`)

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return

    const oldIndex = sortableIds.indexOf(active.id as string)
    const newIndex = sortableIds.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return

    onReorder(arrayMove(pageOrder, oldIndex, newIndex))
  }

  const activeVisualPos = activeId ? sortableIds.indexOf(activeId) : -1

  return (
    <div className="w-[152px] flex-shrink-0 overflow-y-auto border-r border-border bg-background flex flex-col gap-2 py-2 px-2">
      <Document file={file} loading={null} error={null}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {pageOrder.map((originalPageIdx, visualPos) => (
                <SortableThumbnailItem
                  key={`page-${visualPos}`}
                  id={`page-${visualPos}`}
                  originalPageIdx={originalPageIdx}
                  visualPos={visualPos}
                  isActive={activePage === visualPos}
                  onClick={() => onPageClick(visualPos)}
                  thumbRef={el => { thumbRefs.current[visualPos] = el }}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeVisualPos >= 0 ? (
              <ThumbnailPreview visualPos={activeVisualPos} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </Document>

      <button
        onClick={onAddPage}
        className="w-full flex items-center justify-center gap-1 mt-1 py-2 border-2 border-dashed border-border rounded text-muted-foreground hover:border-primary hover:text-primary transition-colors text-xs"
      >
        <Plus className="w-3 h-3" /> Add page
      </button>
    </div>
  )
}
