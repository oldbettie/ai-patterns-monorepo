// @feature:qr-generator @domain:qr @frontend
// @summary: QR tool selector hub — pick from 6 QR code types

import Link from 'next/link'
import { Link2, Wifi, User, MessageSquare, Mail, FileText } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'QR Code Generator',
  description: 'Generate QR codes for URLs, WiFi, contacts, SMS, email, and plain text. Free, no signup, no watermarks.',
}

const TOOL_CONFIGS = [
  { href: '/generate/url', icon: Link2, key: 'url' },
  { href: '/generate/wifi', icon: Wifi, key: 'wifi' },
  { href: '/generate/vcard', icon: User, key: 'vcard' },
  { href: '/generate/sms', icon: MessageSquare, key: 'sms' },
  { href: '/generate/email', icon: Mail, key: 'email' },
  { href: '/generate/text', icon: FileText, key: 'text' },
] as const

export default async function GenerateHubPage() {
  const t = await getTranslations('pages.generate')

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="container mx-auto max-w-4xl px-6 py-12 flex flex-col gap-10">
        <div className="text-center">
          <h1 className="font-display text-4xl text-foreground mb-3">{t('title')}</h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            {t('hub.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOL_CONFIGS.map(({ href, icon: Icon, key }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-4 p-6 bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground text-base mb-1">
                  {t(`typeSelector.${key}`)}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t(`hub.cardDescriptions.${key}`)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
