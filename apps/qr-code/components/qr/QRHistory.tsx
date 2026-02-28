'use client'
// @feature:qr-generator @domain:qr @frontend
// @summary: History sidebar showing saved QR code entries with rename/delete

import { useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import type { QRHistoryEntry } from '@/lib/qr/qrHistoryTypes'
import { useTranslations } from 'next-intl'

interface QRHistoryProps {
  entries: QRHistoryEntry[]
  loading: boolean
  onLoad: (entry: QRHistoryEntry) => void
  onDelete: (id: string) => void
  onRename: (id: string, label: string) => void
}

export function QRHistory({ entries, loading, onLoad, onDelete, onRename }: QRHistoryProps) {
  const tCommon = useTranslations('common')
  const tHistory = useTranslations('pages.history')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const startRename = (entry: QRHistoryEntry) => {
    setRenamingId(entry.id)
    setRenameValue(entry.label)
  }

  const commitRename = (id: string) => {
    if (renameValue.trim()) {
      onRename(id, renameValue.trim())
    }
    setRenamingId(null)
  }

  const cancelRename = () => {
    setRenamingId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
        {tCommon('loading')}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
        <p className="text-muted-foreground text-sm font-medium">{tHistory('empty')}</p>
        <p className="text-muted-foreground/60 text-xs">{tHistory('emptySubtitle')}</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors group"
        >
          {/* Thumbnail */}
          <div
            className="w-12 h-12 rounded-lg border border-border bg-white shrink-0 overflow-hidden cursor-pointer"
            onClick={() => onLoad(entry)}
            title="Load this QR code"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/svg+xml,${encodeURIComponent(entry.svgData)}`}
              alt={entry.label}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Label / rename input */}
          <div className="flex-1 min-w-0">
            {renamingId === entry.id ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename(entry.id)
                    if (e.key === 'Escape') cancelRename()
                  }}
                  className="flex-1 min-w-0 px-2 py-1 rounded-md border border-primary text-sm bg-background text-foreground focus:outline-none"
                />
                <button onClick={() => commitRename(entry.id)} className="text-primary hover:text-primary/80 p-1" aria-label="Save name">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={cancelRename} className="text-muted-foreground hover:text-foreground p-1" aria-label="Cancel rename">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onLoad(entry)}
                className="text-sm font-medium text-foreground truncate block w-full text-left hover:text-primary transition-colors"
                title={entry.label}
              >
                {entry.label}
              </button>
            )}
            <p className="text-xs text-muted-foreground/70 truncate">{entry.type}</p>
          </div>

          {/* Actions */}
          {renamingId !== entry.id && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => startRename(entry)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Rename"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(entry.id)}
                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
