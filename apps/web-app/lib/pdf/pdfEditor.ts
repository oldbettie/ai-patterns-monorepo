// @feature:pdf-editor @domain:pdf @frontend
// @summary: PDF manipulation operations using pdf-lib (client-safe, no server-only)

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type { TextElement, SignatureData } from '@quick-pdfs/common'

export type HexColor = string

function hexToRgb(hex: HexColor): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255
  return { r, g, b }
}

/**
 * Load PDF bytes from a Blob or File
 */
export async function loadPDFBytes(file: Blob): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer()
  // Create a copy to ensure we own the buffer and it's not detached elsewhere
  return new Uint8Array(buffer).slice(0)
}

/**
 * Get page count from PDF bytes
 */
export async function getPDFPageCount(bytes: Uint8Array): Promise<number> {
  const pdfDoc = await PDFDocument.load(bytes)
  return pdfDoc.getPageCount()
}

/**
 * Get dimensions of a specific page (in points)
 */
export async function getPageDimensions(
  bytes: Uint8Array,
  pageIndex: number
): Promise<{ width: number; height: number }> {
  const pdfDoc = await PDFDocument.load(bytes)
  const page = pdfDoc.getPage(pageIndex)
  return { width: page.getWidth(), height: page.getHeight() }
}

/**
 * Add text elements and signature images to a PDF, returning the modified bytes
 */
const FONT_MAP: Record<string, StandardFonts> = {
  'Helvetica': StandardFonts.Helvetica,
  'Helvetica-Bold': StandardFonts.HelveticaBold,
  'Helvetica-Oblique': StandardFonts.HelveticaOblique,
  'Helvetica-BoldOblique': StandardFonts.HelveticaBoldOblique,
  'Times-Roman': StandardFonts.TimesRoman,
  'Times-Bold': StandardFonts.TimesRomanBold,
  'Times-Italic': StandardFonts.TimesRomanItalic,
  'Times-BoldItalic': StandardFonts.TimesRomanBoldItalic,
  'Courier': StandardFonts.Courier,
  'Courier-Bold': StandardFonts.CourierBold,
  'Courier-Oblique': StandardFonts.CourierOblique,
  'Courier-BoldOblique': StandardFonts.CourierBoldOblique,
  'Symbol': StandardFonts.Symbol,
  'ZapfDingbats': StandardFonts.ZapfDingbats,
}

export async function exportPDF(
  originalBytes: Uint8Array,
  textElements: TextElement[],
  signatureElements: SignatureData[],
  signatureImages: Map<string, string>
): Promise<Uint8Array> {
  if (!originalBytes || originalBytes.length === 0) {
    throw new Error('Invalid PDF bytes: Empty or null')
  }

  let pdfDoc: PDFDocument
  try {
    pdfDoc = await PDFDocument.load(originalBytes)
  } catch (error) {
    console.error('Failed to load PDF bytes during export. Length:', originalBytes.length, 'First 20 bytes:', originalBytes.subarray(0, 20))
    throw error
  }

  const pages = pdfDoc.getPages()

  // Pre-embed fonts once
  const fontCache = new Map<string, Awaited<ReturnType<typeof pdfDoc.embedFont>>>()
  const getFont = async (family: string) => {
    if (!fontCache.has(family)) {
      const stdFont = FONT_MAP[family] ?? StandardFonts.Helvetica
      fontCache.set(family, await pdfDoc.embedFont(stdFont))
    }
    return fontCache.get(family)!
  }

  // Add text elements
  // Stored x/y are canvas pixels at scale=1 (top-left origin).
  // pdf-lib uses bottom-left origin in points. At scale=1 react-pdf renders
  // 1pt = 1px, so only the Y axis needs to be flipped.
  for (const element of textElements) {
    const page = pages[element.pageIndex]
    if (!page) continue

    const font = await getFont(element.fontFamily)
    const { r, g, b } = hexToRgb(element.color)
    const pageHeight = page.getHeight()

    page.drawText(element.text, {
      x: element.x,
      // Flip Y: canvas top → PDF bottom. Subtract fontSize so the visible top
      // of the text aligns with where the overlay div top was on screen.
      y: pageHeight - element.y - element.fontSize,
      size: element.fontSize,
      font,
      color: rgb(r, g, b),
    })
  }

  // Add signature images
  for (const sig of signatureElements) {
    const page = pages[sig.pageIndex]
    if (!page) continue

    const imageData = signatureImages.get(sig.signatureId)
    if (!imageData) continue

    const base64Data = imageData.replace(/^data:image\/png;base64,/, '')
    const pngBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
    const pngImage = await pdfDoc.embedPng(pngBytes)
    const pageHeight = page.getHeight()

    page.drawImage(pngImage, {
      x: sig.x,
      // Flip Y: subtract height so the image top aligns with the overlay top.
      y: pageHeight - sig.y - sig.height,
      width: sig.width,
      height: sig.height,
    })
  }

  return pdfDoc.save()
}

/**
 * Trigger browser download of PDF bytes
 */
export function downloadPDF(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
