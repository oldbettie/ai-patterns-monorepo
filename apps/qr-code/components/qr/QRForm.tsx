'use client'
// @feature:qr-generator @domain:qr @frontend
// @summary: URL input form for QR code generator (Step 2 — URL only)

import { useEffect, useRef } from 'react'

interface QRFormProps {
  value: string
  onChange: (data: string) => void
}

export function QRForm({ value, onChange }: QRFormProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange(raw)
    }, 300)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="qr-url-input" className="text-sm font-medium text-foreground">
        URL or link
      </label>
      <input
        id="qr-url-input"
        type="url"
        defaultValue={value}
        onChange={handleChange}
        placeholder="https://example.com"
        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
        autoComplete="off"
        spellCheck={false}
      />
      <p className="text-xs text-muted-foreground">
        Enter a URL to generate a QR code. Paste any link — no account needed.
      </p>
    </div>
  )
}
