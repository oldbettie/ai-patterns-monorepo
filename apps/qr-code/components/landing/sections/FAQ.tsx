'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

export function FAQ() {
  const faqs = [
    {
      q: "Is Quick QR really free?",
      a: "Yes. Generating QR codes for any content type and downloading them as PNG or SVG are completely free. No trial period, no credit card required, no subscription. We mean it."
    },
    {
      q: "Do I need to create an account?",
      a: "No. You can generate and download a QR code right now without signing up for anything. An optional account may be added in the future for saving history across devices, but the core generator will always be free and require no account."
    },
    {
      q: "Is my data uploaded to your servers?",
      a: "No. Everything runs inside your browser on your own device. The content you encode into QR codes is never sent to our servers. We don't see it, store it, or have any access to it."
    },
    {
      q: "Are there watermarks on downloaded QR codes?",
      a: "No. Your downloaded QR code is clean. No watermarks, no branding added to your files."
    },
    {
      q: "What QR code types can I generate?",
      a: "You can generate QR codes for URLs, WiFi networks (WPA2/WEP/open), vCard contacts, SMS messages, email addresses with subject and body, and plain text. More types may be added over time."
    },
    {
      q: "What download formats are available?",
      a: "You can download your QR code as a PNG (great for screens, presentations, and social media) or as an SVG (scalable vector format, perfect for print and high-resolution use)."
    },
    {
      q: "Does it work offline?",
      a: "Yes. Once you've loaded Quick QR in your browser, the generator works without an internet connection. Your QR code history is stored locally on your device."
    },
    {
      q: "Is Quick QR available on mobile?",
      a: "Yes. Quick QR works in any modern mobile browser on iOS and Android. You can even install it to your home screen for quick access."
    },
    {
      q: "How does Quick QR make money if it's free?",
      a: "Quick QR is sustained by optional donations from users who find it useful and want to support it. That's it. There are no hidden revenue streams that compromise your privacy."
    }
  ]

  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 bg-background px-6">
      <div className="container mx-auto max-w-3xl">
        <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-12">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-card rounded-xl border border-border overflow-hidden transition-all hover:border-primary/30"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-display text-xl text-foreground pr-8">{faq.q}</span>
                {openIndex === i ? (
                  <Minus className="w-5 h-5 text-primary shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-6 pt-0 text-muted-foreground leading-relaxed border-t border-transparent">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
              }
            }))
          })
        }}
      />
    </section>
  )
}
