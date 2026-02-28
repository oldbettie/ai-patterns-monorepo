'use client'
// @feature:qr-generator @domain:qr @frontend @reusable
// @summary: Two-column layout wrapper for QR tool pages (form+preview left, history right)

import { QRHistory } from '@/components/qr/QRHistory'
import { QRPreview } from '@/components/qr/QRPreview'
import { QRStyleOptions } from '@/components/qr/QRStyleOptions'
import { DownloadPanel } from '@/components/qr/DownloadPanel'
import type { QRToolOptions } from '@/components/hooks/useQRTool'
import type { QRHistoryEntry } from '@/lib/qr/qrHistoryTypes'
import type React from 'react'
import { useTranslations } from 'next-intl'

interface QRToolLayoutProps {
  title: string
  description: string
  // QR state (passed from useQRTool)
  data: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  qrRef: React.MutableRefObject<any>
  options: QRToolOptions
  onOptionsChange: (opts: QRToolOptions) => void
  saving: boolean
  onSave: () => void
  // History
  entries: QRHistoryEntry[]
  historyLoading: boolean
  onLoad: (entry: QRHistoryEntry) => void
  onDelete: (id: string) => void
  onRename: (id: string, label: string) => void
  // Download label
  downloadLabel?: string
  // Placeholder text for QR preview empty state
  placeholder?: string
  // Form slot
  children: React.ReactNode
}

export function QRToolLayout({
  title,
  description,
  data,
  qrRef,
  options,
  onOptionsChange,
  saving,
  onSave,
  entries,
  historyLoading,
  onLoad,
  onDelete,
  onRename,
  downloadLabel = 'qr-code',
  placeholder,
  children,
}: QRToolLayoutProps) {
  const tGenerate = useTranslations('pages.generate')
  const tHistory = useTranslations('pages.history')

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="container mx-auto max-w-6xl px-6 py-8 flex flex-col gap-8 lg:flex-row lg:gap-12">

        {/* Left column: form + style + preview + download */}
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <h1 className="font-display text-3xl text-foreground mb-1">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>

          {/* Form slot */}
          <div className="bg-card border border-border rounded-2xl p-6">
            {children}
          </div>

          {/* Style options */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <QRStyleOptions options={options} onChange={onOptionsChange} />
          </div>

          {/* Preview */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-4">
            <QRPreview data={data} options={options} qrRef={qrRef} placeholder={placeholder} />

            {data && (
              <div className="w-full flex flex-col gap-3">
                <DownloadPanel qrRef={qrRef} disabled={!data} label={downloadLabel} />
                <button
                  onClick={onSave}
                  disabled={saving || !data}
                  className="w-full py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
                >
                  {saving ? tGenerate('saving') : tGenerate('save')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: history */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-display text-lg text-foreground mb-4">{tHistory('title')}</h2>
            <QRHistory
              entries={entries}
              loading={historyLoading}
              onLoad={onLoad}
              onDelete={onDelete}
              onRename={onRename}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
