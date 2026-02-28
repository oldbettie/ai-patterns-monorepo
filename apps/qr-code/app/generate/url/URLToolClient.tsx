'use client'
// @feature:qr-generator @domain:qr @frontend
// @summary: URL QR code tool page — collects URL and generates QR

import { useQRTool } from '@/components/hooks/useQRTool'
import { QRToolLayout } from '@/components/qr/QRToolLayout'
import { URLForm } from '@/components/qr/forms/URLForm'
import { formatURL } from '@/lib/qr/qrTypes'
import { useTranslations } from 'next-intl'

export function URLToolClient() {
  const t = useTranslations('pages.generate.tools.url')
  const { data, setData, qrRef, options, setOptions, saving, handleSave,
    handleLoad, entries, loading, deleteEntry, renameEntry } = useQRTool('url')

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
      downloadLabel="url-qr"
      placeholder={t('placeholder')}
    >
      <URLForm
        value={data}
        onChange={(formatted) => setData(formatURL(formatted))}
      />
    </QRToolLayout>
  )
}
