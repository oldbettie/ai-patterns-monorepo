import Link from 'next/link'
import { AppRoutes, ExternalLinks } from '@/lib/config/featureToggles'
import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('pages.home.footer')

  return (
    <footer className="bg-[#141412] dark:bg-card text-[#F0EFE9] dark:text-foreground py-16 px-6 border-t border-white/10 dark:border-border">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <Link href="/" className="font-display text-2xl text-white dark:text-foreground mb-4 block">
              {t('brand')}
            </Link>
            <p className="text-[#F0EFE9]/60 dark:text-muted-foreground max-w-sm mb-6">
              {t('tagline')}
            </p>
            <div className="flex gap-4">
              <Link href={AppRoutes.generate} className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                {t('generateQR')}
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-white dark:text-foreground mb-4">{t('productTitle')}</h4>
            <ul className="space-y-3 text-[#F0EFE9]/60 dark:text-muted-foreground text-sm">
              <li><Link href="#how-it-works" className="hover:text-white dark:hover:text-foreground transition-colors">{t('howItWorks')}</Link></li>
              <li><Link href="#features" className="hover:text-white dark:hover:text-foreground transition-colors">{t('features')}</Link></li>
              <li><Link href={AppRoutes.generate} className="hover:text-white dark:hover:text-foreground transition-colors">{t('qrGenerator')}</Link></li>
              <li><a href={ExternalLinks.pdfApp} className="hover:text-white dark:hover:text-foreground transition-colors">{t('simplifiedPDF')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white dark:text-foreground mb-4">{t('supportTitle')}</h4>
            <ul className="space-y-3 text-[#F0EFE9]/60 dark:text-muted-foreground text-sm">
              <li><Link href="#faq" className="hover:text-white dark:hover:text-foreground transition-colors">{t('faq')}</Link></li>
              <li><Link href={AppRoutes.privacy} className="hover:text-white dark:hover:text-foreground transition-colors">{t('privacyPolicy')}</Link></li>
              <li><a href="mailto:hello@simplifiedqr.com" className="hover:text-white dark:hover:text-foreground transition-colors">{t('contact')}</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 dark:border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#F0EFE9]/40 dark:text-muted-foreground">
          <div>
            {t('copyright')}
          </div>
          <div className="flex gap-6">
            <Link href={AppRoutes.privacy} className="hover:text-white dark:hover:text-foreground transition-colors">{t('privacy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
