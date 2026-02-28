'use client'
// @feature:qr-generator @domain:qr @frontend
// @summary: vCard QR code tool — encode contact info for instant phone import

import { useState } from 'react'
import { useQRTool } from '@/components/hooks/useQRTool'
import { QRToolLayout } from '@/components/qr/QRToolLayout'
import { VCardForm } from '@/components/qr/forms/VCardForm'
import type { VCardFormData } from '@/components/qr/forms/VCardForm'
import { formatVCard } from '@/lib/qr/qrTypes'
import { useTranslations } from 'next-intl'

const DEFAULT_DATA: VCardFormData = {
  name: '',
  phone: '',
  email: '',
  org: '',
  title: '',
  url: '',
  address: '',
}

export function VCardToolClient() {
  const t = useTranslations('pages.generate.tools.vcard')
  const [formData, setFormData] = useState<VCardFormData>(DEFAULT_DATA)
  const { data, setData, qrRef, options, setOptions, saving, handleSave,
    handleLoad, entries, loading, deleteEntry, renameEntry } = useQRTool('vcard')

  const handleFormChange = (fd: VCardFormData) => {
    setFormData(fd)
    if (fd.name) {
      setData(formatVCard(fd))
    } else {
      setData('')
    }
  }

  return (
    <QRToolLayout
      title={t('pageTitle')}
      description={t('pageDescription')}
      data={data}
      qrRef={qrRef}
      options={options}
      onOptionsChange={setOptions}
      saving={saving}
      onSave={() => handleSave(formData.name || 'Contact')}
      entries={entries}
      historyLoading={loading}
      onLoad={handleLoad}
      onDelete={deleteEntry}
      onRename={renameEntry}
      downloadLabel="contact-qr"
      placeholder={t('placeholder')}
    >
      <VCardForm value={formData} onChange={handleFormChange} />
    </QRToolLayout>
  )
}
