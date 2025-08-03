'use client'

import { useEffect, useState } from 'react'

/**
 * Tailwind v4 class-based dark mode toggle.
 * - Adds/removes `dark` on the root html element
 * - Persists preference in localStorage under "theme"
 * - Respects system preference when no stored value
 */
export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')

    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const nextDark = stored ? stored === 'dark' : systemPrefersDark

    root.classList.toggle('dark', nextDark)
    setIsDark(nextDark)
    setMounted(true)
  }, [])

  const toggle = () => {
    const root = document.documentElement
    const next = !isDark
    setIsDark(next)
    root.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  // Placeholder to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="h-9 w-9 rounded-md border border-neutral-200 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
      />
    )
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="h-9 w-9 rounded-md border border-neutral-200 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      data-theme-state={isDark ? 'dark' : 'light'}
    >
      {/* Sun / Moon icons */}
      {isDark ? (
        <svg className="mx-auto h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg className="mx-auto h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )}
    </button>
  )
}