'use client'
// @feature:qr-generator @domain:qr @frontend @reusable
// @summary: Shared state/logic hook for all QR tool pages (data, options, save, load, history)

import { useState, useRef, useCallback } from 'react'
import type QRCodeStyling from 'qr-code-styling'
import { useQRHistory } from '@/components/hooks/useQRHistory'
import type { QRHistoryEntry, QRType, QRDotStyle } from '@/lib/qr/qrHistoryTypes'

export interface QRToolOptions {
  fgColor: string
  bgColor: string
  dotStyle: QRDotStyle
  logoUrl?: string
}

const DEFAULT_OPTIONS: QRToolOptions = {
  fgColor: '#000000',
  bgColor: '#ffffff',
  dotStyle: 'square',
}

export function useQRTool(type: QRType) {
  const [data, setData] = useState('')
  const [saving, setSaving] = useState(false)
  const [options, setOptions] = useState<QRToolOptions>(DEFAULT_OPTIONS)
  const qrRef = useRef<QRCodeStyling | null>(null)

  const { entries, saveEntry, deleteEntry, renameEntry, loading } = useQRHistory()

  const handleSave = useCallback(
    async (label: string) => {
      if (!data || !qrRef.current) return
      setSaving(true)
      try {
        const { getSVGString } = await import('@/lib/qr/qrGenerator')
        const svgData = await getSVGString(qrRef.current)
        const entry: QRHistoryEntry = {
          id: crypto.randomUUID(),
          label: label.length > 40 ? label.slice(0, 40) + '…' : label,
          type,
          data,
          svgData,
          options,
          createdAt: Date.now(),
        }
        await saveEntry(entry)
      } finally {
        setSaving(false)
      }
    },
    [data, type, options, saveEntry]
  )

  const handleLoad = useCallback((entry: QRHistoryEntry) => {
    setData(entry.data)
    setOptions(entry.options)
  }, [])

  return {
    data,
    setData,
    qrRef,
    options,
    setOptions,
    saving,
    handleSave,
    handleLoad,
    entries,
    loading,
    deleteEntry,
    renameEntry,
  }
}
