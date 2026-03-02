// @feature:pdf-password @domain:pdf @backend
// @summary: Service for encrypting and decrypting PDF documents

import 'server-only'
import crypto from 'crypto'
import { PDFDocument } from 'pdf-lib'
import {
  rc4,
  deriveEncryptionKey,
  computeOwnerKey,
  computeUserKey,
  verifyUserKey,
  parseEncryptDict,
  deriveObjectKey,
} from '@/lib/pdf/pdfCrypto'
import type { EncryptInfo } from '@/lib/pdf/pdfCrypto'

// ---------------------------------------------------------------------------
// PDF object representation
// ---------------------------------------------------------------------------

interface PDFObject {
  objNum: number
  genNum: number
  /** Everything before "stream\n" (or the entire content for non-stream objects) */
  dictText: string
  /** Raw bytes of the stream payload (null if no stream) */
  streamData: Buffer | null
  /** Line ending used after "stream" keyword — preserved during round-trips */
  streamEOL: string
}

// ---------------------------------------------------------------------------
// Parse all objects from a PDF buffer
// ---------------------------------------------------------------------------

/**
 * Scan the PDF buffer and return every "N G obj … endobj" block.
 *
 * Uses 'binary' encoding so character-offset === byte-offset, letting us
 * safely extract binary stream payloads from the original buffer.
 *
 * Critically: after parsing a stream object we advance the regex past the
 * stream payload. Without this, AES-encrypted binary data can accidentally
 * contain the bytes for "N G obj\n" and confuse the scanner.
 */
function parsePDFObjects(buf: Buffer): PDFObject[] {
  const text = buf.toString('binary')
  const objects: PDFObject[] = []

  // Only match at the start of a line (preceded by \n / \r or at offset 0).
  const OBJ_RE = /(\d+)\s+(\d+)\s+obj\r?\n/g
  let m: RegExpExecArray | null

  while ((m = OBJ_RE.exec(text)) !== null) {
    const preceding = m.index > 0 ? text[m.index - 1] : '\n'
    if (preceding !== '\n' && preceding !== '\r') continue

    const objNum = parseInt(m[1])
    const genNum = parseInt(m[2])
    const contentStart = m.index + m[0].length

    // Search for "stream\n" only inside the dict area (max 65 KB).
    // This avoids matching "stream" inside binary data of a previous object.
    const dictSearchEnd = Math.min(contentStart + 65536, text.length)
    const dictArea = text.slice(contentStart, dictSearchEnd)
    const streamMatch = /\bstream(\r\n|\n)/.exec(dictArea)

    if (streamMatch) {
      const dictText = dictArea.slice(0, streamMatch.index)
      const streamEOL = streamMatch[1]
      const streamDataStart = contentStart + streamMatch.index! + streamMatch[0].length

      const lengthMatch = dictText.match(/\/Length\s+(\d+)/)
      const declaredLen = lengthMatch ? parseInt(lengthMatch[1]) : -1

      let streamDataEnd: number
      if (declaredLen >= 0 && streamDataStart + declaredLen <= buf.length) {
        streamDataEnd = streamDataStart + declaredLen
      } else {
        const esIdx = text.indexOf('endstream', streamDataStart)
        streamDataEnd = esIdx !== -1 ? esIdx : streamDataStart
      }

      objects.push({
        objNum, genNum, dictText,
        streamData: buf.subarray(streamDataStart, streamDataEnd),
        streamEOL,
      })

      // *** Advance past the stream payload so binary data inside it can't
      //     be misread as an object header on the next regex iteration. ***
      const endobjAfterStream = text.indexOf('endobj', streamDataEnd)
      if (endobjAfterStream !== -1) {
        OBJ_RE.lastIndex = endobjAfterStream + 6
      }
    } else {
      // Non-stream object — find the closing "endobj"
      const endobjIdx = text.indexOf('\nendobj', contentStart)
      const dictText = endobjIdx !== -1
        ? text.slice(contentStart, endobjIdx)
        : dictArea

      objects.push({ objNum, genNum, dictText, streamData: null, streamEOL: '\n' })

      if (endobjIdx !== -1) {
        OBJ_RE.lastIndex = endobjIdx + 7
      }
    }
  }

  return objects
}

// ---------------------------------------------------------------------------
// Serialize a single PDF object to bytes
// ---------------------------------------------------------------------------

function serializeObject(obj: PDFObject): Buffer {
  const header = Buffer.from(`${obj.objNum} ${obj.genNum} obj\n`, 'binary')

  if (!obj.streamData) {
    return Buffer.concat([
      header,
      Buffer.from(obj.dictText, 'binary'),
      Buffer.from('\nendobj\n', 'binary'),
    ])
  }

  return Buffer.concat([
    header,
    Buffer.from(obj.dictText, 'binary'),
    Buffer.from(`stream${obj.streamEOL}`, 'binary'),
    obj.streamData,
    Buffer.from('\nendstream\nendobj\n', 'binary'),
  ])
}

// ---------------------------------------------------------------------------
// Build a complete PDF with a freshly-computed xref table
// ---------------------------------------------------------------------------

function buildPDF(
  pdfHeader: string,
  objects: PDFObject[],
  opts: { rootRef: string; size: number; encryptRef?: string; fileId?: string },
): Buffer {
  const parts: Buffer[] = []
  const offsets = new Map<number, number>()
  let pos = 0

  const write = (b: Buffer) => { parts.push(b); pos += b.length }

  // Header + binary comment so viewers treat the file as binary
  write(Buffer.from(`${pdfHeader}\n%\xFF\xFF\xFF\xFF\n`, 'binary'))

  // Objects in ascending order
  const sorted = [...objects].sort((a, b) => a.objNum - b.objNum)
  for (const obj of sorted) {
    offsets.set(obj.objNum, pos)
    write(serializeObject(obj))
  }

  // Cross-reference table
  const xrefOffset = pos
  const xrefSize = opts.size
  let xref = `xref\n0 ${xrefSize}\n0000000000 65535 f \n`
  for (let i = 1; i < xrefSize; i++) {
    const off = offsets.get(i)
    xref += off !== undefined
      ? `${String(off).padStart(10, '0')} 00000 n \n`
      : '0000000000 65535 f \n'
  }
  write(Buffer.from(xref, 'binary'))

  // Trailer + startxref
  let trailer = `trailer\n<< /Size ${xrefSize} /Root ${opts.rootRef}`
  if (opts.encryptRef) trailer += ` /Encrypt ${opts.encryptRef}`
  if (opts.fileId) trailer += ` /ID [<${opts.fileId}><${opts.fileId}>]`
  trailer += ` >>\nstartxref\n${xrefOffset}\n%%EOF\n`
  write(Buffer.from(trailer, 'binary'))

  return Buffer.concat(parts)
}

// ---------------------------------------------------------------------------
// Extract PDF header line and root reference from an existing PDF
// ---------------------------------------------------------------------------

function extractTrailerInfo(buf: Buffer, parsedObjects?: PDFObject[]): { pdfHeader: string; rootRef: string } {
  const text = buf.toString('binary')
  const newline = text.indexOf('\n')
  const pdfHeader = (newline !== -1 ? text.slice(0, newline) : '%PDF-1.4').trim()

  // Traditional trailer section (PDF 1.4 and earlier, or PDF 1.5+ with xref table)
  const trailerIdx = text.lastIndexOf('trailer')
  if (trailerIdx !== -1) {
    const rootMatch = text.slice(trailerIdx, trailerIdx + 4096).match(/\/Root\s+(\d+\s+\d+\s+R)/)
    if (rootMatch) return { pdfHeader, rootRef: rootMatch[1] }
  }

  // PDF 1.5+: /Root lives in a cross-reference stream dictionary (no traditional trailer)
  const objects = parsedObjects ?? parsePDFObjects(buf)
  for (const obj of objects) {
    if (/\/Type\s*\/XRef/.test(obj.dictText)) {
      const rootMatch = obj.dictText.match(/\/Root\s+(\d+\s+\d+\s+R)/)
      if (rootMatch) return { pdfHeader, rootRef: rootMatch[1] }
    }
  }

  return { pdfHeader, rootRef: '1 0 R' }
}

// ---------------------------------------------------------------------------
// Per-object crypto helpers
// ---------------------------------------------------------------------------

function encryptAES128(data: Buffer, key: Buffer): Buffer {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-128-cbc', key.subarray(0, 16), iv)
  cipher.setAutoPadding(true)
  return Buffer.concat([iv, cipher.update(data), cipher.final()])
}

function decryptData(data: Buffer, key: Buffer, algorithm: EncryptInfo['algorithm']): Buffer {
  if (algorithm === 'rc4-40' || algorithm === 'rc4-128') return rc4(key, data)
  if (data.length < 17) return data
  const iv = data.subarray(0, 16)
  const ct = data.subarray(16)
  const aesKey = algorithm === 'aes-256' ? key.subarray(0, 32) : key.subarray(0, 16)
  try {
    const d = crypto.createDecipheriv(
      algorithm === 'aes-256' ? 'aes-256-cbc' : 'aes-128-cbc',
      aesKey, iv,
    )
    d.setAutoPadding(true)
    return Buffer.concat([d.update(ct), d.final()])
  } catch {
    return ct
  }
}

// ---------------------------------------------------------------------------
// String processing inside object dict text (not stream payload)
// ---------------------------------------------------------------------------

function processStringsInText(
  text: string,
  key: Buffer,
  algorithm: EncryptInfo['algorithm'],
  mode: 'encrypt' | 'decrypt',
): string {
  // Hex strings <hexhex>
  text = text.replace(/<([0-9a-fA-F]{2,})>/g, (_, hex: string) => {
    const data = Buffer.from(hex, 'hex')
    const out = mode === 'encrypt' ? encryptAES128(data, key) : decryptData(data, key, algorithm)
    return `<${out.toString('hex')}>`
  })

  // Literal strings (...)
  const parts: string[] = []
  let i = 0
  while (i < text.length) {
    if (text[i] === '(') {
      const { bytes, end } = parseLiteralString(text, i + 1)
      const data = Buffer.from(bytes)
      const out = mode === 'encrypt' ? encryptAES128(data, key) : decryptData(data, key, algorithm)
      parts.push(`<${out.toString('hex')}>`)
      i = end
    } else {
      parts.push(text[i])
      i++
    }
  }
  return parts.join('')
}

function parseLiteralString(text: string, start: number): { bytes: number[]; end: number } {
  const bytes: number[] = []
  let i = start
  let depth = 1
  while (i < text.length && depth > 0) {
    if (text[i] === '\\') {
      i++
      const esc = text[i]
      if (esc === 'n') bytes.push(0x0a)
      else if (esc === 'r') bytes.push(0x0d)
      else if (esc === 't') bytes.push(0x09)
      else if (esc === 'b') bytes.push(0x08)
      else if (esc === 'f') bytes.push(0x0c)
      else if (esc === '(') bytes.push(0x28)
      else if (esc === ')') bytes.push(0x29)
      else if (esc === '\\') bytes.push(0x5c)
      else if (/[0-7]/.test(esc)) {
        const oct = text.slice(i, i + 3).match(/^([0-7]{1,3})/)?.[1] ?? esc
        bytes.push(parseInt(oct, 8))
        i += oct.length - 1
      } else bytes.push(esc.charCodeAt(0))
      i++
    } else if (text[i] === '(') { depth++; bytes.push(0x28); i++ }
    else if (text[i] === ')') { depth--; if (depth > 0) bytes.push(0x29); i++ }
    else { bytes.push(text.charCodeAt(i)); i++ }
  }
  return { bytes, end: i }
}

// ---------------------------------------------------------------------------
// PDFCryptoService
// ---------------------------------------------------------------------------

export class PDFCryptoService {
  isEncrypted(bytes: Uint8Array): boolean {
    return parseEncryptDict(bytes) !== null
  }

  async encryptPDF(bytes: Uint8Array, password: string): Promise<Uint8Array> {
    // Normalize via pdf-lib: decompresses ObjStm (compressed object streams, PDF 1.5+)
    // and cross-reference streams so parsePDFObjects can locate every object.
    // Without this, small objects like /Catalog and /Pages are often missing from output.
    let buf: Buffer
    try {
      const pdfDoc = await PDFDocument.load(bytes)
      buf = Buffer.from(await pdfDoc.save({ useObjectStreams: false }))
    } catch {
      buf = Buffer.from(bytes)
    }

    const P = -3904
    const fileId = crypto.randomBytes(16)
    const ownerKey = computeOwnerKey(password, password, 16, 4)
    const fileKey = deriveEncryptionKey(password, ownerKey, P, fileId, 16, 4, true)
    const userKey = computeUserKey(fileKey, fileId, 4)

    const objects = parsePDFObjects(buf)
    // Extract rootRef after parsing so XRef-stream PDFs (PDF 1.5+) are handled correctly
    const { pdfHeader, rootRef } = extractTrailerInfo(buf, objects)
    // Drop any cross-reference stream objects (we rebuild our own xref table)
    const filtered = objects.filter(o => !/\/Type\s*\/XRef/.test(o.dictText))
    const maxObjNum = filtered.reduce((mx, o) => Math.max(mx, o.objNum), 0)
    const encObjNum = maxObjNum + 1

    // Encrypt each object's strings and stream payload
    const encrypted: PDFObject[] = filtered.map(obj => {
      const objKey = deriveObjectKey(fileKey, obj.objNum, obj.genNum, true /* AES */)
      const newStream = obj.streamData ? encryptAES128(obj.streamData, objKey) : null
      let dictText = processStringsInText(obj.dictText, objKey, 'aes-128', 'encrypt')
      if (newStream) dictText = dictText.replace(/\/Length\s+\d+/, `/Length ${newStream.length}`)
      return { ...obj, dictText, streamData: newStream }
    })

    // Append the /Encrypt dictionary object (never encrypted)
    encrypted.push({
      objNum: encObjNum, genNum: 0,
      dictText: [
        '<<',
        '/Filter /Standard',
        '/V 4', '/R 4',
        '/Length 128',
        `/P ${P}`,
        '/CF << /StdCF << /AuthEvent /DocOpen /CFM /AESV2 /Length 16 >> >>',
        '/StmF /StdCF', '/StrF /StdCF',
        `/O <${ownerKey.toString('hex')}>`,
        `/U <${userKey.toString('hex')}>`,
        '>>',
      ].join('\n'),
      streamData: null, streamEOL: '\n',
    })

    return buildPDF(pdfHeader, encrypted, {
      rootRef, size: encObjNum + 1,
      encryptRef: `${encObjNum} 0 R`,
      fileId: fileId.toString('hex'),
    })
  }

  async decryptPDF(bytes: Uint8Array, password: string): Promise<Uint8Array> {
    const encInfo = parseEncryptDict(bytes)
    if (!encInfo) return bytes

    const { algorithm, R, keyLen, O, U, P, fileId, encryptMetadata } = encInfo
    const fileKey = deriveEncryptionKey(password, O, P, fileId, keyLen, R, encryptMetadata)

    if (!verifyUserKey(fileKey, U, fileId, R)) {
      throw new Error('Incorrect password')
    }

    const buf = Buffer.from(bytes)
    const objects = parsePDFObjects(buf)
    const isAES = algorithm === 'aes-128' || algorithm === 'aes-256'

    // Identify and skip the /Encrypt dict object and any xref stream objects
    const encryptObjNums = new Set(
      objects.filter(o => /\/Filter\s*\/Standard/.test(o.dictText)).map(o => o.objNum)
    )
    const filtered = objects.filter(
      o => !encryptObjNums.has(o.objNum) && !/\/Type\s*\/XRef/.test(o.dictText)
    )

    const decrypted: PDFObject[] = filtered.map(obj => {
      const objKey = deriveObjectKey(fileKey, obj.objNum, obj.genNum, isAES)

      const newStream = obj.streamData ? decryptData(obj.streamData, objKey, algorithm) : null

      let dictText = processStringsInText(obj.dictText, objKey, algorithm, 'decrypt')
      if (newStream && newStream.length !== obj.streamData?.length) {
        dictText = dictText.replace(/\/Length\s+\d+/, `/Length ${newStream.length}`)
      }

      return { ...obj, dictText, streamData: newStream }
    })

    const { pdfHeader, rootRef } = extractTrailerInfo(buf, objects)
    const maxObjNum = decrypted.reduce((mx, o) => Math.max(mx, o.objNum), 0)

    return buildPDF(pdfHeader, decrypted, { rootRef, size: maxObjNum + 1 })
  }
}

export const createPDFCryptoService = () => new PDFCryptoService()
