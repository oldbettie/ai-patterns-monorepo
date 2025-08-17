import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardClient } from '@/components/dashboard-client'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  const userData = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    createdAt: new Date(session.user.createdAt ?? Date.now()).toISOString(),
  }

  return (
    <DashboardClient 
      user={userData}
    />
  )
}