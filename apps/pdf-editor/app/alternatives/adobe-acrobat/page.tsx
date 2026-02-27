import Link from 'next/link'
import { Check, X, ShieldCheck, Zap, WifiOff, CreditCard } from 'lucide-react'
import { AppRoutes } from '@/lib/config/featureToggles'
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

const comparisonRows = [
  { feature: 'Price', us: 'Free, always', them: '~$23/month (Pro)', highlight: true },
  { feature: 'Account required', us: 'Never', them: 'Yes (Adobe ID)', positiveUs: true, negativeForThem: true },
  { feature: 'Software to install', us: 'None — runs in browser', them: 'Desktop app or extension', positiveUs: true, negativeForThem: true },
  { feature: 'Add text to PDF', us: 'Yes', them: 'Yes (paid)', positiveUs: true, positiveForThem: false },
  { feature: 'Sign PDF', us: 'Yes', them: 'Yes (Acrobat Sign, paid)', positiveUs: true, positiveForThem: false },
  { feature: 'Fill PDF forms', us: 'Yes', them: 'Yes (paid)', positiveUs: true, positiveForThem: false },
  { feature: 'Files uploaded to server', us: 'Never', them: 'Adobe cloud (always)', highlight: true },
  { feature: 'Watermark on download', us: 'Never', them: 'No (paid tier)', positiveUs: true, positiveForThem: true },
  { feature: 'Works offline', us: 'Yes', them: 'Limited', positiveUs: true, positiveForThem: false },
  { feature: 'Create PDFs from scratch', us: 'Not yet', them: 'Yes', positiveUs: false, positiveForThem: true },
  { feature: 'OCR (searchable PDF)', us: 'Not yet', them: 'Yes', positiveUs: false, positiveForThem: true },
  { feature: 'PDF compression', us: 'Not yet', them: 'Yes', positiveUs: false, positiveForThem: true },
]

const weWin = [
  {
    icon: CreditCard,
    title: 'Free forever',
    desc: "Adobe charges $22.99/month for Acrobat Pro. SimplifiedPDF covers the most common tasks — add text, sign, fill forms — at no cost, with no trial period.",
  },
  {
    icon: ShieldCheck,
    title: 'Your files never leave your device',
    desc: 'Adobe uploads files to its cloud to process them. SimplifiedPDF runs entirely in your browser — your PDF is never transmitted to any server.',
  },
  {
    icon: Zap,
    title: 'No Adobe ID required',
    desc: 'Adobe requires you to create an account before you can do anything. SimplifiedPDF lets you open and edit a PDF in seconds with no signup.',
  },
  {
    icon: WifiOff,
    title: 'Works without installing anything',
    desc: 'Acrobat requires a desktop app or browser extension. SimplifiedPDF runs in any modern browser with no installation.',
  },
]

const theyWin = [
  {
    title: 'Create PDFs from other file types',
    desc: 'Adobe can convert Word, Excel, and image files into PDF. SimplifiedPDF currently only edits existing PDFs.',
  },
  {
    title: 'OCR — make scanned PDFs searchable',
    desc: "Acrobat's OCR technology can recognise text in scanned documents. SimplifiedPDF does not currently offer this.",
  },
  {
    title: 'PDF compression and file size reduction',
    desc: 'Adobe can significantly compress PDFs for sending. SimplifiedPDF does not currently offer compression.',
  },
  {
    title: 'Advanced redaction and security',
    desc: 'Adobe Pro offers document redaction and encryption. SimplifiedPDF is focused on basic editing and signing.',
  },
]

const faqs = [
  {
    q: 'Can SimplifiedPDF replace Adobe Acrobat?',
    a: 'For most everyday tasks — adding text, filling forms, signing documents — yes. SimplifiedPDF handles these for free, with no subscription and no software. If you need advanced features like OCR, PDF creation from other file types, or professional redaction, Adobe Acrobat remains the more complete tool.',
  },
  {
    q: 'Is SimplifiedPDF really free, or does it have a free tier like Adobe?',
    a: "Completely free. There's no free tier that limits downloads or adds watermarks. The core features — add text, sign, fill forms, download — are free forever with no strings attached.",
  },
  {
    q: 'Does SimplifiedPDF upload my PDFs to a server like Adobe does?',
    a: 'No. SimplifiedPDF runs entirely inside your browser. Your PDF files are processed locally on your device and are never sent to our servers. Adobe Acrobat, by contrast, uploads files to Adobe\'s cloud infrastructure.',
  },
  {
    q: 'Can I sign a PDF for free with SimplifiedPDF?',
    a: "Yes. Draw your signature, place it on the document, and download the signed PDF — all for free. Adobe's e-signing features require an Acrobat subscription or a separate Adobe Sign plan.",
  },
  {
    q: 'Does SimplifiedPDF work on Mac and Windows?',
    a: 'Yes. Because it runs in your browser, SimplifiedPDF works on any operating system — Mac, Windows, Linux, iOS, or Android.',
  },
]

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

export default function AdobeAcrobatAlternativePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="text-primary font-medium tracking-wide text-sm uppercase">Adobe Acrobat Alternative</span>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mt-4 mb-6">
            The Free Adobe Acrobat Alternative
          </h1>
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            Edit PDFs, add text, fill forms, and sign documents — all in your browser, completely free.
            No subscription. No Adobe ID. No files uploaded to the cloud.
          </p>
          <p className="text-muted-foreground mb-10 font-medium">
            Adobe Acrobat Pro costs $22.99/month. SimplifiedPDF costs nothing.
          </p>
          <Link
            href={AppRoutes.editor}
            className="inline-block bg-primary text-primary-foreground text-lg font-medium px-10 py-4 rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Try SimplifiedPDF Free
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">No signup. Your files stay on your device.</p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-6 bg-card/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl text-foreground">SimplifiedPDF vs. Adobe Acrobat Pro</h2>
          </div>
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-6 font-medium text-muted-foreground w-1/3">Feature</th>
                  <th className="p-6 font-display text-xl text-primary bg-card border-x border-border w-1/3">SimplifiedPDF</th>
                  <th className="p-6 font-medium text-muted-foreground w-1/3">Adobe Acrobat Pro</th>
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
            <h2 className="font-display text-4xl md:text-5xl text-foreground">What SimplifiedPDF does that Adobe charges for</h2>
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
            <span className="text-amber-500 font-medium tracking-wide text-sm uppercase">Honest limitations</span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">
              What Adobe does that we don&apos;t (yet)
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              We believe in honesty. Here are the things Adobe Acrobat can do that SimplifiedPDF currently cannot.
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
            If these features are critical for you, Adobe Acrobat Pro may be the better fit.
            For everyday PDF editing, signing, and form-filling, SimplifiedPDF is a strong free alternative.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-12">Frequently Asked Questions</h2>
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
            Stop paying for Acrobat.
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            SimplifiedPDF handles everyday PDF editing — free, private, no account.
          </p>
          <Link
            href={AppRoutes.editor}
            className="inline-block bg-primary text-primary-foreground text-lg font-medium px-10 py-4 rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Open the Editor — It&apos;s Free
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">Your documents never leave your browser.</p>
        </div>
      </section>
    </>
  )
}
