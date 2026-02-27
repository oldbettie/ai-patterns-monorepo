interface SectionHeaderProps {
  title: string
  subtitle?: string
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  )
}

