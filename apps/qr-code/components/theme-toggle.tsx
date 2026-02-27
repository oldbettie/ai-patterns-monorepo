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
    // Check initial state from classList if available, or storage
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    
    // Determine if we should be dark
    const shouldBeDark = stored ? stored === 'dark' : systemPrefersDark
    
    // Sync state
    setIsDark(shouldBeDark)
    root.classList.toggle('dark', shouldBeDark)
    
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
      <div className="h-9 w-9 rounded-md border border-border bg-background" />
    )
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="h-9 w-9 flex items-center justify-center rounded-md border border-border bg-background text-foreground shadow-sm hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      data-theme-state={isDark ? 'dark' : 'light'}
    >
      {/* Sun / Moon icons */}
      {isDark ? (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      )}
    </button>
  )
}
