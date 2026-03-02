'use client'
// @feature:pdf-password @domain:pdf @frontend
// @summary: Modal for setting, changing, or removing the export password

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface PasswordDialogProps {
  /** null = set new password; non-null = change or remove existing */
  currentPassword: string | null
  onSet: (password: string) => void
  onRemove: () => void
  onClose: () => void
}

export function PasswordDialog({ currentPassword, onSet, onRemove, onClose }: PasswordDialogProps) {
  const t = useTranslations('pages.editor.password')
  const isManage = currentPassword !== null

  const [existingPassword, setExistingPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ existing?: boolean; mismatch?: boolean }>({})

  const validateExisting = () => existingPassword === currentPassword

  const handleChange = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (isManage && !validateExisting()) errs.existing = true
    if (newPassword !== confirmPassword) errs.mismatch = true
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSet(newPassword)
  }

  const handleRemove = () => {
    if (!validateExisting()) { setErrors({ existing: true }); return }
    onRemove()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-border">
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          {isManage ? t('manageTitle') : t('setTitle')}
        </h2>

        <form onSubmit={handleChange} className="flex flex-col gap-3">
          {isManage && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">{t('currentPassword')}</label>
              <input
                type="password"
                value={existingPassword}
                onChange={e => { setExistingPassword(e.target.value); setErrors({}) }}
                autoFocus
                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.existing && (
                <p className="text-xs text-destructive">{t('wrongPassword')}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">{t('newPassword')}</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => { setNewPassword(e.target.value); setErrors(p => ({ ...p, mismatch: false })) }}
              autoFocus={!isManage}
              className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">{t('confirmPassword')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, mismatch: false })) }}
              className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.mismatch && (
              <p className="text-xs text-destructive">{t('mismatch')}</p>
            )}
          </div>

          <div className="flex justify-between items-center mt-1">
            {isManage && (
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10 transition-colors"
              >
                {t('removeButton')}
              </button>
            )}
            <div className={`flex gap-2 ${isManage ? '' : 'ml-auto'}`}>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-md border border-border hover:bg-accent text-foreground transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={!newPassword || !confirmPassword}
                className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isManage ? t('changeButton') : t('setButton')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
