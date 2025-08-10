// @feature:clipboard-encryption @domain:security @frontend
// @summary: Client-side encryption manager compatible with Go AES-256-GCM implementation

'use client'

// Crypto utilities for browser encryption

/**
 * This module implements AES-256-GCM encryption/decryption compatible with the Go agent
 * implementation in apps/clipboard-agent/pkg/encryption/manager.go
 *
 * - Algorithm: AES-256-GCM
 * - Nonce (IV): 12 bytes
 * - Key derivation: PBKDF2 with SHA-256, 100,000 iterations
 * - Salt: First 16 bytes of SHA-256("ap-user-salt-v2:" + userID)
 * - Ciphertext format: base64(nonce || encryptedData)
 * 
 * Fallback: Uses crypto-js when crypto.subtle is unavailable (insecure contexts)
 */

const NONCE_SIZE_BYTES = 12
const PBKDF2_ITERATIONS = 100_000
const KEY_LENGTH_BITS = 256

// Text helpers
const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

// Check if crypto.subtle is available (secure context)
function isSecureContext(): boolean {
  return typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' && 
         typeof crypto.subtle.importKey === 'function'
}

// Check if we're on localhost (safe for development)
function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false
  const hostname = window.location.hostname
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

// Check if we should show the HTTP warning
function shouldShowHttpWarning(): boolean {
  if (typeof window === 'undefined') return false
  return !isSecureContext() && !isLocalhost()
}

export type SupportedAlgorithm = 'AES-256-GCM' | 'none'

export interface DeriveKeyOptions { 
  iterations?: number
  userID?: string
}


function concatUint8Arrays(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length)
  out.set(a, 0)
  out.set(b, a.length)
  return out
}

function base64ToBytes(base64: string): Uint8Array {
  // atob/btoa work with ASCII strings, so convert to bytes
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// Seed prefix used for user-specific salt derivation (must match Go implementation)
const SALT_SEED_PREFIX = 'ap-user-salt-v2:'

// Custom error for insecure context
export class InsecureContextError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InsecureContextError'
  }
}

export async function deriveAesGcmKeyFromPassphrase(
  passphrase: string,
  options?: DeriveKeyOptions,
): Promise<CryptoKey> {
  if (!passphrase) throw new Error('Passphrase required')
  if (!options?.userID) throw new Error('User ID required for encryption')
  
  const iterations = options?.iterations ?? PBKDF2_ITERATIONS
  
  if (isSecureContext()) {
    // Use native crypto.subtle (secure context)
    const passphraseBytes = textEncoder.encode(passphrase)
    const baseKey = await crypto.subtle.importKey('raw', passphraseBytes, { name: 'PBKDF2' }, false, ['deriveKey'])
    
    // Derive user-specific salt as first 16 bytes of SHA-256(SALT_SEED_PREFIX + userID) to match Go
    const seedBytes = textEncoder.encode(SALT_SEED_PREFIX + options.userID)
    const seedHash = await crypto.subtle.digest('SHA-256', seedBytes)
    const fullHash = new Uint8Array(seedHash)
    const salt = fullHash.slice(0, 16)
    
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      baseKey,
      { name: 'AES-GCM', length: KEY_LENGTH_BITS },
      false,
      ['encrypt', 'decrypt'],
    )
    return key
      } else {
      // Throw error for insecure context (not localhost)
      throw new InsecureContextError(
        'Encryption requires a secure context (HTTPS or localhost). ' +
        'Please access this dashboard via localhost or enable HTTPS.'
      )
    }
}

// Export the context check functions for use in components
export { isSecureContext, shouldShowHttpWarning }

export async function decryptBase64AesGcm(
  base64CiphertextWithNonce: string,
  key: CryptoKey,
): Promise<string> {
  // Check for secure context
  if (!isSecureContext()) {
    throw new InsecureContextError(
      'Decryption requires a secure context (HTTPS or localhost). ' +
      'Please access this dashboard via localhost or enable HTTPS.'
    )
  }
  
  const ciphertext = base64ToBytes(base64CiphertextWithNonce)
  if (ciphertext.length <= NONCE_SIZE_BYTES) {
    throw new Error('Ciphertext too short')
  }
  const nonce = ciphertext.slice(0, NONCE_SIZE_BYTES)
  const encrypted = ciphertext.slice(NONCE_SIZE_BYTES)

  const plaintextBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: nonce },
    key,
    encrypted,
  )
  return textDecoder.decode(plaintextBuffer)
}

export async function encryptToBase64AesGcm(
  plaintext: string,
  key: CryptoKey,
): Promise<string> {
  // Check for secure context
  if (!isSecureContext()) {
    throw new InsecureContextError(
      'Encryption requires a secure context (HTTPS or localhost). ' +
      'Please access this dashboard via localhost or enable HTTPS.'
    )
  }
  
  // Generate 12-byte nonce
  const nonce = crypto.getRandomValues(new Uint8Array(NONCE_SIZE_BYTES))
  const plaintextBytes = textEncoder.encode(plaintext)
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    key,
    plaintextBytes,
  )
  const encryptedBytes = new Uint8Array(encryptedBuffer)
  const combined = concatUint8Arrays(nonce, encryptedBytes)
  return bytesToBase64(combined)
}

export function isSupportedAlgorithm(algo?: string | null): algo is SupportedAlgorithm {
  return algo === 'AES-256-GCM' || algo === 'none' || algo === undefined || algo === null
}

