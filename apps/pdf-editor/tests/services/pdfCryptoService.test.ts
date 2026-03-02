// @feature:pdf-password @domain:pdf @backend
// @summary: Unit tests for PDFCryptoService — encrypt, decrypt, password verification

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { PDFCryptoService } from '@/lib/services/pdfCryptoService'

const fixturesDir = join(__dirname, '../fixtures')

const SAMPLE_PDF_BYTES = new Uint8Array(readFileSync(join(fixturesDir, 'sample.pdf')))
const RC4_128_PDF_BYTES = new Uint8Array(readFileSync(join(fixturesDir, 'rc4-128-encrypted.pdf')))
const AES_128_PDF_BYTES = new Uint8Array(readFileSync(join(fixturesDir, 'aes-128-encrypted.pdf')))

const createTestService = () => new PDFCryptoService()

describe('PDFCryptoService', () => {
  describe('isEncrypted', () => {
    it('should return false for an unencrypted PDF', () => {
      const service = createTestService()
      expect(service.isEncrypted(SAMPLE_PDF_BYTES)).toBe(false)
    })

    it('should return true for an RC4-128 encrypted PDF', () => {
      const service = createTestService()
      expect(service.isEncrypted(RC4_128_PDF_BYTES)).toBe(true)
    })

    it('should return true for an AES-128 encrypted PDF', () => {
      const service = createTestService()
      expect(service.isEncrypted(AES_128_PDF_BYTES)).toBe(true)
    })
  })

  describe('encryptPDF', () => {
    it('should encrypt a PDF and mark it as encrypted', async () => {
      const service = createTestService()
      const encrypted = await service.encryptPDF(SAMPLE_PDF_BYTES, 'test123')
      expect(service.isEncrypted(encrypted)).toBe(true)
    })

    it('should produce different bytes than the original', async () => {
      const service = createTestService()
      const encrypted = await service.encryptPDF(SAMPLE_PDF_BYTES, 'test123')
      expect(Buffer.from(encrypted).equals(Buffer.from(SAMPLE_PDF_BYTES))).toBe(false)
    })
  })

  describe('decryptPDF', () => {
    it('should encrypt then decrypt with the same password — result is not encrypted', async () => {
      const service = createTestService()
      const encrypted = await service.encryptPDF(SAMPLE_PDF_BYTES, 'test123')
      const decrypted = await service.decryptPDF(encrypted, 'test123')
      expect(service.isEncrypted(decrypted)).toBe(false)
    })

    it('should throw "Incorrect password" when decrypting with wrong password', async () => {
      const service = createTestService()
      const encrypted = await service.encryptPDF(SAMPLE_PDF_BYTES, 'correct')
      await expect(service.decryptPDF(encrypted, 'wrong')).rejects.toThrow('Incorrect password')
    })

    it('should decrypt an RC4-128 encrypted PDF (fixture) with correct password', async () => {
      const service = createTestService()
      const decrypted = await service.decryptPDF(RC4_128_PDF_BYTES, 'testpassword')
      expect(service.isEncrypted(decrypted)).toBe(false)
    })

    it('should throw when decrypting RC4-128 fixture with wrong password', async () => {
      const service = createTestService()
      await expect(
        service.decryptPDF(RC4_128_PDF_BYTES, 'wrongpassword')
      ).rejects.toThrow('Incorrect password')
    })

    it('should decrypt an AES-128 encrypted PDF (fixture) with correct password', async () => {
      const service = createTestService()
      const decrypted = await service.decryptPDF(AES_128_PDF_BYTES, 'testpassword')
      expect(service.isEncrypted(decrypted)).toBe(false)
    })

    it('should throw when decrypting AES-128 fixture with wrong password', async () => {
      const service = createTestService()
      await expect(
        service.decryptPDF(AES_128_PDF_BYTES, 'wrongpassword')
      ).rejects.toThrow('Incorrect password')
    })

    it('should return original bytes unchanged if PDF is not encrypted', async () => {
      const service = createTestService()
      const result = await service.decryptPDF(SAMPLE_PDF_BYTES, 'any')
      expect(Buffer.from(result).equals(Buffer.from(SAMPLE_PDF_BYTES))).toBe(true)
    })
  })
})
