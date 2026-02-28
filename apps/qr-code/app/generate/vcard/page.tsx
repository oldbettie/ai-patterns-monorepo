// @feature:qr-generator @domain:qr @frontend
// @summary: vCard contact QR code tool page

import { VCardToolClient } from './VCardToolClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Card QR Code Generator',
  description: 'Create a QR code that saves your contact info to any phone.',
}

export default function VCardToolPage() {
  return <VCardToolClient />
}
