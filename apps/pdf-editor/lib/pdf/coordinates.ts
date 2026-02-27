// @feature:pdf-editor @domain:pdf @frontend
// @summary: Coordinate transform utilities for mapping between canvas and PDF coordinate systems

/**
 * PDF uses bottom-left origin in points (1pt = 1/72in).
 * Canvas/DOM uses top-left origin in pixels.
 * These functions convert between the two systems.
 */

export interface PDFDimensions {
  widthPts: number
  heightPts: number
}

export interface CanvasDimensions {
  widthPx: number
  heightPx: number
}

export interface Point {
  x: number
  y: number
}

/**
 * Convert canvas (top-left origin, px) coordinates to PDF (bottom-left origin, pts)
 */
export function canvasToPDF(
  canvasPoint: Point,
  canvas: CanvasDimensions,
  pdf: PDFDimensions
): Point {
  const scaleX = pdf.widthPts / canvas.widthPx
  const scaleY = pdf.heightPts / canvas.heightPx

  return {
    x: canvasPoint.x * scaleX,
    // Flip Y: PDF origin is bottom-left, canvas is top-left
    y: pdf.heightPts - canvasPoint.y * scaleY,
  }
}

/**
 * Convert PDF (bottom-left origin, pts) coordinates to canvas (top-left origin, px)
 */
export function pdfToCanvas(
  pdfPoint: Point,
  pdf: PDFDimensions,
  canvas: CanvasDimensions
): Point {
  const scaleX = canvas.widthPx / pdf.widthPts
  const scaleY = canvas.heightPx / pdf.heightPts

  return {
    x: pdfPoint.x * scaleX,
    // Flip Y: PDF origin is bottom-left, canvas is top-left
    y: (pdf.heightPts - pdfPoint.y) * scaleY,
  }
}

/**
 * Scale a dimension value from canvas pixels to PDF points
 */
export function scaleToPDF(
  pixelValue: number,
  canvasDimension: number,
  pdfDimension: number
): number {
  return (pixelValue / canvasDimension) * pdfDimension
}
