'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: Context that lets PDFEditorShell register an export function accessible from the global layout header

import { createContext, useContext, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'

interface EditorActionsContextValue {
  exportFn: (() => Promise<void>) | null
  setExportFn: (fn: () => Promise<void>) => void
  clearExportFn: () => void
}

const EditorActionsContext = createContext<EditorActionsContextValue>({
  exportFn: null,
  setExportFn: () => {},
  clearExportFn: () => {},
})

export function EditorActionsProvider({ children }: { children: React.ReactNode }) {
  const [exportFn, setExportFnState] = useState<(() => Promise<void>) | null>(null)

  const setExportFn = useCallback((fn: () => Promise<void>) => {
    setExportFnState(() => fn)
  }, [])

  const clearExportFn = useCallback(() => {
    setExportFnState(null)
  }, [])

  return (
    <EditorActionsContext.Provider value={{ exportFn, setExportFn, clearExportFn }}>
      {children}
    </EditorActionsContext.Provider>
  )
}

export function useEditorActions() {
  return useContext(EditorActionsContext)
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
