'use client'
// @feature:qr-generator @domain:qr @frontend
// @summary: SMS QR code tool — pre-fill a text message with phone and body

import { useState } from 'react'
import { useQRTool } from '@/components/hooks/useQRTool'
import { QRToolLayout } from '@/components/qr/QRToolLayout'
import { SMSForm } from '@/components/qr/forms/SMSForm'
import type { SMSFormData } from '@/components/qr/forms/SMSForm'
import { formatSMS } from '@/lib/qr/qrTypes'
import { useTranslations } from 'next-intl'

const DEFAULT_DATA: SMSFormData = {
  phone: '',
  message: '',
}

export function SMSToolClient() {
  const t = useTranslations('pages.generate.tools.sms')
  const [formData, setFormData] = useState<SMSFormData>(DEFAULT_DATA)
  const { data, setData, qrRef, options, setOptions, saving, handleSave,
    handleLoad, entries, loading, deleteEntry, renameEntry } = useQRTool('sms')

  const handleFormChange = (fd: SMSFormData) => {
    setFormData(fd)
    if (fd.phone) {
      setData(formatSMS(fd))
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
      onSave={() => handleSave(formData.phone || 'SMS')}
      entries={entries}
      historyLoading={loading}
      onLoad={handleLoad}
      onDelete={deleteEntry}
      onRename={renameEntry}
      downloadLabel="sms-qr"
      placeholder={t('placeholder')}
    >
      <SMSForm value={formData} onChange={handleFormChange} />
    </QRToolLayout>
  )
}
