// @feature:pdf-editor @domain:pdf @frontend
// @summary: Unit tests for PDF coordinate transform utilities

import { describe, it, expect } from 'vitest'
import { canvasToPDF, pdfToCanvas, scaleToPDF } from '@/lib/pdf/coordinates'

describe('canvasToPDF', () => {
  it('converts top-left canvas origin to bottom-left PDF origin', () => {
    const result = canvasToPDF(
      { x: 0, y: 0 },
      { widthPx: 595, heightPx: 842 },
      { widthPts: 595, heightPts: 842 }
    )
    expect(result.x).toBeCloseTo(0)
    expect(result.y).toBeCloseTo(842)
  })

  it('maps bottom-right canvas corner to PDF bottom-right', () => {
    const result = canvasToPDF(
      { x: 595, y: 842 },
      { widthPx: 595, heightPx: 842 },
      { widthPts: 595, heightPts: 842 }
    )
    expect(result.x).toBeCloseTo(595)
    expect(result.y).toBeCloseTo(0)
  })

  it('correctly scales when canvas size differs from PDF size', () => {
    // Canvas is half the PDF dimensions
    const result = canvasToPDF(
      { x: 100, y: 100 },
      { widthPx: 297.5, heightPx: 421 },
      { widthPts: 595, heightPts: 842 }
    )
    expect(result.x).toBeCloseTo(200)
    expect(result.y).toBeCloseTo(642) // 842 - (100 * 2) = 642
  })
})

describe('pdfToCanvas', () => {
  it('is the inverse of canvasToPDF for the same dimensions', () => {
    const original = { x: 150, y: 300 }
    const canvas = { widthPx: 595, heightPx: 842 }
    const pdf = { widthPts: 595, heightPts: 842 }

    const pdfPoint = canvasToPDF(original, canvas, pdf)
    const back = pdfToCanvas(pdfPoint, pdf, canvas)

    expect(back.x).toBeCloseTo(original.x)
    expect(back.y).toBeCloseTo(original.y)
  })
})

describe('scaleToPDF', () => {
  it('scales proportionally', () => {
    const result = scaleToPDF(50, 100, 595)
    expect(result).toBeCloseTo(297.5)
  })
})
