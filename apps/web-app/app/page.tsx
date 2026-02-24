import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth/auth'
import { LandingPage } from '@/components/landing/LandingPage'

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect('/dashboard')
  return <LandingPage />
}
