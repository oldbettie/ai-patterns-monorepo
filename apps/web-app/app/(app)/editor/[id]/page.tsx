// @feature:pdf-editor @domain:pdf @frontend
// @summary: PDF editor page — public, loads document from IndexedDB client-side

import { getTranslations } from 'next-intl/server'
import { PDFEditorShell } from '@/components/pdf/PDFEditorShell'

export async function generateMetadata() {
  const t = await getTranslations('pages.editor')
  return { title: t('title') }
}

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <PDFEditorShell documentId={id} />
}
