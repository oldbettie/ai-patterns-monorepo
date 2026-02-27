// @feature:qr-generator @domain:qr @frontend
// @summary: Main QR code generator page

import { QRGeneratorClient } from './QRGeneratorClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'QR Code Generator',
  description: 'Generate QR codes for URLs, WiFi, vCards, SMS, email, and plain text. Free, no signup, no watermarks.',
}

export default function GeneratePage() {
  return <QRGeneratorClient />
}
