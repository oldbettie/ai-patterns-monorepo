// @feature:pdf-password @domain:pdf @api
// @summary: Decrypt an encrypted PDF using the supplied password

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
    const decrypted = await service.decryptPDF(bytes, password)
    return new NextResponse(decrypted, {
      headers: { 'Content-Type': 'application/pdf' },
    })
  } catch {
    return NextResponse.json({ data: null, error: 'Incorrect password' }, { status: 401 })
  }
})
