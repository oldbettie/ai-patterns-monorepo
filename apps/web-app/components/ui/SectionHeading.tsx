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
        <p className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-2xl md:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-neutral-700 dark:text-neutral-300 leading-relaxed">{subtitle}</p>
      ) : null}
    </div>
  )
}

export default SectionHeading