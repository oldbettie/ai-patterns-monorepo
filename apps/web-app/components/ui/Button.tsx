import React from 'react'
import Link from 'next/link'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type As = 'a' | 'button'

type CommonProps = {
  children: React.ReactNode
  className?: string
  variant?: ButtonVariant
}

type AnchorProps = CommonProps & {
  as?: 'a'
  href: string
  prefetch?: boolean
}

type NativeButtonProps = CommonProps & {
  as?: 'button'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

export type ButtonProps = AnchorProps | NativeButtonProps

function baseClasses(variant: ButtonVariant) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
  const styles =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-600/90 focus-visible:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400'
      : variant === 'secondary'
        ? 'bg-white text-neutral-900 hover:bg-neutral-50 border border-neutral-300 shadow-sm focus-visible:ring-neutral-300 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:border-neutral-800'
        : 'bg-transparent text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
  return `${base} ${styles}`
}

/**
 * Polymorphic Button with Link or native button rendering for accessibility and semantics.
 * - Button as anchor: <Button as="a" href="/path">...</Button>
 * - Default link helper: <Button href="/path">...</Button> (renders Next Link)
 * - Native button: <Button as="button" type="button">...</Button>
 */
export function Button(props: ButtonProps) {
  const variant = props.variant ?? 'primary'

  // Native button mode
  if (props.as === 'button') {
    const { as: _as, className, children, ...rest } = props as NativeButtonProps
    return (
      <button className={`${baseClasses(variant)} ${className ?? ''}`} {...rest}>
        {children}
      </button>
    )
  }

  // Link mode (default)
  const { className, children, href, prefetch, ...rest } = props as AnchorProps
  // Prefer Next.js Link for client-side nav when href provided
  return (
    <Link className={`${baseClasses(variant)} ${className ?? ''}`} href={href} prefetch={prefetch} {...(rest as any)}>
      {children}
    </Link>
  )
}

export default Button