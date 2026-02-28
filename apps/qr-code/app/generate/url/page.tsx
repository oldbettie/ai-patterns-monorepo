// @feature:qr-generator @domain:qr @frontend
// @summary: URL QR code tool page

import { URLToolClient } from './URLToolClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'URL QR Code Generator',
  description: 'Generate a QR code for any website or link. Free, no signup, no watermarks.',
}

export default function URLToolPage() {
  return <URLToolClient />
}
