import Link from 'next/link'
import { Check, X, Upload, PenTool, Download, ShieldCheck, Type, FileText, Briefcase, GraduationCap, Heart } from 'lucide-react'
import { AppRoutes } from '@/lib/config/featureToggles'
import { Footer } from '@/components/landing/sections/Footer'
import { useTranslations } from 'next-intl'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit PDF Free Online — Add Text, Fill Forms, No Signup',
  description:
    'Add text to any PDF instantly in your browser. Fill forms, annotate, download clean. Free forever. No watermark. No account. Your files never leave your device.',
  alternates: {
    canonical: 'https://simplifiedpdf.com/edit-pdf',
  },
  openGraph: {
    title: 'Edit PDF Free Online — Add Text, Fill Forms, No Signup',
    description:
      'Add text to any PDF instantly in your browser. Fill forms, annotate, download clean. Free forever. No watermark. No account.',
    type: 'website',
    url: 'https://simplifiedpdf.com/edit-pdf',
    siteName: 'SimplifiedPDF',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Edit PDF Free Online — Add Text, Fill Forms, No Signup',
    description:
      'Add text to any PDF in your browser. Fill forms, annotate, download clean. No account. No watermark.',
  },
}

export default function EditPdfPage() {
  const t = useTranslations('pages.editPdf')

  const editorFeatures = [
    { icon: Type, title: t('feat1Title'), desc: t('feat1Desc') },
    { icon: FileText, title: t('feat2Title'), desc: t('feat2Desc') },
    { icon: PenTool, title: t('feat3Title'), desc: t('feat3Desc') },
  ]

  const steps = [
    {
      icon: Upload,
      title: t('step1Title'),
      desc: [t('step1Desc1'), t('step1Desc2'), t('step1Desc3')],
    },
    {
      icon: Type,
      title: t('step2Title'),
      desc: [t('step2Desc1'), t('step2Desc2'), t('step2Desc3')],
    },
    {
      icon: Download,
      title: t('step3Title'),
      desc: [t('step3Desc1'), t('step3Desc2'), t('step3Desc3')],
    },
  ]

  const useCases = [
    { icon: Briefcase, label: t('uc1Label'), desc: t('uc1Desc') },
    { icon: FileText, label: t('uc2Label'), desc: t('uc2Desc') },
    { icon: Heart, label: t('uc3Label'), desc: t('uc3Desc') },
    { icon: GraduationCap, label: t('uc4Label'), desc: t('uc4Desc') },
  ]

  const comparisonRows = [
    { feature: t('row1Feature'), us: t('row1Us'), them: t('row1Them') },
    { feature: t('row2Feature'), us: t('row2Us'), them: t('row2Them') },
    { feature: t('row3Feature'), us: t('row3Us'), them: t('row3Them'), highlight: true },
    { feature: t('row4Feature'), us: t('row4Us'), them: t('row4Them'), highlight: true },
    { feature: t('row5Feature'), us: t('row5Us'), them: t('row5Them') },
    { feature: t('row6Feature'), us: t('row6Us'), them: t('row6Them') },
  ]

  const faqs = Array.from({ length: 10 }, (_, i) => ({
    q: t(`faq_q${i + 1}`),
    a: t(`faq_a${i + 1}`),
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://simplifiedpdf.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Edit PDF',
            item: 'https://simplifiedpdf.com/edit-pdf',
          },
        ],
      },
      {
        '@type': 'SoftwareApplication',
        name: 'SimplifiedPDF — Edit PDF Online',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any (Web Browser)',
        url: 'https://simplifiedpdf.com/edit-pdf',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: ['Add text to PDF', 'Fill PDF forms', 'Sign PDF', 'Download without watermark', 'No file upload'],
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

      {/* Feature Grid */}
      <section className="py-24 px-6 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-primary font-medium tracking-wide text-sm uppercase">{t('featuresEyebrow')}</span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">{t('featuresTitle')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {editorFeatures.map((feat, i) => (
              <div key={i} className="p-8 rounded-xl border border-border bg-card">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-6">
                  <feat.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl text-foreground mb-3">{feat.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Callout */}
      <section className="py-16 px-6 bg-accent/20 border-y border-primary/20">
        <div className="container mx-auto max-w-3xl text-center">
          <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            {t('privacyCalloutTitle')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('privacyCalloutDesc')}
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-primary font-medium tracking-wide text-sm uppercase">{t('howItWorksEyebrow')}</span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">{t('howItWorksTitle')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-border -z-10" />
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
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

      {/* Comparison Table */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
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
                        <Check className="w-5 h-5 text-primary shrink-0" />
                        <span className={row.highlight ? 'font-bold text-primary' : 'text-foreground'}>{row.us}</span>
                      </div>
                    </td>
                    <td className="p-6 text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <X className="w-5 h-5 text-destructive shrink-0" />
                        <span className="text-destructive">{row.them}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-card/50">
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
      <section className="py-24 px-6 bg-background text-center">
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
