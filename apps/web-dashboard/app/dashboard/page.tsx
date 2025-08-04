'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/lib/auth/client'

type Device = {
  id: string
  name: string
  status: 'online' | 'offline'
  lastSeen: string
}

// VPN Profile for UI display (separate from database ProxyEndpoint)
type VpnProfile = {
  id: string
  name: string
  region: string
  latencyMs: number
  isActive: boolean
}

// Connection log for UI display
type ConnectionLog = {
  id: string
  device: string
  profile: string
  startedAt: string
  durationMin: number
  transferredMB: number
  status: 'ok' | 'dropped'
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  // Dummy data for dashboard view
  const [profiles, setProfiles] = useState<VpnProfile[]>([
    { id: 'p1', name: 'Privacy-First', region: 'US-East', latencyMs: 22, isActive: true },
    { id: 'p2', name: 'Gaming-Optimized', region: 'JP', latencyMs: 41, isActive: false },
    { id: 'p3', name: 'Balanced', region: 'EU-West', latencyMs: 88, isActive: false },
  ])
  const [devices] = useState<Device[]>([
    { id: 'd1', name: 'Mom iPhone', status: 'online', lastSeen: '2m ago' },
    { id: 'd2', name: 'Dad MacBook', status: 'offline', lastSeen: '1h ago' },
    { id: 'd3', name: 'Kids iPad', status: 'online', lastSeen: 'now' },
  ])
  const [logs] = useState<ConnectionLog[]>([
    { id: 'l1', device: 'Mom iPhone', profile: 'Privacy-First', startedAt: 'Today 09:12', durationMin: 42, transferredMB: 210, status: 'ok' },
    { id: 'l2', device: 'Kids iPad', profile: 'Privacy-First', startedAt: 'Today 08:47', durationMin: 88, transferredMB: 560, status: 'ok' },
    { id: 'l3', device: 'Dad MacBook', profile: 'Gaming-Optimized', startedAt: 'Yesterday 22:10', durationMin: 12, transferredMB: 90, status: 'dropped' },
  ])

  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login')
    }
  }, [session, isPending, router])

  function activateProfile(id: string) {
    setProfiles(prev =>
      prev.map(p => ({ ...p, isActive: p.id === id }))
    )
  }

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <main className="container-balanced py-8 md:py-12">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">Loading...</p>
          </div>
        </div>
      </main>
    )
  }

  // Don't render dashboard if not authenticated (redirect will happen via useEffect)
  if (!session) {
    return null
  }

  return (
    <main className="container-balanced py-8 md:py-20">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Dashboard</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Control your Family Privacy Proxy settings and monitor activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Home
          </Link>
          <button
            type="button"
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600/90"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      </div>

              {/* User card */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="col-span-1 rounded-xl border border-neutral-300 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Account</h2>
          <div className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
            {session?.user && (
              <div className="space-y-1">
                <p><span className="text-neutral-500">Name:</span> {session.user.name ?? '—'}</p>
                <p><span className="text-neutral-500">Email:</span> {session.user.email ?? '—'}</p>
                <p><span className="text-neutral-500">Member since:</span> {session.user.createdAt ? new Date(session.user.createdAt).toLocaleDateString() : '—'}</p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Active subscription
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active profile and quick actions */}
        <div className="col-span-1 rounded-xl border border-neutral-300 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Active Profile</h2>
          {profiles.find(p => p.isActive) ? (
            <div className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
              {(() => {
                const p = profiles.find(p => p.isActive)!
                return (
                  <div>
                    <p><span className="text-neutral-500">Name:</span> {p.name}</p>
                    <p><span className="text-neutral-500">Region:</span> {p.region}</p>
                    <p><span className="text-neutral-500">Latency:</span> {p.latencyMs}ms</p>
                  </div>
                )
              })()}
              <div className="mt-4 flex flex-wrap gap-2">
                {profiles.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => activateProfile(p.id)}
                    className={`rounded-md px-3 py-1.5 text-sm border hover-elevate ${
                      p.isActive
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-neutral-300 bg-white text-neutral-800 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                  Toggle Kill Switch
                </button>
                <button className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                  Toggle Ad Block
                </button>
                <button className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                  Rotate IP
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">No active profile</p>
          )}
        </div>

        {/* Usage placeholder */}
        <div className="col-span-1 rounded-xl border border-neutral-300 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Usage (24h)</h2>
          <div className="mt-4 h-28 w-full rounded-md bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900"></div>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Graph placeholder</p>
        </div>
      </section>

      {/* Devices */}
      <section className="mt-6 rounded-xl border border-neutral-300 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Devices</h2>
          <button className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
            Add device
          </button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-neutral-500 dark:text-neutral-400">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Last seen</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-neutral-700 dark:text-neutral-300">
              {devices.map(d => (
                <tr key={d.id} className="border-t border-neutral-200 dark:border-neutral-800">
                  <td className="py-2 pr-4">{d.name}</td>
                  <td className="py-2 pr-4">
                    <span className={`inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-xs ${
                      d.status === 'online'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${d.status === 'online' ? 'bg-emerald-500' : 'bg-neutral-400'}`}></span>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{d.lastSeen}</td>
                  <td className="py-2 pr-4">
                    <button className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent connections */}
      <section className="mt-6 rounded-xl border border-neutral-300 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
        <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Recent Connections</h2>
        <div className="mt-3 divide-y divide-neutral-200 dark:divide-neutral-800">
          {logs.map(l => (
            <div key={l.id} className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-neutral-700 dark:text-neutral-300">
                <span className="font-medium">{l.device}</span> via <span className="font-medium">{l.profile}</span> at {l.startedAt}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">{l.durationMin} min</span>
                <span className="text-neutral-500 dark:text-neutral-400">{l.transferredMB} MB</span>
                <span className={`inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-xs ${
                  l.status === 'ok'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {l.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}