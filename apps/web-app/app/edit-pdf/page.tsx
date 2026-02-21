import Link from 'next/link'
import { Check, X, Upload, PenTool, Download, ShieldCheck, Type, FileText, Briefcase, GraduationCap, Heart } from 'lucide-react'
import { AppRoutes } from '@/lib/config/featureToggles'
import { Footer } from '@/components/landing/sections/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit PDF Free Online — Add Text, Fill Forms, No Signup',
  description:
    'Add text to any PDF instantly in your browser. Fill forms, annotate, download clean. Free forever. No watermark. No account. Your files never leave your device.',
  alternates: {
    canonical: 'https://www.simplifiedpdf.com/edit-pdf',
  },
  openGraph: {
    title: 'Edit PDF Free Online — Add Text, Fill Forms, No Signup',
    description:
      'Add text to any PDF instantly in your browser. Fill forms, annotate, download clean. Free forever. No watermark. No account.',
    type: 'website',
    url: 'https://www.simplifiedpdf.com/edit-pdf',
    siteName: 'SimplifiedPDF',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Edit PDF Free Online — Add Text, Fill Forms, No Signup',
    description:
      'Add text to any PDF in your browser. Fill forms, annotate, download clean. No account. No watermark.',
  },
}

const editorFeatures = [
  {
    icon: Type,
    title: 'Add Text Anywhere',
    desc: 'Click anywhere on the PDF and start typing. Choose font, size, and colour to match the document.',
  },
  {
    icon: FileText,
    title: 'Fill PDF Forms',
    desc: 'Type into any form field — text boxes, date fields, signature lines. No special software needed.',
  },
  {
    icon: PenTool,
    title: 'Draw Signatures',
    desc: 'Sign with your mouse or finger. Save your signature for reuse across documents.',
  },
]

const steps = [
  {
    icon: Upload,
    title: 'Step 1: Open Your PDF',
    desc: ['Drop your PDF into the editor.', 'Opens instantly in your browser.', 'Nothing sent to any server.'],
  },
  {
    icon: Type,
    title: 'Step 2: Add Text or Fill Fields',
    desc: ['Click to add text anywhere.', 'Choose font, size, and colour.', 'Fill in forms, dates, names.'],
  },
  {
    icon: Download,
    title: 'Step 3: Download',
    desc: ['Click download — done.', 'No paywall. No watermark.', 'Your edited PDF saves to your device.'],
  },
]

const useCases = [
  { icon: Briefcase, label: 'Job applications', desc: 'Fill in employment forms without printing.' },
  { icon: FileText, label: 'Tax forms', desc: 'Complete self-assessment and tax documents digitally.' },
  { icon: Heart, label: 'Medical forms', desc: 'Patient intake and consent forms filled in seconds.' },
  { icon: GraduationCap, label: 'School assignments', desc: 'Annotate, fill, and return coursework PDFs.' },
]

const comparisonRows = [
  { feature: 'Add text to PDF', us: 'Free, always', them: 'Free or subscription' },
  { feature: 'Fill PDF forms', us: 'Free, always', them: 'Often subscription' },
  { feature: 'Download without watermark', us: 'Always free', them: 'Paid tier only', highlight: true },
  { feature: 'File uploaded to server', us: 'Never', them: 'Yes (Smallpdf, ILovePDF)', highlight: true },
  { feature: 'Account required', us: 'Never', them: 'Often required' },
  { feature: 'Works offline', us: 'Yes', them: 'Rarely' },
]

const faqs = [
  {
    q: 'Can I add text to a PDF without Adobe Acrobat?',
    a: 'Yes. SimplifiedPDF lets you add text to any PDF right in your browser — no software download, no Adobe subscription required. Just open the PDF, click where you want to type, and start editing.',
  },
  {
    q: 'Can I fill in a PDF form online?',
    a: 'Yes. Open your form in SimplifiedPDF, click on any field, and type your answer. You can fill in text fields, dates, names, and any other area of the PDF. Download the completed form when you\'re done.',
  },
  {
    q: 'Will there be a watermark on my edited PDF?',
    a: 'No. SimplifiedPDF never adds watermarks to your downloaded files. The PDF you download looks exactly as you edited it.',
  },
  {
    q: 'Is my PDF uploaded to your servers?',
    a: 'No. Everything runs inside your browser on your own device. Your PDF files are never sent to our servers. We don\'t see them, store them, or have any access to them.',
  },
  {
    q: 'Can I change the font size or colour when adding text?',
    a: 'Yes. When you add text to a PDF in SimplifiedPDF, you can choose the font, size, and colour to match the rest of the document.',
  },
  {
    q: 'Does editing a PDF work on mobile?',
    a: 'Yes. SimplifiedPDF works in any modern mobile browser on iOS and Android. You can add text, fill forms, and download your edited PDF from your phone.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'SimplifiedPDF — Edit PDF Online',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Any (Web Browser)',
      url: 'https://www.simplifiedpdf.com/edit-pdf',
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

export default function EditPdfPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="text-primary font-medium tracking-wide text-sm uppercase">Free · No Account · No Watermark</span>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mt-4 mb-6">
            Edit PDF Free Online — Add Text, Fill Forms, No Signup
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Add text to any PDF, fill in forms, draw signatures — all in your browser.
            Download instantly, no watermark, no account required.
          </p>
          <Link
            href={AppRoutes.editor}
            className="inline-block bg-primary text-primary-foreground text-lg font-medium px-10 py-4 rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Edit Your PDF — It&apos;s Free
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">Your documents never leave your browser.</p>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 px-6 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-primary font-medium tracking-wide text-sm uppercase">What You Can Do</span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">Everything you need to edit a PDF</h2>
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
            Unlike Smallpdf or ILovePDF, your PDF never touches our servers
          </h2>
          <p className="text-muted-foreground text-lg">
            Most online PDF editors upload your file to their servers to process it. SimplifiedPDF runs entirely in your
            browser — your document is never transmitted, stored, or seen by anyone but you.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-primary font-medium tracking-wide text-sm uppercase">How It Works</span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">Three steps. No account. No waiting.</h2>
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
            <span className="text-primary font-medium tracking-wide text-sm uppercase">Common Uses</span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">What people edit with SimplifiedPDF</h2>
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
            <h2 className="font-display text-4xl md:text-5xl text-foreground">SimplifiedPDF vs. the alternatives</h2>
          </div>
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-6 font-medium text-muted-foreground w-1/3">Feature</th>
                  <th className="p-6 font-display text-xl text-primary bg-card border-x border-border w-1/3">SimplifiedPDF</th>
                  <th className="p-6 font-medium text-muted-foreground w-1/3">Smallpdf / ILovePDF</th>
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
      <section className="py-24 px-6 bg-background text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-5xl md:text-6xl text-foreground mb-6">
            Stop printing. Start editing.
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            No account. No subscription. No nonsense.
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
      <Footer />
    </>
  )
}
