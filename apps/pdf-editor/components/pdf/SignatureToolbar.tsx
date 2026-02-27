'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: Signature toolbar showing saved signature preview with edit/delete/draw actions

import { useTranslations } from 'next-intl'
import type { StoredSignature } from '@quick-pdfs/common'

interface SignatureToolbarProps {
  storedSignatures: StoredSignature[]
  onDraw: () => void
  onEditStoredSignature: (signatureId: string) => void
  onRemoveStoredSignature: (signatureId: string) => void
}

export function SignatureToolbar({ storedSignatures, onDraw, onEditStoredSignature, onRemoveStoredSignature }: SignatureToolbarProps) {
  const t = useTranslations('pages.editor')

  return (
    <div className="flex items-center gap-3 px-4 h-10 bg-background border-b border-border">
      {storedSignatures.length === 0 ? (
        <button
          onClick={onDraw}
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
            onClick={() => onEditStoredSignature(storedSignatures[0].id)}
            title={t('signature.edit')}
            className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
              <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L3.75 9.777a2.25 2.25 0 0 0-.596 1.083l-.479 2.155a.5.5 0 0 0 .607.607l2.155-.479a2.25 2.25 0 0 0 1.083-.596l7.264-7.263a1.75 1.75 0 0 0 0-2.475Z" />
            </svg>
          </button>
          <button
            onClick={() => onRemoveStoredSignature(storedSignatures[0].id)}
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
  )
}
