import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth/auth'
import { AppRoutes } from '@/lib/config/featureToggles'
import { LandingPage } from '@/components/landing/LandingPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free PDF Editor — No Signup, No Subscription, No Catch',
  description: 'Edit and sign PDFs for free, right in your browser. Add text, draw signatures, and download instantly. No signup required, no subscription, no files uploaded to our servers. Ever.',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_URL || 'https://simplifiedpdf.com',
  },
  openGraph: {
    title: 'Free PDF Editor — No Signup, No Subscription, No Catch',
    description: 'Edit and sign PDFs for free, right in your browser. Add text, draw signatures, and download instantly. No signup required, no subscription.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_URL || 'https://simplifiedpdf.com',
    siteName: 'SimplifiedPDF',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'SimplifiedPDF — Free PDF Editor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free PDF Editor — No Signup, No Subscription, No Catch',
    description: 'Edit and sign PDFs for free, right in your browser. No signup. No subscription. Files never leave your device.',
    images: ['/opengraph-image.png'],
  },
}

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'SimplifiedPDF',
      url: process.env.NEXT_PUBLIC_URL || 'https://simplifiedpdf.com',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'SimplifiedPDF',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Any (Web Browser)',
      url: process.env.NEXT_PUBLIC_URL || 'https://simplifiedpdf.com',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Add text to PDF',
        'Sign PDF online',
        'Fill PDF forms',
        'Download without watermark',
        'No file upload required',
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
