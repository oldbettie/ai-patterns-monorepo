// @feature:toggle-switch @domain:ui @frontend
// @summary: Reusable toggle switch component with accessibility and smooth animations

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  id?: string
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  size = 'md',
  className,
  id
}: ToggleSwitchProps) {
  const [isChanging, setIsChanging] = useState(false)

  const handleToggle = async () => {
    if (disabled || isChanging) return
    
    setIsChanging(true)
    try {
      await onChange(!checked)
    } finally {
      // Reset loading state after a short delay for smooth UX
      setTimeout(() => setIsChanging(false), 300)
    }
  }

  const sizeClasses = {
    sm: {
      switch: 'h-4 w-7',
      thumb: 'h-3 w-3',
      translate: checked ? 'translate-x-3' : 'translate-x-0.5'
    },
    md: {
      switch: 'h-5 w-9',
      thumb: 'h-4 w-4',
      translate: checked ? 'translate-x-4' : 'translate-x-0.5'
    },
    lg: {
      switch: 'h-6 w-11',
      thumb: 'h-5 w-5',
      translate: checked ? 'translate-x-5' : 'translate-x-0.5'
    }
  }

  const currentSize = sizeClasses[size]

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Toggle Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-describedby={description ? `${id}-description` : undefined}
        disabled={disabled || isChanging}
        onClick={handleToggle}
        className={cn(
          // Base styles
          'relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900',
          
          // Size
          currentSize.switch,
          
          // Colors based on state
          checked
            ? 'bg-blue-600 dark:bg-blue-500'
            : 'bg-neutral-200 dark:bg-neutral-700',
          
          // Disabled state
          (disabled || isChanging) && 'opacity-50 cursor-not-allowed',
          
          // Loading state
          isChanging && 'animate-pulse'
        )}
      >
        <span
          className={cn(
            // Base thumb styles
            'pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out',
            
            // Size
            currentSize.thumb,
            
            // Position
            currentSize.translate
          )}
        />
      </button>

      {/* Label and Description */}
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label
              id={`${id}-label`}
              htmlFor={id}
              className="text-sm font-medium text-neutral-900 dark:text-neutral-100 cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <span
              id={`${id}-description`}
              className="text-xs text-neutral-500 dark:text-neutral-400"
            >
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  )
}