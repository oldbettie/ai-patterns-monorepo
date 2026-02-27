'use client'
// @feature:qr-generator @domain:qr @frontend
// @summary: IndexedDB CRUD hook for QR code history entries

import { useState, useEffect, useCallback } from 'react'
import { openDB } from 'idb'
import type { QRHistoryEntry } from '@/lib/qr/qrHistoryTypes'

const DB_NAME = 'qr-code-app'
const STORE_NAME = 'qr-history'
const DB_VERSION = 1

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    },
  })
}

export function useQRHistory() {
  const [entries, setEntries] = useState<QRHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  const loadEntries = useCallback(async () => {
    try {
      const db = await getDB()
      const all = await db.getAll(STORE_NAME)
      // Sort newest first
      all.sort((a, b) => b.createdAt - a.createdAt)
      setEntries(all)
    } catch (err) {
      console.error('useQRHistory: failed to load entries', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const saveEntry = useCallback(async (entry: QRHistoryEntry) => {
    try {
      const db = await getDB()
      await db.put(STORE_NAME, entry)
      setEntries((prev) => {
        const without = prev.filter((e) => e.id !== entry.id)
        return [entry, ...without]
      })
    } catch (err) {
      console.error('useQRHistory: failed to save entry', err)
    }
  }, [])

  const deleteEntry = useCallback(async (id: string) => {
    try {
      const db = await getDB()
      await db.delete(STORE_NAME, id)
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      console.error('useQRHistory: failed to delete entry', err)
    }
  }, [])

  const renameEntry = useCallback(async (id: string, label: string) => {
    try {
      const db = await getDB()
      const entry = await db.get(STORE_NAME, id)
      if (!entry) return
      const updated = { ...entry, label }
      await db.put(STORE_NAME, updated)
      setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)))
    } catch (err) {
      console.error('useQRHistory: failed to rename entry', err)
    }
  }, [])

  return { entries, saveEntry, deleteEntry, renameEntry, loading }
}
