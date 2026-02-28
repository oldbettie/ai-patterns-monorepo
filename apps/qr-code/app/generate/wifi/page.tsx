// @feature:qr-generator @domain:qr @frontend
// @summary: WiFi QR code tool page

import { WiFiToolClient } from './WiFiToolClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WiFi QR Code Generator',
  description: 'Share your WiFi credentials with a QR code. Guests scan to connect instantly.',
}

export default function WiFiToolPage() {
  return <WiFiToolClient />
}
