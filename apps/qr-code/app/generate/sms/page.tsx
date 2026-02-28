// @feature:qr-generator @domain:qr @frontend
// @summary: SMS QR code tool page

import { SMSToolClient } from './SMSToolClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SMS QR Code Generator',
  description: 'Create a QR code that opens a pre-filled text message on any phone.',
}

export default function SMSToolPage() {
  return <SMSToolClient />
}
