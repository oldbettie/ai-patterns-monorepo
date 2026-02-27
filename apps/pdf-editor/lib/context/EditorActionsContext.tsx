'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: Context that lets PDFEditorShell register an export function and document title accessible from the global layout header

import { createContext, useContext, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'

interface EditorActionsContextValue {
  exportFn: (() => Promise<void>) | null
  setExportFn: (fn: () => Promise<void>) => void
  clearExportFn: () => void
  editorTitle: string | null
  setEditorTitle: (title: string) => void
  clearEditorTitle: () => void
}

const EditorActionsContext = createContext<EditorActionsContextValue>({
  exportFn: null,
  setExportFn: () => {},
  clearExportFn: () => {},
  editorTitle: null,
  setEditorTitle: () => {},
  clearEditorTitle: () => {},
})

export function EditorActionsProvider({ children }: { children: React.ReactNode }) {
  const [exportFn, setExportFnState] = useState<(() => Promise<void>) | null>(null)
  const [editorTitle, setEditorTitleState] = useState<string | null>(null)

  const setExportFn = useCallback((fn: () => Promise<void>) => {
    setExportFnState(() => fn)
  }, [])

  const clearExportFn = useCallback(() => {
    setExportFnState(null)
  }, [])

  const setEditorTitle = useCallback((title: string) => {
    setEditorTitleState(title)
  }, [])

  const clearEditorTitle = useCallback(() => {
    setEditorTitleState(null)
  }, [])

  return (
    <EditorActionsContext.Provider value={{ exportFn, setExportFn, clearExportFn, editorTitle, setEditorTitle, clearEditorTitle }}>
      {children}
    </EditorActionsContext.Provider>
  )
}

export function useEditorActions() {
  return useContext(EditorActionsContext)
}

export function EditorTitleSlot() {
  const { editorTitle } = useEditorActions()
  if (!editorTitle) return null
  return (
    <span className="text-sm font-medium text-foreground truncate max-w-[300px]" title={editorTitle}>
      {editorTitle}
    </span>
  )
}

export function ExportButtonSlot() {
  const { exportFn } = useEditorActions()
  const [exporting, setExporting] = useState(false)
  const t = useTranslations('pages.editor')

  if (!exportFn) return null

  const handleClick = async () => {
    setExporting(true)
    try {
      await exportFn()
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export PDF: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setExporting(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={exporting}
      className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {exporting ? t('export.generating') : t('download')}
    </button>
  )
}
