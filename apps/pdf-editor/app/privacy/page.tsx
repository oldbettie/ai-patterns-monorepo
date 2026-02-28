import { Footer } from '@/components/landing/sections/Footer'
import { useTranslations } from 'next-intl'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'SimplifiedPDF is built on a simple principle: your files are yours. Nothing you edit is ever uploaded, stored, or seen by us.',
  alternates: {
    canonical: 'https://www.simplifiedpdf.com/privacy',
  },
}

export default function PrivacyPage() {
  const t = useTranslations('pages.privacy')

  return (
    <>
    <div className="py-24 px-6 bg-background">
      <div className="container mx-auto max-w-3xl">
        <h1 className="font-display text-5xl text-foreground mb-4">{t('title')}</h1>
        <p className="text-muted-foreground mb-12">{t('lastUpdated')}</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-12">

          {/* The Short Version */}
          <section className="p-8 rounded-xl bg-accent/20 border border-primary/20">
            <h2 className="font-display text-3xl text-foreground mb-4">{t('shortVersionTitle')}</h2>
            <p className="text-foreground text-lg leading-relaxed">
              {t('shortVersionBefore')}<strong>{t('shortVersionBold')}</strong>{t('shortVersionAfter')}
            </p>
          </section>

          {/* How Your Files Are Handled */}
          <section>
            <h2 className="font-display text-3xl text-foreground mb-6">{t('filesTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t('filesP1')}</p>
            <p className="text-muted-foreground leading-relaxed mb-4">{t('filesP2')}</p>
            <p className="text-muted-foreground leading-relaxed mb-4">{t('filesP3')}</p>
            <p className="text-muted-foreground leading-relaxed">{t('filesP4')}</p>
          </section>

          {/* What We Do Collect */}
          <section>
            <h2 className="font-display text-3xl text-foreground mb-6">{t('collectTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t('collectIntro')}</p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">{t('collectItem1Label')}</strong>{t('collectItem1Desc')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">{t('collectItem2Label')}</strong>{t('collectItem2Desc')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">{t('collectItem3Label')}</strong>{t('collectItem3Desc')}</span>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">{t('collectOutro')}</p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="font-display text-3xl text-foreground mb-6">{t('cookiesTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('cookiesText')}</p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="font-display text-3xl text-foreground mb-6">{t('thirdPartyTitle')}</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">{t('thirdParty1Label')}</strong>{t('thirdParty1Desc')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">{t('thirdParty2Label')}</strong>{t('thirdParty2Desc')}</span>
              </li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="font-display text-3xl text-foreground mb-6">{t('rightsTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t('rightsText')}</p>
            <a href="mailto:jayleaton@doriracers.com" className="text-primary hover:underline">
              jayleaton@doriracers.com
            </a>
          </section>

          {/* Changes */}
          <section>
            <h2 className="font-display text-3xl text-foreground mb-6">{t('changesTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('changesText')}</p>
          </section>

        </div>
      </div>
    </div>
    <Footer />
    </>
  )
}
