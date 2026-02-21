'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: Hook managing PDF editor state including text and signature elements

import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { TextElement, SignatureData } from '@quick-pdfs/common'

export interface PDFEditorState {
  textElements: TextElement[]
  signatureElements: SignatureData[]
  activePage: number
  totalPages: number
  pdfBytes: Uint8Array | null
  isLoading: boolean
}

export function usePDFEditor() {
  const [state, setState] = useState<PDFEditorState>({
    textElements: [],
    signatureElements: [],
    activePage: 0,
    totalPages: 0,
    pdfBytes: null,
    isLoading: false,
  })

  const setPdfBytes = useCallback((bytes: Uint8Array, pageCount: number) => {
    setState(prev => ({ ...prev, pdfBytes: bytes, totalPages: pageCount, isLoading: false }))
  }, [])

  const setActivePage = useCallback((page: number) => {
    setState(prev => ({ ...prev, activePage: page }))
  }, [])

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }))
  }, [])

  const addTextElement = useCallback((
    x: number,
    y: number,
    pageIndex: number,
    options?: Partial<Omit<TextElement, 'id' | 'x' | 'y' | 'pageIndex'>>
  ) => {
    const element: TextElement = {
      id: uuidv4(),
      pageIndex,
      x,
      y,
      text: options?.text ?? 'Type here...',
      fontFamily: options?.fontFamily ?? 'Helvetica',
      fontSize: options?.fontSize ?? 14,
      color: options?.color ?? '#000000',
    }
    setState(prev => ({ ...prev, textElements: [...prev.textElements, element] }))
    return element.id
  }, [])

  const updateTextElement = useCallback((id: string, updates: Partial<TextElement>) => {
    setState(prev => ({
      ...prev,
      textElements: prev.textElements.map(el => el.id === id ? { ...el, ...updates } : el),
    }))
  }, [])

  const removeTextElement = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      textElements: prev.textElements.filter(el => el.id !== id),
    }))
  }, [])

  const addSignatureElement = useCallback((
    x: number,
    y: number,
    width: number,
    height: number,
    pageIndex: number,
    signatureId: string
  ) => {
    const element: SignatureData = {
      id: uuidv4(),
      pageIndex,
      x,
      y,
      width,
      height,
      signatureId,
    }
    setState(prev => ({ ...prev, signatureElements: [...prev.signatureElements, element] }))
    return element.id
  }, [])

  const updateSignatureElement = useCallback((id: string, updates: Partial<SignatureData>) => {
    setState(prev => ({
      ...prev,
      signatureElements: prev.signatureElements.map(el => el.id === id ? { ...el, ...updates } : el),
    }))
  }, [])

  const removeSignatureElement = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      signatureElements: prev.signatureElements.filter(el => el.id !== id),
    }))
  }, [])

  const removeSignatureElementsBySignatureId = useCallback((signatureId: string) => {
    setState(prev => ({
      ...prev,
      signatureElements: prev.signatureElements.filter(el => el.signatureId !== signatureId),
    }))
  }, [])

  return {
    ...state,
    setPdfBytes,
    setActivePage,
    setLoading,
    addTextElement,
    updateTextElement,
    removeTextElement,
    addSignatureElement,
    updateSignatureElement,
    removeSignatureElement,
    removeSignatureElementsBySignatureId,
  }
}
