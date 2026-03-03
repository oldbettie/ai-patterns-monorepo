// @feature:pdf-password @domain:pdf @backend
// @summary: Server actions for PDF encryption and decryption via the protect/unlock API routes

'use server'

import { headers } from 'next/headers'
import { getBaseUrl } from '@/lib/utils'
import { ApiRoutes } from '@/lib/config/featureToggles'

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

export async function protectPDFAction(
  bytes: Uint8Array,
  password: string,
): Promise<{ data: Uint8Array | null; error: string | null }> {
  const formData = new FormData()
  formData.append('file', new Blob([Buffer.from(bytes)], { type: 'application/pdf' }), 'document.pdf')
  formData.append('password', password)

  const res = await pdfBinaryFetch(ApiRoutes.pdfs.protect, formData)
  if (!res.ok) return { data: null, error: 'Failed to encrypt PDF' }
  return { data: new Uint8Array(await res.arrayBuffer()), error: null }
}

export async function unlockPDFAction(
  bytes: Uint8Array,
  password: string,
): Promise<{ data: Uint8Array | null; error: string | null }> {
  const formData = new FormData()
  formData.append('file', new Blob([Buffer.from(bytes)], { type: 'application/pdf' }), 'document.pdf')
  formData.append('password', password)

  const res = await pdfBinaryFetch(ApiRoutes.pdfs.unlock, formData)
  if (!res.ok) {
    if (res.status === 401) return { data: null, error: 'incorrect' }
    return { data: null, error: 'Failed to decrypt PDF' }
  }
  return { data: new Uint8Array(await res.arrayBuffer()), error: null }
}
