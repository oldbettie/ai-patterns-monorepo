import { Footer } from '@/components/landing/sections/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Quick QR is built on a simple principle: your data is yours. Nothing you encode is ever uploaded, stored, or seen by us.',
  alternates: {
    canonical: (process.env.NEXT_PUBLIC_URL ?? '') + '/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <>
    <div className="py-24 px-6 bg-background">
      <div className="container mx-auto max-w-3xl">
        <h1 className="font-display text-5xl text-foreground mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-12">Last updated: February 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-12">

          {/* The Short Version */}
          <section className="p-8 rounded-xl bg-accent/20 border border-primary/20">
            <h2 className="font-display text-3xl text-foreground mb-4">The short version</h2>
            <p className="text-foreground text-lg leading-relaxed">
              Quick QR is built on a simple principle: <strong>your files are yours.</strong>
              Nothing you edit in Quick QR is ever uploaded to our servers, stored on our systems,
              or seen by us. Everything runs inside your browser, on your own device.
            </p>
          </section>

          {/* How Your Files Are Handled */}
          <section>
            <h2 className="font-display text-3xl text-foreground mb-6">How your files are handled</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you open a PDF in Quick QR, the file is loaded directly into your browser using
              the Web File API. No bytes of that file are transmitted to any server — ours or anyone else&apos;s.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you add text, draw a signature, or make any other edit, those changes are applied
              locally using PDF.js and related browser-based libraries. Again: no server involved.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you click download, your edited PDF is generated in your browser and saved directly
              to your device — just like saving any other file. Nothing is routed through our infrastructure.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Your documents, signatures, and saved files are stored in your browser&apos;s local storage
              (IndexedDB). They are only accessible from the device and browser you used. They are not
              synced to any cloud. Clearing your browser data will remove them.
            </p>
          </section>

          {/* What We Do Collect */}
          <section>
            <h2 className="font-display text-3xl text-foreground mb-6">What we do collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Quick QR collects minimal, non-personal data to keep the service running and understand
              basic usage patterns:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">Basic analytics</strong> — page views, rough geographic region (country-level), browser type, and device category. This data is aggregated and contains no personally identifiable information.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">Error logs</strong> — if the editor encounters a technical error, we may log anonymised error information (no file content) to help fix bugs.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">Donation records</strong> — if you choose to make a donation, payment is handled by our payment processor (Stripe). We do not store your card details. We receive a record of the transaction amount and a non-reversible transaction ID.</span>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We do not collect names, email addresses, or account information from users of the free editor.
              We do not sell any data to third parties.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="font-display text-3xl text-foreground mb-6">Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Quick QR uses no advertising cookies and no cross-site tracking cookies.
              We may use a minimal session cookie if you create an optional account, purely to keep you
              signed in. Analytics data is collected without cookies where possible.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="font-display text-3xl text-foreground mb-6">Third-party services</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">Vercel</strong> — Quick QR is hosted on Vercel. Vercel receives standard web server logs (IP address, request path, timestamp) for infrastructure purposes. See Vercel&apos;s privacy policy for details.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">Stripe</strong> — optional donations are processed by Stripe. Your payment data is governed by Stripe&apos;s privacy policy.</span>
              </li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="font-display text-3xl text-foreground mb-6">Your rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Because we hold virtually no personal data about you, there is very little to request, correct,
              or delete. But if you have any questions or concerns about data we might hold, contact us at:
            </p>
            <a href="mailto:jayleaton@doriracers.com" className="text-primary hover:underline">
              jayleaton@doriracers.com
            </a>
          </section>

          {/* Changes */}
          <section>
            <h2 className="font-display text-3xl text-foreground mb-6">Changes to this policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this policy occasionally. The date at the top of this page will always reflect
              when it was last changed. We will never make changes that compromise the core privacy principle:
              your files are yours and they never leave your device.
            </p>
          </section>

        </div>
      </div>
    </div>
    <Footer />
    </>
  )
}
