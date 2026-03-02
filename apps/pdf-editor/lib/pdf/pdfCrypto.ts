// @feature:pdf-password @domain:pdf @backend
// @summary: Raw PDF encryption/decryption helpers — RC4, key derivation, Encrypt dict parsing

import crypto from 'crypto'

// Standard PDF password padding string (PDF spec §7.6.3.3)
export const PASSWORD_PADDING = Buffer.from([
  0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41, 0x64, 0x00, 0x4e, 0x56,
  0xff, 0xfa, 0x01, 0x08, 0x2e, 0x2e, 0x00, 0xb6, 0xd0, 0x68, 0x3e, 0x80,
  0x2f, 0x0c, 0xa9, 0xfe, 0x64, 0x53, 0x69, 0x7a,
])

export interface EncryptInfo {
  algorithm: 'rc4-40' | 'rc4-128' | 'aes-128' | 'aes-256'
  V: number
  R: number
  keyLen: number // in bytes
  O: Buffer // /O entry (owner password hash)
  U: Buffer // /U entry (user password hash)
  P: number // /P permissions flags
  fileId: Buffer // first entry from /ID array
  encryptMetadata: boolean
}

// ---------- RC4 stream cipher (~15 lines) ----------

export function rc4(key: Buffer, data: Buffer): Buffer {
  const s = Array.from({ length: 256 }, (_, i) => i)
  let j = 0
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key[i % key.length]) & 0xff
    ;[s[i], s[j]] = [s[j], s[i]]
  }
  let i = 0
  j = 0
  return Buffer.from(
    data.map(byte => {
      i = (i + 1) & 0xff
      j = (j + s[i]) & 0xff
      ;[s[i], s[j]] = [s[j], s[i]]
      return byte ^ s[(s[i] + s[j]) & 0xff]
    })
  )
}

// ---------- Password helpers ----------

/** Pad or truncate a password string to exactly 32 bytes using PDF padding */
export function padPassword(password: string): Buffer {
  const pw = Buffer.from(password, 'latin1')
  const padded = Buffer.alloc(32)
  const copyLen = Math.min(pw.length, 32)
  pw.copy(padded, 0, 0, copyLen)
  PASSWORD_PADDING.copy(padded, copyLen, 0, 32 - copyLen)
  return padded
}

// ---------- Key derivation (PDF spec §7.6.3) ----------

/**
 * Compute the owner password hash (/O entry).
 * ownerPw is the owner password; userPw is the user password.
 */
export function computeOwnerKey(ownerPw: string, userPw: string, keyLen: number, revision: number): Buffer {
  const ownerPadded = padPassword(ownerPw || userPw)
  let md5 = crypto.createHash('md5').update(ownerPadded).digest()
  if (revision >= 3) {
    for (let i = 0; i < 50; i++) {
      md5 = crypto.createHash('md5').update(md5.subarray(0, keyLen)).digest()
    }
  }
  const encKey = md5.subarray(0, keyLen)
  const userPadded = padPassword(userPw)
  let result = rc4(encKey, userPadded)
  if (revision >= 3) {
    for (let i = 1; i <= 19; i++) {
      const iterKey = Buffer.from(Array.from(encKey, b => b ^ i))
      result = rc4(iterKey, result)
    }
  }
  return result
}

/**
 * Derive the file encryption key from the user password.
 */
export function deriveEncryptionKey(
  userPw: string,
  ownerKey: Buffer,
  permissions: number,
  fileId: Buffer,
  keyLen: number,
  revision: number,
  encryptMetadata = true,
): Buffer {
  const userPadded = padPassword(userPw)
  const permBuf = Buffer.alloc(4)
  permBuf.writeInt32LE(permissions, 0)

  const hash = crypto.createHash('md5')
  hash.update(userPadded)
  hash.update(ownerKey)
  hash.update(permBuf)
  hash.update(fileId)
  if (revision >= 4 && !encryptMetadata) {
    hash.update(Buffer.from([0xff, 0xff, 0xff, 0xff]))
  }
  let digest = hash.digest()

  if (revision >= 3) {
    for (let i = 0; i < 50; i++) {
      digest = crypto.createHash('md5').update(digest.subarray(0, keyLen)).digest()
    }
  }
  return digest.subarray(0, keyLen)
}

/**
 * Compute the user password hash (/U entry) for verification.
 * revision 2: simple RC4
 * revision >= 3: MD5 + 20-round RC4
 */
export function computeUserKey(encKey: Buffer, fileId: Buffer, revision: number): Buffer {
  if (revision < 3) {
    return rc4(encKey, PASSWORD_PADDING)
  }
  const hash = crypto.createHash('md5').update(PASSWORD_PADDING).update(fileId).digest()
  let result = rc4(encKey, hash)
  for (let i = 1; i <= 19; i++) {
    const iterKey = Buffer.from(Array.from(encKey, b => b ^ i))
    result = rc4(iterKey, result)
  }
  // Pad to 32 bytes
  const out = Buffer.alloc(32)
  result.copy(out, 0, 0, 16)
  return out
}

/**
 * Verify that a candidate encryption key matches the /U entry from the PDF.
 */
export function verifyUserKey(encKey: Buffer, uEntry: Buffer, fileId: Buffer, revision: number): boolean {
  const computed = computeUserKey(encKey, fileId, revision)
  if (revision < 3) {
    return computed.equals(uEntry.subarray(0, 32))
  }
  // Only first 16 bytes are significant for R>=3
  return computed.subarray(0, 16).equals(uEntry.subarray(0, 16))
}

// ---------- Raw PDF Encrypt dict parser ----------

/**
 * Parse the /Encrypt dictionary from raw PDF bytes without using pdf-lib.
 * pdf-lib throws on encrypted PDFs, so we parse the cross-reference table
 * directly to locate the trailer and then the /Encrypt object.
 *
 * Returns null if the PDF is not encrypted.
 */
export function parseEncryptDict(pdfBytes: Uint8Array): EncryptInfo | null {
  const buf = Buffer.from(pdfBytes)
  const text = buf.toString('binary')

  // Locate startxref
  const sxrefIdx = text.lastIndexOf('startxref')
  if (sxrefIdx === -1) return null
  const afterSxref = text.slice(sxrefIdx + 9).trimStart()
  const xrefOffset = parseInt(afterSxref, 10)
  if (isNaN(xrefOffset)) return null

  // Read the trailer dictionary
  // Supports both classic xref tables and cross-reference streams
  let trailerText = ''
  const xrefMarker = text.indexOf('xref', xrefOffset)
  if (xrefMarker !== -1 && xrefMarker < xrefOffset + 10) {
    // Classic xref table — find trailer keyword
    const trailerIdx = text.indexOf('trailer', xrefMarker)
    if (trailerIdx === -1) return null
    trailerText = text.slice(trailerIdx + 7)
  } else {
    // Cross-reference stream — the object at xrefOffset contains /Encrypt etc.
    trailerText = text.slice(xrefOffset)
  }

  // Extract /Encrypt reference: /Encrypt N G R
  const encryptRef = trailerText.match(/\/Encrypt\s+(\d+)\s+(\d+)\s+R/)
  if (!encryptRef) return null
  const encryptObjNum = encryptRef[1]

  // Find the encrypt object body
  const objPattern = new RegExp(`${encryptObjNum}\\s+\\d+\\s+obj`)
  const objMatch = text.match(objPattern)
  if (!objMatch || objMatch.index === undefined) return null
  const objStart = objMatch.index + objMatch[0].length
  const objEnd = text.indexOf('endobj', objStart)
  if (objEnd === -1) return null
  const objText = text.slice(objStart, objEnd)

  // Extract /Filter — must be /Standard
  if (!/\/Filter\s*\/Standard/.test(objText)) return null

  const getInt = (key: string): number | null => {
    const m = objText.match(new RegExp(`\\/${key}\\s+(-?\\d+)`))
    return m ? parseInt(m[1], 10) : null
  }

  const V = getInt('V') ?? 1
  const R = getInt('R') ?? 2
  const P = getInt('P') ?? -4
  const rawKeyLen = getInt('Length')
  const keyLen = rawKeyLen ? rawKeyLen / 8 : V === 2 ? 16 : V >= 3 ? 32 : 5

  // Determine algorithm
  let algorithm: EncryptInfo['algorithm']
  if (V >= 5) {
    algorithm = 'aes-256'
  } else if (V === 4) {
    algorithm = 'aes-128'
  } else if (V === 2 || (V === 1 && R >= 3)) {
    algorithm = 'rc4-128'
  } else {
    algorithm = 'rc4-40'
  }

  // Extract /O and /U hex strings
  const extractHexStr = (key: string): Buffer | null => {
    // Try hex format: /O <hexhex>
    const hexM = objText.match(new RegExp(`\\/${key}\\s*<([0-9a-fA-F]+)>`))
    if (hexM) return Buffer.from(hexM[1], 'hex')
    // Try literal string: /O (...)  — handle escape sequences minimally
    const litM = objText.match(new RegExp(`\\/${key}\\s*\\(`))
    if (litM && litM.index !== undefined) {
      const start = litM.index + litM[0].length
      const bytes: number[] = []
      let i = start
      let depth = 1
      while (i < objText.length && depth > 0) {
        const ch = objText.charCodeAt(i)
        if (objText[i] === '\\') {
          i++
          const esc = objText[i]
          if (esc === 'n') bytes.push(0x0a)
          else if (esc === 'r') bytes.push(0x0d)
          else if (esc === 't') bytes.push(0x09)
          else if (esc === 'b') bytes.push(0x08)
          else if (esc === 'f') bytes.push(0x0c)
          else if (esc === '(') bytes.push(0x28)
          else if (esc === ')') bytes.push(0x29)
          else if (esc === '\\') bytes.push(0x5c)
          else if (/[0-7]/.test(esc)) {
            const oct = objText.slice(i, i + 3).match(/^([0-7]{1,3})/)?.[1] ?? esc
            bytes.push(parseInt(oct, 8))
            i += oct.length - 1
          } else bytes.push(esc.charCodeAt(0))
        } else if (objText[i] === '(') {
          depth++
          bytes.push(ch)
        } else if (objText[i] === ')') {
          depth--
          if (depth > 0) bytes.push(ch)
        } else {
          bytes.push(ch)
        }
        i++
      }
      return Buffer.from(bytes)
    }
    return null
  }

  const O = extractHexStr('O')
  const U = extractHexStr('U')
  if (!O || !U) return null

  // Extract /EncryptMetadata (default true)
  const emMatch = objText.match(/\/EncryptMetadata\s*\/?(false|true)/)
  const encryptMetadata = emMatch ? emMatch[1] !== 'false' : true

  // Extract file ID from trailer /ID array
  const idMatch = trailerText.match(/\/ID\s*\[<([0-9a-fA-F]+)>/)
  const fileId = idMatch ? Buffer.from(idMatch[1], 'hex') : Buffer.alloc(16)

  return { algorithm, V, R, keyLen, O, U, P, fileId, encryptMetadata }
}

// ---------- AES-128 object-level decryption (PDF §7.6.5) ----------

/**
 * Derive per-object AES-128 key from the file encryption key + object number + generation.
 */
export function deriveObjectKey(fileKey: Buffer, objNum: number, genNum: number, isAES: boolean): Buffer {
  const extra = Buffer.alloc(isAES ? 9 : 5)
  extra.writeUInt32LE(objNum & 0xffffffff, 0)
  extra[2] = (objNum >> 16) & 0xff
  extra[1] = (objNum >> 8) & 0xff
  extra[0] = objNum & 0xff
  extra[3] = genNum & 0xff
  extra[4] = (genNum >> 8) & 0xff
  if (isAES) {
    extra[5] = 0x73 // 's'
    extra[6] = 0x41 // 'A'
    extra[7] = 0x6c // 'l'
    extra[8] = 0x54 // 'T'
  }
  const keyLen = Math.min(fileKey.length + 5, 16)
  return crypto
    .createHash('md5')
    .update(fileKey)
    .update(extra)
    .digest()
    .subarray(0, keyLen)
}
