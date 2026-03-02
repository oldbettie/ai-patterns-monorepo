// @feature:pdf-password @domain:pdf @backend
// @summary: Server actions for PDF encryption and decryption via the protect/unlock API routes

'use server'

import { headers } from 'next/headers'
import { getBaseUrl } from '@/lib/utils'

async function pdfBinaryFetch(path: string, formData: FormData): Promise<Response> {
  const headersList = await headers()
  const headersToExclude = new Set(['content-length', 'content-encoding', 'transfer-encoding', 'host', 'content-type'])
  const filteredHeaders = Object.fromEntries(
    Array.from(headersList.entries()).filter(([key]) => !headersToExclude.has(key.toLowerCase()))
  )

  return fetch(`${getBaseUrl()}${path}`, {
    method: 'POST',
    headers: filteredHeaders,
    body: formData,
  })
}

/**
 * Encrypt a PDF with a password.
 * Returns the encrypted PDF bytes, or null on error.
 */
export async function protectPDFAction(bytes: Uint8Array, password: string): Promise<Uint8Array | null> {
  const formData = new FormData()
  formData.append('file', new Blob([bytes], { type: 'application/pdf' }), 'document.pdf')
  formData.append('password', password)

  const res = await pdfBinaryFetch('/api/core/v1/pdfs/protect', formData)
  if (!res.ok) return null
  return new Uint8Array(await res.arrayBuffer())
}

/**
 * Decrypt a password-protected PDF.
 * Returns the decrypted PDF bytes, or null if the password is incorrect.
 */
export async function unlockPDFAction(bytes: Uint8Array, password: string): Promise<Uint8Array | null> {
  const formData = new FormData()
  formData.append('file', new Blob([bytes], { type: 'application/pdf' }), 'document.pdf')
  formData.append('password', password)

  const res = await pdfBinaryFetch('/api/core/v1/pdfs/unlock', formData)
  if (!res.ok) return null
  return new Uint8Array(await res.arrayBuffer())
}
