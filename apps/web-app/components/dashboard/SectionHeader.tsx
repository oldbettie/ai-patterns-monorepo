"use client"

import Link from 'next/link'
import { AppRoutes } from '@/lib/config/featureToggles'

interface SectionHeaderProps {
  title: string
  subtitle?: string
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={AppRoutes.home}
          className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Home
        </Link>
      </div>
    </div>
  )
}

