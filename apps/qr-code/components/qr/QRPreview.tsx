'use client'
// @feature:qr-generator @domain:qr @frontend
// @summary: Live QR code preview using qr-code-styling, mounted via useEffect (client-only)

import { useEffect, useRef, useState } from 'react'
import type QRCodeStyling from 'qr-code-styling'
import type { QROptions } from '@/lib/qr/qrGenerator'

interface QRPreviewProps {
  data: string
  options?: QROptions
  // Optional ref to expose the qr instance to the parent (for download / save)
  qrRef?: React.MutableRefObject<QRCodeStyling | null>
  placeholder?: string
}

export function QRPreview({ data, options = {}, qrRef, placeholder = 'Fill in the fields above to see your QR code' }: QRPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  // Create or re-create the QR instance whenever data or relevant options change
  useEffect(() => {
    if (!containerRef.current || !data) {
      setReady(false)
      return
    }

    let cancelled = false

    async function init() {
      const { createQRCode } = await import('@/lib/qr/qrGenerator')
      if (cancelled) return

      const qr = await createQRCode(data, { width: 280, height: 280, ...options })
      if (cancelled) return

      if (containerRef.current) {
        containerRef.current.innerHTML = ''
        qr.append(containerRef.current)
        if (qrRef) qrRef.current = qr
        setReady(true)
      }
    }

    setReady(false)
    init()

    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, options?.fgColor, options?.bgColor, options?.dotStyle, options?.logoUrl])

  // Clear qrRef when data is empty
  useEffect(() => {
    if (!data && qrRef) {
      qrRef.current = null
    }
  }, [data, qrRef])

  if (!data) {
    return (
      <div className="w-[280px] h-[280px] rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/20">
        <p className="text-sm text-muted-foreground text-center px-4">
          {placeholder}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={containerRef}
        className="rounded-xl overflow-hidden border border-border bg-white p-4 shadow-sm"
        style={{ minWidth: 280, minHeight: 280 }}
        aria-label="QR code preview"
      />
      {!ready && (
        <p className="text-xs text-muted-foreground animate-pulse">Generating QR code…</p>
      )}
    </div>
  )
}
