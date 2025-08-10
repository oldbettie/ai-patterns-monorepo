// @feature:clipboard-encryption @domain:dashboard @frontend
// @summary: UI component to input encryption passphrase and manage lock/unlock state

'use client'

import { useState } from 'react'
import { useEncryptionKey } from '@/components/hooks/useEncryptionKey'
import { cn } from '@/lib/utils'

interface EncryptionKeyInputProps { onChange?: (hasKey: boolean) => void }

export function EncryptionKeyInput({ onChange }: EncryptionKeyInputProps) {
  const { hasKey, setPassphrase, clearKey, error } = useEncryptionKey()
  const [inputPassphrase, setInputPassphrase] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isUnlocked = hasKey

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!inputPassphrase) return
    setIsSubmitting(true)
    try {
      await setPassphrase(inputPassphrase)
      onChange?.(true)
      setInputPassphrase('')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleLock() {
    clearKey()
    onChange?.(false)
  }

  return (
    <div className="rounded-md border border-neutral-300 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          {isUnlocked ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 2c1.1 0 2 .9 2 2v1h1.5c.8 0 1.5.7 1.5 1.5v11c0 .8-.7 1.5-1.5 1.5H8.5c-.8 0-1.5-.7-1.5-1.5v-11C7 5.7 7.7 5 8.5 5H10V4c0-1.1.9-2 2-2Zm0 2c-.6 0-1 .4-1 1v1h2V5c0-.6-.4-1-1-1Z"/></svg>
              Key active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 2c1.1 0 2 .9 2 2v1h1.5C16.3 5 17 5.7 17 6.5v12c0 .8-.7 1.5-1.5 1.5H8.5C7.7 20 7 19.3 7 18.5v-12C7 5.7 7.7 5 8.5 5H10V4c0-1.1.9-2 2-2Zm0 1.5c-.8 0-1.5.7-1.5 1.5V7h3V5c0-.8-.7-1.5-1.5-1.5Z"/></svg>
              Enter key to decrypt
            </span>
          )}
        </div>
        {isUnlocked ? (
          <button onClick={handleLock} className="rounded-md border px-2 py-1 text-xs border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">Lock</button>
        ) : null}
      </div>

      {!isUnlocked && (
        <form onSubmit={handleSubmit} className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          <input
            type="password"
            placeholder="Enter passphrase"
            value={inputPassphrase}
            onChange={(e) => setInputPassphrase(e.target.value)}
            className={cn('w-full rounded-md border px-2 py-1 text-sm bg-white dark:bg-neutral-900', 'border-neutral-300 dark:border-neutral-800')}
            aria-label="Encryption passphrase"
          />
          <button
            type="submit"
            disabled={!inputPassphrase || isSubmitting}
            className={cn('rounded-md border px-2 py-1 text-sm',
              'border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100',
              'dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50'
            )}
          >
            {isSubmitting ? 'Unlocking...' : 'Unlock'}
          </button>
        </form>
      )}

      {error && (
        <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}
    </div>
  )
}

