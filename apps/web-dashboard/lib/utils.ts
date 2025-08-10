import { env } from '@/lib/env'
import ms from 'ms'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const timeAgo = (timestamp: Date, timeOnly?: boolean): string => {
  if (!timestamp) return 'never'
  return `${ms(Date.now() - new Date(timestamp).getTime())}${
    timeOnly ? '' : ' ago'
  }`
}

export function getBaseUrl() {
  // Prefer INTERNAL_URL on the server (e.g., inside Docker), fall back to NEXT_PUBLIC_URL
  if (typeof window === 'undefined') {
    return process.env.INTERNAL_URL || env.NEXT_PUBLIC_URL
  }
  return env.NEXT_PUBLIC_URL
}

// TODO: Make this fail gracefully
export async function secureFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${input}`, {
      ...init,
      headers: {
          ...(init?.headers || {}),
      },
  })

  return response.json()
}
