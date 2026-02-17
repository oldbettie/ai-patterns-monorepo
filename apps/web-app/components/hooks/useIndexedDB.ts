'use client'
// @feature:indexeddb @domain:storage @frontend
// @summary: React hook providing CRUD operations for IndexedDB documents and signatures

import { useCallback } from 'react'
import {
  getDocument,
  getAllDocuments,
  saveDocument,
  deleteDocument,
  getSignature,
  getAllSignatures,
  saveSignature,
  deleteSignature,
  getAppState,
  saveAppState,
} from '@/lib/db/indexedDB'
import type { PDFDocument, StoredSignature, AppState } from '@quick-pdfs/common'

export function useIndexedDB() {
  // Documents
  const fetchDocument = useCallback((id: string) => getDocument(id), [])
  const fetchAllDocuments = useCallback(() => getAllDocuments(), [])
  const persistDocument = useCallback((doc: PDFDocument) => saveDocument(doc), [])
  const removeDocument = useCallback((id: string) => deleteDocument(id), [])

  // Signatures
  const fetchSignature = useCallback((id: string) => getSignature(id), [])
  const fetchAllSignatures = useCallback(() => getAllSignatures(), [])
  const persistSignature = useCallback((sig: StoredSignature) => saveSignature(sig), [])
  const removeSignature = useCallback((id: string) => deleteSignature(id), [])

  // App state
  const fetchAppState = useCallback(() => getAppState(), [])
  const persistAppState = useCallback((state: Partial<AppState>) => saveAppState(state), [])

  return {
    getDocument: fetchDocument,
    getAllDocuments: fetchAllDocuments,
    saveDocument: persistDocument,
    deleteDocument: removeDocument,
    getSignature: fetchSignature,
    getAllSignatures: fetchAllSignatures,
    saveSignature: persistSignature,
    deleteSignature: removeSignature,
    getAppState: fetchAppState,
    saveAppState: persistAppState,
  }
}
