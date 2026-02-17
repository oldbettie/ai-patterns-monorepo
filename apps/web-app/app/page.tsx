import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth/auth'
import { AppRoutes } from '@/lib/config/featureToggles'
import { LandingPage } from '@/components/landing/LandingPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free PDF Editor — No Signup, No Subscription, No Catch',
  description: 'Edit and sign PDFs for free, right in your browser. Add text, draw signatures, and download instantly. No signup required, no subscription, no files uploaded to our servers. Ever.',
  openGraph: {
    title: 'Free PDF Editor — No Signup, No Subscription, No Catch',
    description: 'Edit and sign PDFs for free, right in your browser. Add text, draw signatures, and download instantly. No signup required, no subscription.',
    type: 'website',
  }
}

export default async function Home() {
  // Check if user is already authenticated
  const session = await auth.api.getSession({ headers: await headers() })
  
  // If authenticated, redirect to dashboard
  if (session) {
    redirect(AppRoutes.dashboard)
  }

  return <LandingPage />
}
