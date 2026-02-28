'use client'
// @feature:qr-generator @domain:qr @frontend
// @summary: Plain text QR code tool — encode any text or note

import { useQRTool } from '@/components/hooks/useQRTool'
import { QRToolLayout } from '@/components/qr/QRToolLayout'
import { TextForm } from '@/components/qr/forms/TextForm'
import { formatText } from '@/lib/qr/qrTypes'
import { useTranslations } from 'next-intl'

export function TextToolClient() {
  const t = useTranslations('pages.generate.tools.text')
  const { data, setData, qrRef, options, setOptions, saving, handleSave,
    handleLoad, entries, loading, deleteEntry, renameEntry } = useQRTool('text')

  return (
    <QRToolLayout
      title={t('pageTitle')}
      description={t('pageDescription')}
      data={data}
      qrRef={qrRef}
      options={options}
      onOptionsChange={setOptions}
      saving={saving}
      onSave={() => handleSave(data.length > 40 ? data.slice(0, 40) + '…' : data)}
      entries={entries}
      historyLoading={loading}
      onLoad={handleLoad}
      onDelete={deleteEntry}
      onRename={renameEntry}
      downloadLabel="text-qr"
      placeholder={t('placeholder')}
    >
      <TextForm
        value={data}
        onChange={(formatted) => setData(formatText(formatted))}
      />
    </QRToolLayout>
  )
}
