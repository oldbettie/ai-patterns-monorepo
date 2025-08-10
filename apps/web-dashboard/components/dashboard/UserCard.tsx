"use client"

import type { User } from './types'

interface UserCardProps {
  user: User
  subscriptionLabel: string
  memberSinceLabel: string
}

export function UserCard({ user, subscriptionLabel, memberSinceLabel }: UserCardProps) {
  return (
    <div className="col-span-1 rounded-xl border border-neutral-300 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
      <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Account</h2>
      <div className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
        <div className="space-y-1">
          <p><span className="text-neutral-500">Name:</span> {user.name ?? '—'}</p>
          <p><span className="text-neutral-500">Email:</span> {user.email ?? '—'}</p>
          <p><span className="text-neutral-500">{memberSinceLabel}:</span> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {subscriptionLabel}
          </div>
        </div>
      </div>
    </div>
  )
}

