"use client"

import Link from 'next/link'

interface SectionHeaderProps {
  title: string
  subtitle?: string
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">{title}</h1>
        {subtitle && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Home
        </Link>
      </div>
    </div>
  )
}

