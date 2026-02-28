import Link from 'next/link'
import { Check, X, ShieldCheck, Zap, WifiOff, CreditCard } from 'lucide-react'
import { AppRoutes } from '@/lib/config/featureToggles'
import { useTranslations } from 'next-intl'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Adobe Acrobat Alternative — No Subscription, No Signup',
  description:
    "Skip Adobe's $23/month. SimplifiedPDF edits PDFs, adds text, and signs documents free in your browser. No software. No subscription.",
  alternates: {
    canonical: 'https://www.simplifiedpdf.com/alternatives/adobe-acrobat',
  },
  openGraph: {
    title: 'Free Adobe Acrobat Alternative — No Subscription, No Signup',
    description:
      "Skip Adobe's $23/month. SimplifiedPDF edits PDFs, adds text, and signs documents free in your browser. No software. No subscription.",
    type: 'website',
    url: 'https://www.simplifiedpdf.com/alternatives/adobe-acrobat',
    siteName: 'SimplifiedPDF',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Adobe Acrobat Alternative — No Subscription, No Signup',
    description: "Skip Adobe's $23/month. Edit PDFs, add text, sign documents — free in your browser.",
  },
}

export default function AdobeAcrobatAlternativePage() {
  const t = useTranslations('pages.alternatives.adobeAcrobat')

  const comparisonRows = [
    { feature: t('row1Feature'), us: t('row1Us'), them: t('row1Them'), highlight: true },
    { feature: t('row2Feature'), us: t('row2Us'), them: t('row2Them'), positiveUs: true, negativeForThem: true },
    { feature: t('row3Feature'), us: t('row3Us'), them: t('row3Them'), positiveUs: true, negativeForThem: true },
    { feature: t('row4Feature'), us: t('row4Us'), them: t('row4Them'), positiveUs: true, positiveForThem: false },
    { feature: t('row5Feature'), us: t('row5Us'), them: t('row5Them'), positiveUs: true, positiveForThem: false },
    { feature: t('row6Feature'), us: t('row6Us'), them: t('row6Them'), positiveUs: true, positiveForThem: false },
    { feature: t('row7Feature'), us: t('row7Us'), them: t('row7Them'), highlight: true },
    { feature: t('row8Feature'), us: t('row8Us'), them: t('row8Them'), positiveUs: true, positiveForThem: true },
    { feature: t('row9Feature'), us: t('row9Us'), them: t('row9Them'), positiveUs: true, positiveForThem: false },
    { feature: t('row10Feature'), us: t('row10Us'), them: t('row10Them'), positiveUs: false, positiveForThem: true },
    { feature: t('row11Feature'), us: t('row11Us'), them: t('row11Them'), positiveUs: false, positiveForThem: true },
    { feature: t('row12Feature'), us: t('row12Us'), them: t('row12Them'), positiveUs: false, positiveForThem: true },
  ]

  const weWin = [
    { icon: CreditCard, title: t('win1Title'), desc: t('win1Desc') },
    { icon: ShieldCheck, title: t('win2Title'), desc: t('win2Desc') },
    { icon: Zap, title: t('win3Title'), desc: t('win3Desc') },
    { icon: WifiOff, title: t('win4Title'), desc: t('win4Desc') },
  ]

  const theyWin = [
    { title: t('limit1Title'), desc: t('limit1Desc') },
    { title: t('limit2Title'), desc: t('limit2Desc') },
    { title: t('limit3Title'), desc: t('limit3Desc') },
    { title: t('limit4Title'), desc: t('limit4Desc') },
  ]

  const faqs = Array.from({ length: 5 }, (_, i) => ({
    q: t(`faq_q${i + 1}`),
    a: t(`faq_a${i + 1}`),
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'SimplifiedPDF',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any (Web Browser)',
        url: 'https://www.simplifiedpdf.com',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="text-primary font-medium tracking-wide text-sm uppercase">{t('heroEyebrow')}</span>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mt-4 mb-6">
            {t('heroHeadline')}
          </h1>
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            {t('heroDescription')}
          </p>
          <p className="text-muted-foreground mb-10 font-medium">
            {t('heroPriceNote')}
          </p>
          <Link
            href={AppRoutes.editor}
            className="inline-block bg-primary text-primary-foreground text-lg font-medium px-10 py-4 rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            {t('heroCta')}
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">{t('heroNote')}</p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-6 bg-card/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl text-foreground">{t('comparisonTitle')}</h2>
          </div>
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-6 font-medium text-muted-foreground w-1/3">Feature</th>
                  <th className="p-6 font-display text-xl text-primary bg-card border-x border-border w-1/3">{t('comparisonColUs')}</th>
                  <th className="p-6 font-medium text-muted-foreground w-1/3">{t('comparisonColThem')}</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className={`border-b border-border last:border-0 ${row.highlight ? 'bg-accent/20' : ''}`}>
                    <td className="p-6 text-foreground font-medium">{row.feature}</td>
                    <td className="p-6 bg-card border-x border-border">
                      <div className="flex items-center gap-3">
                        {row.positiveUs !== false ? (
                          <Check className="w-5 h-5 text-primary shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground shrink-0" />
                        )}
                        <span className={row.highlight ? 'font-bold text-primary' : 'text-foreground'}>{row.us}</span>
                      </div>
                    </td>
                    <td className="p-6 text-muted-foreground">
                      <div className="flex items-center gap-3">
                        {row.positiveForThem === true ? (
                          <Check className="w-5 h-5 text-muted-foreground shrink-0" />
                        ) : row.negativeForThem ? (
                          <X className="w-5 h-5 text-destructive shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-destructive shrink-0" />
                        )}
                        <span>{row.them}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Where We Win */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl text-foreground">{t('weWinTitle')}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {weWin.map((item, i) => (
              <div key={i} className="p-8 rounded-xl border border-border bg-card">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-6">
                  <item.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Honest Limitations */}
      <section className="py-24 px-6 bg-card/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-amber-500 font-medium tracking-wide text-sm uppercase">{t('theyWinEyebrow')}</span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">
              {t('theyWinTitle')}
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              {t('theyWinDesc')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {theyWin.map((item, i) => (
              <div key={i} className="p-6 rounded-xl border border-border bg-card">
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-muted-foreground">
            {t('theyWinNote')}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-12">{t('faqTitle')}</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-display text-lg text-foreground mb-3">{faq.q}</h3>
                <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-card/50 text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-5xl md:text-6xl text-foreground mb-6">
            {t('finalCtaHeadline')}
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            {t('finalCtaSubtext')}
          </p>
          <Link
            href={AppRoutes.editor}
            className="inline-block bg-primary text-primary-foreground text-lg font-medium px-10 py-4 rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            {t('finalCtaCta')}
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">{t('finalCtaNote')}</p>
        </div>
      </section>
    </>
  )
}
