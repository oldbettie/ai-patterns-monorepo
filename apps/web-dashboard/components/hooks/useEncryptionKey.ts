// @feature:clipboard-encryption @domain:security @frontend
// @summary: React hook to manage encryption key passphrase and derived CryptoKey with user-specific salt

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { deriveAesGcmKeyFromPassphrase } from '@/lib/crypto/encryption-manager'
import { useUser } from '@/lib/auth/client'

const LOCAL_STORAGE_KEY = 'clipboard-encryption-key'

export interface UseEncryptionKey {
  passphrase: string | null
  hasKey: boolean
  getKey: () => Promise<CryptoKey>
  setPassphrase: (passphrase: string) => Promise<void>
  clearKey: () => void
  isReady: boolean
  error: string | null
}

export function useEncryptionKey(): UseEncryptionKey {
  const [passphrase, setPassphraseState] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const keyCacheRef = useRef<CryptoKey | null>(null)
  const { user } = useUser()

  // On mount, restore from localStorage
  useEffect(() => {
    try {
      const storedPassphrase = localStorage.getItem(LOCAL_STORAGE_KEY)
      setPassphraseState(storedPassphrase)
      setIsReady(true)
    } catch (e) {
      setIsReady(true)
    }
  }, [])

  const setPassphrase = useCallback(async (newPassphrase: string) => {
    setError(null)
    try {
      setPassphraseState(newPassphrase)
      localStorage.setItem(LOCAL_STORAGE_KEY, newPassphrase)
      // Clear cached key since passphrase changed
      keyCacheRef.current = null
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to derive key'
      setError(message)
      setPassphraseState(null)
    }
  }, [])

  const getKey = useCallback(async (): Promise<CryptoKey> => {
    console.log('🔑 getKey called - user:', user?.id, 'passphrase:', !!passphrase)
    
    if (!user?.id) {
      console.error('❌ User not authenticated:', user)
      throw new Error('User not authenticated')
    }
    if (!passphrase) {
      console.error('❌ Passphrase not set')
      throw new Error('Passphrase not set')
    }
    
    // Return cached key if available
    if (keyCacheRef.current) {
      console.log('✅ Using cached key')
      return keyCacheRef.current
    }
    
    console.log('🔄 Deriving new key with userID:', user.id)
    // Derive new key with user ID
    const key = await deriveAesGcmKeyFromPassphrase(passphrase, { userID: user.id })
    keyCacheRef.current = key
    console.log('✅ Key derived and cached')
    return key
  }, [passphrase, user?.id])

  const clearKey = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    } catch {}
    setPassphraseState(null) 
    keyCacheRef.current = null
  }, [])

  return useMemo(() => ({
    passphrase,
    hasKey: !!passphrase,
    getKey,
    setPassphrase,
    clearKey,
    isReady,
    error,
  }), [passphrase, getKey, setPassphrase, clearKey, isReady, error])
}

