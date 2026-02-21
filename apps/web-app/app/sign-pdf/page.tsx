import Link from 'next/link'
import { Upload, PenTool, Download, ShieldCheck, WifiOff, Zap, FileText, Briefcase, Home, GraduationCap } from 'lucide-react'
import { AppRoutes } from '@/lib/config/featureToggles'
import { Footer } from '@/components/landing/sections/Footer'
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

const steps = [
  {
    icon: Upload,
    title: 'Step 1: Open Your PDF',
    desc: [
      'Drop your PDF into the editor.',
      'It opens instantly in your browser.',
      'Nothing is sent to any server.',
    ],
  },
  {
    icon: PenTool,
    title: 'Step 2: Draw Your Signature',
    desc: [
      'Use your mouse, trackpad, or finger.',
      'Save it for reuse on future documents.',
      'Drag and resize to position it perfectly.',
    ],
  },
  {
    icon: Download,
    title: 'Step 3: Download',
    desc: [
      'Click download — done.',
      'No watermark. No paywall. No account prompt.',
      'Your signed PDF saves to your device.',
    ],
  },
]

const differentiators = [
  {
    icon: ShieldCheck,
    title: 'No Account Required',
    desc: 'Sign PDFs without creating a profile or handing over an email address. Just open and sign.',
  },
  {
    icon: ShieldCheck,
    title: 'Files Stay on Your Device',
    desc: 'Your PDF is never uploaded to our servers. Everything runs inside your browser — private by design.',
  },
  {
    icon: Zap,
    title: 'No Watermark',
    desc: 'Your signed PDF is clean. No branding, no "signed with SimplifiedPDF" footer. It looks exactly as you intended.',
  },
  {
    icon: WifiOff,
    title: 'Works Offline',
    desc: 'Once loaded, the editor works without internet. Sign documents even on a plane or with a slow connection.',
  },
]

const useCases = [
  { icon: Home, label: 'Rental agreements', desc: 'Sign tenancy agreements and lease renewals without printing.' },
  { icon: Briefcase, label: 'Work contracts', desc: 'Return signed employment contracts and NDAs instantly.' },
  { icon: FileText, label: 'HR forms', desc: 'Fill and sign onboarding paperwork from any device.' },
  { icon: GraduationCap, label: 'School documents', desc: 'Permission slips, enrolment forms, and consent letters.' },
]

const faqs = [
  {
    q: 'Is e-signing a PDF legal?',
    a: 'Yes. Electronic signatures are legally recognised in most countries for everyday documents — including contracts, rental agreements, NDAs, and HR forms — under laws like the US ESIGN Act and EU eIDAS Regulation.',
  },
  {
    q: 'Do I need to print and scan to sign a PDF?',
    a: 'No. With SimplifiedPDF you can draw your signature directly on the document using your mouse or finger and download the signed version instantly. No printing required.',
  },
  {
    q: 'Can I sign a PDF on my phone?',
    a: 'Yes. SimplifiedPDF works in any modern mobile browser on iOS and Android. You can draw your signature with your finger and download the signed PDF in seconds.',
  },
  {
    q: 'Is my signature saved anywhere?',
    a: 'Your signature is saved locally in your browser on your own device only. It is never sent to our servers. You can reuse it across multiple documents.',
  },
  {
    q: 'Can I sign multiple pages in one PDF?',
    a: 'Yes. You can navigate to any page in the PDF and place your signature exactly where you need it, as many times as needed.',
  },
  {
    q: 'Does SimplifiedPDF work without the internet?',
    a: 'Yes. Once you have loaded the editor in your browser, it works offline. Your documents and signature are stored on your device.',
  },
]

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

export default function SignPdfPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="text-primary font-medium tracking-wide text-sm uppercase">Free · No Account · Private</span>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mt-4 mb-6">
            Sign PDF Online — Free, Private, No Signup
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Draw your signature, place it anywhere on your PDF, and download the signed document instantly.
            No account, no subscription, no files sent to any server.
          </p>
          <Link
            href={AppRoutes.editor}
            className="inline-block bg-primary text-primary-foreground text-lg font-medium px-10 py-4 rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Sign Your PDF — It&apos;s Free
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">Your documents never leave your browser.</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-primary font-medium tracking-wide text-sm uppercase">How It Works</span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">Three steps. No account. No waiting.</h2>
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
            <span className="text-primary font-medium tracking-wide text-sm uppercase">Why SimplifiedPDF</span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">The PDF signer that doesn&apos;t compromise your privacy</h2>
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
            <span className="text-primary font-medium tracking-wide text-sm uppercase">Common Uses</span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">What people sign with SimplifiedPDF</h2>
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
            Ready to sign your PDF?
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
