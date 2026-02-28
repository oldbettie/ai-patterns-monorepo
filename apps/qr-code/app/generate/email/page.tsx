// @feature:qr-generator @domain:qr @frontend
// @summary: Email QR code tool page

import { EmailToolClient } from './EmailToolClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Email QR Code Generator',
  description: 'Create a QR code that opens a pre-filled email in any mail app.',
}

export default function EmailToolPage() {
  return <EmailToolClient />
}
