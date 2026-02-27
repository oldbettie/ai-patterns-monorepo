// @feature:qr-generator @domain:qr @shared
// @summary: Client-accessible QR code type definitions

export type QRDotStyle = 'square' | 'rounded' | 'dots'
export type QRType = 'url' | 'wifi' | 'vcard' | 'sms' | 'email' | 'text'
export type QRHistoryEntry = {
  id: string
  label: string
  type: QRType
  data: string
  svgData: string
  options: { fgColor: string; bgColor: string; dotStyle: QRDotStyle; logoUrl?: string }
  createdAt: number
}
