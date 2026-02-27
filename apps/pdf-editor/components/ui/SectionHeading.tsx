import React from 'react'

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className = '',
}: {
  eyebrow?: string
  title: string | React.ReactNode
  subtitle?: string | React.ReactNode
  className?: string
}) {
  return (
    <div className={`mx-auto max-w-2xl text-center ${className}`}>
      {eyebrow ? (
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-muted-foreground leading-relaxed">{subtitle}</p>
      ) : null}
    </div>
  )
}

export default SectionHeading