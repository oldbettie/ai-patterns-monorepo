// @feature:pdf-password @domain:pdf @api
// @summary: Encrypt a PDF with a user-supplied password (AES-128, V=4 R=4)

import { NextResponse } from 'next/server'
import { createRouteHandler } from '@/lib/auth/route-handler'
import { createPDFCryptoService } from '@/lib/services/pdfCryptoService'

export const POST = createRouteHandler({ isPublic: true }, async (req) => {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const password = formData.get('password') as string | null

  if (!file || !password) {
    return NextResponse.json({ data: null, error: 'Missing file or password' }, { status: 400 })
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const service = createPDFCryptoService()

  try {
    const encrypted = await service.encryptPDF(bytes, password)
    return new NextResponse(encrypted, { headers: { 'Content-Type': 'application/pdf' } })
  } catch (e) {
    console.error('PDF protect failed:', e)
    return NextResponse.json({ data: null, error: 'Failed to encrypt PDF' }, { status: 500 })
  }
})
