'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function FAQ() {
  const t = useTranslations('pages.home.faq')

  const faqs = Array.from({ length: 9 }, (_, i) => ({
    q: t(`faq_q${i + 1}`),
    a: t(`faq_a${i + 1}`)
  }))

  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 bg-background px-6">
      <div className="container mx-auto max-w-3xl">
        <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-12">{t('title')}</h2>

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
