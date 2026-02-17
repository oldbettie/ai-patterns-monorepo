'use client'
// @feature:dashboard @domain:documents @frontend
// @summary: Grid of document cards loaded from IndexedDB

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useIndexedDB } from '@/components/hooks/useIndexedDB'
import { DocumentCard } from '@/components/dashboard/DocumentCard'
import type { PDFDocument } from '@quick-pdfs/common'

export function DocumentGrid() {
  const t = useTranslations('pages.dashboard')
  const { getAllDocuments, deleteDocument } = useIndexedDB()
  const [documents, setDocuments] = useState<PDFDocument[]>([])

  const loadDocuments = async () => {
    const docs = await getAllDocuments()
    setDocuments(docs.slice().reverse())
  }

  useEffect(() => { loadDocuments() }, [])

  const handleDelete = async (id: string) => {
    await deleteDocument(id)
    await loadDocuments()
  }

  if (documents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">{t('subtitle')}</p>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {documents.map(doc => (
        <DocumentCard key={doc.id} document={doc} onDelete={handleDelete} />
      ))}
    </div>
  )
}
