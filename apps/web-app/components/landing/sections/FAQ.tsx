'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

export function FAQ() {
  const faqs = [
    {
      q: "Is SimplifiedPDF really free?",
      a: "Yes. Editing PDFs, adding text, drawing signatures, and downloading your finished documents are all completely free. No trial period, no credit card required, no subscription. We mean it."
    },
    {
      q: "Do I need to create an account?",
      a: "No. You can start editing a PDF right now without signing up for anything. An optional account may be added in the future for features like syncing documents across devices, but the core editor will always be free and always require no account."
    },
    {
      q: "Are my documents uploaded to your servers?",
      a: "No. Everything runs inside your browser on your own device. Your PDF files are never sent to our servers. We don't see them, store them, or have any access to them. Not even temporarily."
    },
    {
      q: "Is there a watermark on downloaded files?",
      a: "No. Your downloaded PDF is clean. No watermarks, no branding added to your documents."
    },
    {
      q: "What can I do with SimplifiedPDF?",
      a: "You can add text anywhere on a PDF page, draw and save signatures, place signatures on documents, manage your edited documents locally, and download the finished PDF. More features will be added over time."
    },
    {
      q: "Does it work offline?",
      a: "Yes. Once you've loaded SimplifiedPDF in your browser, it works without an internet connection. Your documents and signatures are stored locally on your device."
    },
    {
      q: "What happens to my documents if I clear my browser data?",
      a: "Your documents are stored in your browser's local storage. If you clear your browser data, those files will be removed. We recommend downloading any important documents to your device after editing."
    },
    {
      q: "Is SimplifiedPDF available on mobile?",
      a: "Yes. SimplifiedPDF works in any modern mobile browser on iOS and Android. You can even install it to your home screen for quick access."
    },
    {
      q: "How does SimplifiedPDF make money if it's free?",
      a: "SimplifiedPDF is sustained by optional donations from users who find it useful and want to support it. That's it. Donors get an ad-free experience. There are no hidden revenue streams that compromise your privacy or your downloads."
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
