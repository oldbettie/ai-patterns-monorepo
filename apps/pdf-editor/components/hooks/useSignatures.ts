'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: Hook managing stored signatures, image cache, placement logic, and modal state

import { useState, useEffect, useCallback } from 'react'
import { useIndexedDB } from '@/components/hooks/useIndexedDB'
import type { usePDFEditor } from '@/components/hooks/usePDFEditor'
import type { StoredSignature } from '@quick-pdfs/common'

type Editor = ReturnType<typeof usePDFEditor>

export function useSignatures(editor: Editor) {
  const { saveSignature, getSignature, getAllSignatures, deleteSignature } = useIndexedDB()

  const [storedSignatures, setStoredSignatures] = useState<StoredSignature[]>([])
  const [signatureImages, setSignatureImages] = useState<Map<string, string>>(new Map())
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [editingSignatureElementId, setEditingSignatureElementId] = useState<string | null>(null)
  const [editingStoredSignatureId, setEditingStoredSignatureId] = useState<string | null>(null)

  // Load stored signatures on mount
  useEffect(() => {
    const load = async () => {
      const sigs = await getAllSignatures()
      setStoredSignatures(sigs.sort((a, b) => b.createdAt - a.createdAt))
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load signature images for placed signatures not yet in cache
  useEffect(() => {
    const loadImages = async () => {
      let missingIds: string[] = []

      setSignatureImages(prevImages => {
        missingIds = editor.signatureElements
          .map(sig => sig.signatureId)
          .filter(id => !prevImages.has(id))
        return prevImages
      })

      if (missingIds.length === 0) return

      const results = await Promise.all(
        missingIds.map(async id => {
          const stored = await getSignature(id)
          return stored ? { id, imageData: stored.imageData } : null
        })
      )

      setSignatureImages(currentImages => {
        const newImages = new Map(currentImages)
        let changed = false
        for (const result of results) {
          if (result && !newImages.has(result.id)) {
            newImages.set(result.id, result.imageData)
            changed = true
          }
        }
        return changed ? newImages : currentImages
      })
    }
    loadImages()
  }, [editor.signatureElements, getSignature])

  // Place the most recent stored signature at a canvas position, or open modal if none exist
  const handlePlaceAt = useCallback((x: number, y: number, pageIndex: number) => {
    if (storedSignatures.length > 0) {
      const last = storedSignatures[0]
      const placementId = crypto.randomUUID()
      setSignatureImages(prev => new Map(prev).set(placementId, last.imageData))
      editor.addSignatureElement(x, y, 120, 60, pageIndex, placementId)
    } else {
      setShowSignatureModal(true)
    }
  }, [storedSignatures, editor])

  const handleSaveSignature = useCallback(async (newSig: StoredSignature) => {
    if (editingSignatureElementId !== null) {
      // Edit a specific canvas element — only update its in-memory image, no storage changes
      const el = editor.signatureElements.find(e => e.id === editingSignatureElementId)
      if (el) {
        setSignatureImages(prev => new Map(prev).set(el.signatureId, newSig.imageData))
      }
      setEditingSignatureElementId(null)
    } else if (editingStoredSignatureId !== null) {
      // Edit the toolbar template — delete old, save new; canvas elements are untouched
      await deleteSignature(editingStoredSignatureId)
      await saveSignature(newSig)
      setStoredSignatures(prev => [newSig, ...prev.filter(s => s.id !== editingStoredSignatureId)])
      setEditingStoredSignatureId(null)
    } else {
      // New signature drawn — save as template, place a separate copy on canvas
      await saveSignature(newSig)
      setStoredSignatures(prev => [newSig, ...prev])
      const placementId = crypto.randomUUID()
      setSignatureImages(prev => new Map(prev).set(placementId, newSig.imageData))
      editor.addSignatureElement(100, 100, 120, 60, editor.activePage, placementId)
    }
    setShowSignatureModal(false)
  }, [editingSignatureElementId, editingStoredSignatureId, editor, saveSignature, deleteSignature])

  const handleEditSignature = useCallback((elementId: string) => {
    setEditingSignatureElementId(elementId)
    setShowSignatureModal(true)
  }, [])

  const handleEditStoredSignature = useCallback((signatureId: string) => {
    setEditingStoredSignatureId(signatureId)
    setShowSignatureModal(true)
  }, [])

  const handleRemoveStoredSignature = useCallback(async (signatureId: string) => {
    await deleteSignature(signatureId)
    setStoredSignatures(prev => prev.filter(s => s.id !== signatureId))
  }, [deleteSignature])

  const handleDeleteSignature = useCallback((elementId: string, signatureId: string) => {
    editor.removeSignatureElement(elementId)
    setSignatureImages(prev => { const m = new Map(prev); m.delete(signatureId); return m })
  }, [editor])

  const openDrawModal = useCallback(() => setShowSignatureModal(true), [])

  const closeModal = useCallback(() => {
    setShowSignatureModal(false)
    setEditingSignatureElementId(null)
    setEditingStoredSignatureId(null)
  }, [])

  return {
    storedSignatures,
    signatureImages,
    showSignatureModal,
    handlePlaceAt,
    handleSaveSignature,
    handleEditSignature,
    handleEditStoredSignature,
    handleRemoveStoredSignature,
    handleDeleteSignature,
    openDrawModal,
    closeModal,
  }
}
