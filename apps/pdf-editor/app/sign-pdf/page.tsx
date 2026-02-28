import Link from 'next/link'
import { Upload, PenTool, Download, ShieldCheck, WifiOff, Zap, FileText, Briefcase, Home, GraduationCap } from 'lucide-react'
import { AppRoutes } from '@/lib/config/featureToggles'
import { Footer } from '@/components/landing/sections/Footer'
import { useTranslations } from 'next-intl'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign PDF Online Free — No Signup, No Software',
  description:
    'Sign any PDF in seconds, right in your browser. Draw your signature, place it, download instantly. No account. No subscription. Files never leave your device.',
  alternates: {
    canonical: 'https://www.simplifiedpdf.com/sign-pdf',
  },
  openGraph: {
    title: 'Sign PDF Online Free — No Signup, No Software',
    description:
      'Sign any PDF in seconds, right in your browser. Draw your signature, place it, download instantly. No account. No subscription.',
    type: 'website',
    url: 'https://www.simplifiedpdf.com/sign-pdf',
    siteName: 'SimplifiedPDF',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign PDF Online Free — No Signup, No Software',
    description:
      'Sign any PDF in seconds in your browser. No account. No subscription. Files never leave your device.',
  },
}

export default function SignPdfPage() {
  const t = useTranslations('pages.signPdf')

  const steps = [
    {
      icon: Upload,
      title: t('step1Title'),
      desc: [t('step1Desc1'), t('step1Desc2'), t('step1Desc3')],
    },
    {
      icon: PenTool,
      title: t('step2Title'),
      desc: [t('step2Desc1'), t('step2Desc2'), t('step2Desc3')],
    },
    {
      icon: Download,
      title: t('step3Title'),
      desc: [t('step3Desc1'), t('step3Desc2'), t('step3Desc3')],
    },
  ]

  const differentiators = [
    { icon: ShieldCheck, title: t('diff1Title'), desc: t('diff1Desc') },
    { icon: ShieldCheck, title: t('diff2Title'), desc: t('diff2Desc') },
    { icon: Zap, title: t('diff3Title'), desc: t('diff3Desc') },
    { icon: WifiOff, title: t('diff4Title'), desc: t('diff4Desc') },
  ]

  const useCases = [
    { icon: Home, label: t('uc1Label'), desc: t('uc1Desc') },
    { icon: Briefcase, label: t('uc2Label'), desc: t('uc2Desc') },
    { icon: FileText, label: t('uc3Label'), desc: t('uc3Desc') },
    { icon: GraduationCap, label: t('uc4Label'), desc: t('uc4Desc') },
  ]

  const faqs = Array.from({ length: 6 }, (_, i) => ({
    q: t(`faq_q${i + 1}`),
    a: t(`faq_a${i + 1}`),
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'SimplifiedPDF — Sign PDF Online',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any (Web Browser)',
        url: 'https://www.simplifiedpdf.com/sign-pdf',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: ['Draw signature', 'Place on PDF', 'Download signed PDF', 'No account required', 'No file upload'],
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
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t('heroDescription')}
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

      {/* How It Works */}
      <section className="py-24 px-6 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-primary font-medium tracking-wide text-sm uppercase">{t('howItWorksEyebrow')}</span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">{t('howItWorksTitle')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-border -z-10" />
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center bg-card/0">
                <div className="w-24 h-24 bg-card rounded-2xl border border-border shadow-sm flex items-center justify-center mb-6 relative z-10">
                  <step.icon className="w-10 h-10 text-primary" strokeWidth={1.5} />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                </div>
                <h3 className="font-display text-2xl text-foreground mb-4">{step.title}</h3>
                <div className="text-muted-foreground space-y-1">
                  {step.desc.map((line, j) => <p key={j}>{line}</p>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Sign Here */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-primary font-medium tracking-wide text-sm uppercase">{t('whyEyebrow')}</span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">{t('whyTitle')}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {differentiators.map((item, i) => (
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

      {/* Use Cases */}
      <section className="py-24 px-6 bg-card/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-primary font-medium tracking-wide text-sm uppercase">{t('useCasesEyebrow')}</span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">{t('useCasesTitle')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((uc, i) => (
              <div key={i} className="p-6 rounded-xl border border-border bg-card text-center">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-4 mx-auto">
                  <uc.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-medium text-foreground mb-2">{uc.label}</h3>
                <p className="text-sm text-muted-foreground">{uc.desc}</p>
              </div>
            ))}
          </div>
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
      <Footer />
    </>
  )
}
