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
    'inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
  const styles =
    variant === 'primary'
      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow'
      : variant === 'secondary'
        ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm'
        : 'hover:bg-accent hover:text-accent-foreground'
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