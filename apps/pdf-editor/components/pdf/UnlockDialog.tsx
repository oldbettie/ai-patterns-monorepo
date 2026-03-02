'use client'
// @feature:pdf-password @domain:pdf @frontend
// @summary: Modal shown when opening a password-protected PDF

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface UnlockDialogProps {
  onUnlock: (password: string) => void
  onCancel: () => void
  error?: string | null
}

export function UnlockDialog({ onUnlock, onCancel, error }: UnlockDialogProps) {
  const t = useTranslations('pages.editor.password')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password) onUnlock(password)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-border">
        <h2 className="text-lg font-semibold mb-1 text-foreground">{t('unlockTitle')}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t('unlockBody')}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t('newPassword')}
            autoFocus
            className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {error && (
            <p className="text-sm text-destructive">{t('wrongPassword')}</p>
          )}

          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm rounded-md border border-border hover:bg-accent text-foreground transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={!password}
              className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {t('unlockButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
