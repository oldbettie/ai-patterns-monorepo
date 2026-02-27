'use client'
// @feature:qr-generator @domain:qr @frontend
// @summary: Client-side QR generator page — form + preview + history

import { useState, useRef, useCallback } from 'react'
import { QRForm } from '@/components/qr/QRForm'
import { QRPreview } from '@/components/qr/QRPreview'
import { DownloadPanel } from '@/components/qr/DownloadPanel'
import { QRHistory } from '@/components/qr/QRHistory'
import { useQRHistory } from '@/components/hooks/useQRHistory'
import type { QRHistoryEntry } from '@/lib/qr/qrHistoryTypes'
import type { QROptions } from '@/lib/qr/qrGenerator'

export function QRGeneratorClient() {
  const [data, setData] = useState('')
  const [saving, setSaving] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qrRef = useRef<any>(null)
  const { entries, saveEntry, deleteEntry, renameEntry, loading } = useQRHistory()

  // options are fixed at defaults for Step 2 (URL-only); will expand in Step 6
  const options: QROptions = {}

  const handleSave = useCallback(async () => {
    if (!data || !qrRef.current) return
    setSaving(true)
    try {
      const { getSVGString } = await import('@/lib/qr/qrGenerator')
      const svgData = await getSVGString(qrRef.current)
      const entry: QRHistoryEntry = {
        id: crypto.randomUUID(),
        label: data.length > 40 ? data.slice(0, 40) + '…' : data,
        type: 'url',
        data,
        svgData,
        options: { fgColor: '#000000', bgColor: '#ffffff', dotStyle: 'square' },
        createdAt: Date.now(),
      }
      await saveEntry(entry)
    } finally {
      setSaving(false)
    }
  }, [data, saveEntry])

  const handleLoad = useCallback((entry: QRHistoryEntry) => {
    setData(entry.data)
  }, [])

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="container mx-auto max-w-6xl px-6 py-8 flex flex-col gap-8 lg:flex-row lg:gap-12">

        {/* Left column: form + preview + download */}
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <h1 className="font-display text-3xl text-foreground mb-1">QR Code Generator</h1>
            <p className="text-muted-foreground text-sm">Free, no signup, no watermarks. Your data never leaves your device.</p>
          </div>

          {/* Form */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <QRForm value={data} onChange={setData} />
          </div>

          {/* Preview */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-4">
            <QRPreview data={data} options={options} qrRef={qrRef} />

            {/* Download + Save */}
            {data && (
              <div className="w-full flex flex-col gap-3">
                <DownloadPanel qrRef={qrRef} disabled={!data} label="qr-code" />
                <button
                  onClick={handleSave}
                  disabled={saving || !data}
                  className="w-full py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving…' : 'Save to History'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: history */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-display text-lg text-foreground mb-4">Saved QR Codes</h2>
            <QRHistory
              entries={entries}
              loading={loading}
              onLoad={handleLoad}
              onDelete={deleteEntry}
              onRename={renameEntry}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
