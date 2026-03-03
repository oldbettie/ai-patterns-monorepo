import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth/auth'
import { AppRoutes } from '@/lib/config/featureToggles'
import { LandingPage } from '@/components/landing/LandingPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free QR Code Generator — No Signup, No Subscription, No Catch',
  description: 'Generate QR codes for URLs, WiFi, vCards, SMS, email, and plain text. Free, fast, and private. No signup required, no files uploaded to our servers. Ever.',
  alternates: {
    canonical: 'https://simplifiedqr.com',
  },
  openGraph: {
    title: 'Free QR Code Generator — No Signup, No Subscription, No Catch',
    description: 'Generate QR codes for URLs, WiFi, vCards, SMS, email, and plain text. Free, fast, and private.',
    type: 'website',
    url: 'https://simplifiedqr.com',
    siteName: 'Simplified QR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free QR Code Generator — No Signup, No Subscription, No Catch',
    description: 'Generate QR codes for URLs, WiFi, vCards, SMS, email, and plain text. Free, fast, and private.',
  },
}

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'Simplified QR',
      url: 'https://simplifiedqr.com',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Simplified QR',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Any (Web Browser)',
      url: 'https://simplifiedqr.com',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Generate QR codes for URLs',
        'WiFi QR codes',
        'vCard QR codes',
        'SMS QR codes',
        'Email QR codes',
        'Download as PNG or SVG',
        'No signup required',
        'Works offline',
      ],
    },
  ],
}

export default async function Home() {
  // Check if user is already authenticated
  const session = await auth.api.getSession({ headers: await headers() })

  // If authenticated, redirect to dashboard
  if (session) {
    redirect(AppRoutes.dashboard)
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <LandingPage />
    </>
  )
}
