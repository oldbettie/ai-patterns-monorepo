// @feature:qr-generator @domain:qr @frontend
// @summary: Plain text QR code tool page

import { TextToolClient } from './TextToolClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Text QR Code Generator',
  description: 'Encode any plain text as a QR code. Notes, addresses, codes — anything.',
}

export default function TextToolPage() {
  return <TextToolClient />
}
