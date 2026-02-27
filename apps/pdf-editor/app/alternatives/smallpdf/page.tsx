import Link from 'next/link'
import { Check, X, ShieldCheck, Zap, WifiOff, Infinity } from 'lucide-react'
import { AppRoutes } from '@/lib/config/featureToggles'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Smallpdf Alternative — No Upload, No Watermark, No Subscription',
  description:
    "Unlike Smallpdf, SimplifiedPDF never uploads your files, never watermarks downloads, and has no daily limits. 100% free PDF editing in your browser.",
  alternates: {
    canonical: 'https://www.simplifiedpdf.com/alternatives/smallpdf',
  },
  openGraph: {
    title: 'Free Smallpdf Alternative — No Upload, No Watermark, No Subscription',
    description:
      "Unlike Smallpdf, SimplifiedPDF never uploads your files, never watermarks downloads, and has no daily limits.",
    type: 'website',
    url: 'https://www.simplifiedpdf.com/alternatives/smallpdf',
    siteName: 'SimplifiedPDF',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Smallpdf Alternative — No Upload, No Watermark, No Subscription',
    description: "No file upload, no watermarks, no daily limits. Free PDF editing in your browser.",
  },
}

const comparisonRows = [
  { feature: 'Price', us: 'Free, always', them: 'Free tier + $9/month Pro', highlight: true },
  { feature: 'Files uploaded to server', us: 'Never', them: 'Always (Smallpdf servers)', highlight: true },
  { feature: 'Watermark on free download', us: 'Never', them: 'Yes (free tier)', highlight: true },
  { feature: 'Daily task limit', us: 'None', them: '2 tasks/day (free tier)', highlight: true },
  { feature: 'Account required', us: 'Never', them: 'Yes (for most tasks)' },
  { feature: 'Add text to PDF', us: 'Yes', them: 'Yes (limited free)' },
  { feature: 'Sign PDF', us: 'Yes', them: 'Yes (limited free)' },
  { feature: 'Works offline', us: 'Yes', them: 'No (server-dependent)' },
  { feature: 'PDF compression', us: 'Not yet', them: 'Yes' },
  { feature: 'PDF to Word conversion', us: 'Not yet', them: 'Yes (Pro)' },
]

const weWin = [
  {
    icon: ShieldCheck,
    title: 'Your files are never uploaded',
    desc: "Smallpdf uploads every PDF to their servers for processing — even on the free tier. SimplifiedPDF runs entirely in your browser. Your document is never transmitted anywhere.",
  },
  {
    icon: Zap,
    title: 'No watermarks, ever',
    desc: "Smallpdf adds a watermark to free-tier downloads. Every PDF you download from SimplifiedPDF is clean — no branding, no watermark, no matter what.",
  },
  {
    icon: Infinity,
    title: 'No daily task limits',
    desc: "Smallpdf's free tier limits you to 2 tasks per day. SimplifiedPDF has no limits. Edit as many PDFs as you like, whenever you like.",
  },
  {
    icon: WifiOff,
    title: 'Works offline',
    desc: "Because Smallpdf relies on server-side processing, it requires a constant internet connection. SimplifiedPDF works offline once loaded — even on a plane.",
  },
]

const theyWin = [
  {
    title: 'PDF compression',
    desc: 'Smallpdf can significantly reduce PDF file sizes. SimplifiedPDF does not currently offer PDF compression.',
  },
  {
    title: 'PDF to Word, Excel, or image',
    desc: 'Smallpdf can convert PDFs to other formats. SimplifiedPDF currently only supports editing existing PDFs.',
  },
  {
    title: 'Merge and split PDFs',
    desc: 'Smallpdf offers tools to merge multiple PDFs into one or split a PDF into separate files. This is not currently available in SimplifiedPDF.',
  },
]

const faqs = [
  {
    q: "Why is SimplifiedPDF better than Smallpdf for privacy?",
    a: "Smallpdf uploads your PDF to its servers to perform any operation — including basic tasks like adding text. SimplifiedPDF processes everything locally in your browser. Your PDF is never transmitted, which is essential for sensitive documents like contracts, medical forms, or financial records.",
  },
  {
    q: "Does SimplifiedPDF have a daily limit like Smallpdf?",
    a: "No. Smallpdf's free tier allows only 2 tasks per day before requiring an upgrade. SimplifiedPDF has no daily limits, no task caps, and no usage restrictions.",
  },
  {
    q: "Will my downloaded PDF have a watermark?",
    a: "No. SimplifiedPDF never adds watermarks to your files. Smallpdf adds 'Processed by Smallpdf' watermarks on free-tier downloads. With SimplifiedPDF, what you edit is exactly what you download.",
  },
  {
    q: "Does SimplifiedPDF work without the internet?",
    a: "Yes. Because SimplifiedPDF runs in your browser rather than on servers, it works offline once loaded. Smallpdf requires an internet connection for every operation since files must be sent to and from their servers.",
  },
  {
    q: "Is SimplifiedPDF free to use without a Smallpdf account?",
    a: "Yes. SimplifiedPDF never requires an account. You can open a PDF, add text, sign it, and download it without creating a profile or providing an email address.",
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

export default function SmallpdfAlternativePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="text-primary font-medium tracking-wide text-sm uppercase">Smallpdf Alternative</span>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mt-4 mb-6">
            The Free Smallpdf Alternative — No Upload, No Watermark
          </h1>
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            SimplifiedPDF never uploads your files, never adds watermarks, and has no daily limits.
            Edit PDFs completely free, right in your browser.
          </p>
          <p className="text-muted-foreground mb-10 font-medium">
            Where Smallpdf uploads your files and limits free usage, SimplifiedPDF is unlimited and private by design.
          </p>
          <Link
            href={AppRoutes.editor}
            className="inline-block bg-primary text-primary-foreground text-lg font-medium px-10 py-4 rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Try SimplifiedPDF Free
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">No signup. No upload. No watermark.</p>
        </div>
      </section>

      {/* Pain Points Callout */}
      <section className="py-16 px-6 bg-destructive/5 border-y border-destructive/20">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-3xl text-foreground text-center mb-8">The Smallpdf free tier problem</h2>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="text-3xl font-bold text-destructive mb-2">Uploaded</div>
              <p className="text-muted-foreground text-sm">Your PDF is sent to Smallpdf&apos;s servers every time</p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="text-3xl font-bold text-destructive mb-2">Watermarked</div>
              <p className="text-muted-foreground text-sm">Free downloads include &quot;Processed by Smallpdf&quot; branding</p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="text-3xl font-bold text-destructive mb-2">2/day limit</div>
              <p className="text-muted-foreground text-sm">Free tier blocks you after 2 tasks — then demands an upgrade</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-6 bg-card/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl text-foreground">SimplifiedPDF vs. Smallpdf</h2>
          </div>
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-6 font-medium text-muted-foreground w-1/3">Feature</th>
                  <th className="p-6 font-display text-xl text-primary bg-card border-x border-border w-1/3">SimplifiedPDF</th>
                  <th className="p-6 font-medium text-muted-foreground w-1/3">Smallpdf (Free Tier)</th>
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

      {/* Where We Win */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl text-foreground">Where SimplifiedPDF wins on every point</h2>
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
              What Smallpdf does that we don&apos;t (yet)
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Smallpdf has a broader toolset. Here&apos;s what we don&apos;t support yet.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
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
            If file conversion or compression are your primary need, Smallpdf Pro may suit you.
            For signing, adding text, and filling forms — SimplifiedPDF does it better, for free.
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
            Tired of Smallpdf&apos;s limits?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            No upload. No watermark. No daily cap. Just free PDF editing.
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
