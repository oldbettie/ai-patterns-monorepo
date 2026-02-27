// @feature:qr-generator @domain:qr @frontend
// @summary: qr-code-styling wrapper — client-only, import dynamically or use in useEffect

import type { QRDotStyle } from '@/lib/types'

export interface QROptions {
  width?: number
  height?: number
  fgColor?: string
  bgColor?: string
  dotStyle?: QRDotStyle
  logoUrl?: string
}

// Map our simple dot style names to qr-code-styling dot type values
const DOT_TYPE_MAP: Record<QRDotStyle, string> = {
  square: 'square',
  rounded: 'rounded',
  dots: 'dots',
}

// Dynamic import helper — safe to call only on the client side
async function getQRCodeStyling() {
  if (typeof window === 'undefined') {
    throw new Error('qrGenerator must be used client-side only')
  }
  const mod = await import('qr-code-styling')
  return mod.default
}

export async function createQRCode(data: string, options: QROptions = {}) {
  const QRCodeStyling = await getQRCodeStyling()

  return new QRCodeStyling({
    width: options.width ?? 300,
    height: options.height ?? 300,
    data,
    dotsOptions: {
      color: options.fgColor ?? '#000000',
      type: (DOT_TYPE_MAP[options.dotStyle ?? 'square'] ?? 'square') as 'square' | 'rounded' | 'dots',
    },
    backgroundOptions: {
      color: options.bgColor ?? '#ffffff',
    },
    image: options.logoUrl,
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 8,
    },
  })
}

export async function downloadAsPNG(
  qr: Awaited<ReturnType<typeof createQRCode>>,
  filename = 'qr-code.png'
): Promise<void> {
  await qr.download({ name: filename.replace(/\.png$/, ''), extension: 'png' })
}

export async function downloadAsSVG(
  qr: Awaited<ReturnType<typeof createQRCode>>,
  filename = 'qr-code.svg'
): Promise<void> {
  await qr.download({ name: filename.replace(/\.svg$/, ''), extension: 'svg' })
}

export async function getSVGString(
  qr: Awaited<ReturnType<typeof createQRCode>>
): Promise<string> {
  const blob = await qr.getRawData('svg')
  if (!blob) return ''
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(blob as Blob)
  })
}
