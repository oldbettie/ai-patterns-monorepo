// @feature:qr-generator @domain:qr @backend
// @summary: QR data string formatters for each supported QR code type

export function formatURL(url: string): string {
  return url
}

export function formatWiFi({
  ssid,
  password,
  encryption,
  hidden,
}: {
  ssid: string
  password: string
  encryption: 'WPA' | 'WEP' | 'nopass'
  hidden?: boolean
}): string {
  const esc = (s: string) => s.replace(/[\\;,"]/g, (c) => `\\${c}`)
  const hiddenPart = hidden ? 'H:true;' : ''
  return `WIFI:T:${encryption};S:${esc(ssid)};P:${esc(password)};${hiddenPart};`
}

export function formatVCard({
  name,
  phone,
  email,
  org,
  title,
  url,
  address,
}: {
  name: string
  phone?: string
  email?: string
  org?: string
  title?: string
  url?: string
  address?: string
}): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name}`,
    phone ? `TEL:${phone}` : null,
    email ? `EMAIL:${email}` : null,
    org ? `ORG:${org}` : null,
    title ? `TITLE:${title}` : null,
    url ? `URL:${url}` : null,
    address ? `ADR:;;${address};;;;` : null,
    'END:VCARD',
  ]
  return lines.filter(Boolean).join('\n')
}

export function formatSMS({ phone, message }: { phone: string; message?: string }): string {
  if (message) {
    return `SMSTO:${phone}:${message}`
  }
  return `SMSTO:${phone}`
}

export function formatEmail({
  to,
  subject,
  body,
}: {
  to: string
  subject?: string
  body?: string
}): string {
  const params: string[] = []
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`)
  if (body) params.push(`body=${encodeURIComponent(body)}`)
  const qs = params.length > 0 ? `?${params.join('&')}` : ''
  return `mailto:${to}${qs}`
}

export function formatText(text: string): string {
  return text
}
