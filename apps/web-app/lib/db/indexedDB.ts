// @feature:indexeddb @domain:storage @frontend
// @summary: IndexedDB wrapper using idb for local document, signature, and app-state storage (client-safe)

import { openDB, type IDBPDatabase } from 'idb'
import type { PDFDocument, StoredSignature, AppState } from '@quick-pdfs/common'

const DB_NAME = 'quick-pdfs'
const DB_VERSION = 1

type QuickPDFsDB = IDBPDatabase<{
  documents: {
    key: string
    value: PDFDocument
    indexes: { updatedAt: number }
  }
  signatures: {
    key: string
    value: StoredSignature
    indexes: { createdAt: number }
  }
  'app-state': {
    key: string
    value: AppState
  }
}>

let dbPromise: Promise<QuickPDFsDB> | null = null

function getDB(): Promise<QuickPDFsDB> {
  if (!dbPromise) {
    dbPromise = openDB<{
      documents: { key: string; value: PDFDocument; indexes: { updatedAt: number } }
      signatures: { key: string; value: StoredSignature; indexes: { createdAt: number } }
      'app-state': { key: string; value: AppState }
    }>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' })
          docStore.createIndex('updatedAt', 'updatedAt')
        }
        if (!db.objectStoreNames.contains('signatures')) {
          const sigStore = db.createObjectStore('signatures', { keyPath: 'id' })
          sigStore.createIndex('createdAt', 'createdAt')
        }
        if (!db.objectStoreNames.contains('app-state')) {
          db.createObjectStore('app-state', { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

// Documents
export async function getDocument(id: string): Promise<PDFDocument | undefined> {
  const db = await getDB()
  return db.get('documents', id)
}

export async function getAllDocuments(): Promise<PDFDocument[]> {
  const db = await getDB()
  return db.getAllFromIndex('documents', 'updatedAt')
}

export async function saveDocument(doc: PDFDocument): Promise<void> {
  const db = await getDB()
  await db.put('documents', doc)
}

export async function deleteDocument(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('documents', id)
}

// Signatures
export async function getSignature(id: string): Promise<StoredSignature | undefined> {
  const db = await getDB()
  return db.get('signatures', id)
}

export async function getAllSignatures(): Promise<StoredSignature[]> {
  const db = await getDB()
  return db.getAllFromIndex('signatures', 'createdAt')
}

export async function saveSignature(sig: StoredSignature): Promise<void> {
  const db = await getDB()
  await db.put('signatures', sig)
}

export async function deleteSignature(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('signatures', id)
}

// App state (singleton)
export async function getAppState(): Promise<AppState | undefined> {
  const db = await getDB()
  return db.get('app-state', 'singleton')
}

export async function saveAppState(state: Partial<AppState>): Promise<void> {
  const db = await getDB()
  const existing = await db.get('app-state', 'singleton')
  await db.put('app-state', {
    id: 'singleton',
    hasSeenWelcome: false,
    donorStatus: false,
    donorStatusSyncedAt: null,
    ...existing,
    ...state,
  })
}
