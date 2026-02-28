import Link from 'next/link'
import { AppRoutes } from '@/lib/config/featureToggles'
import { useTranslations } from 'next-intl'

export function FinalCTA() {
  const t = useTranslations('pages.home.finalCta')

  return (
    <section className="py-24 px-6 bg-background text-center">
      <div className="container mx-auto max-w-4xl">
        <h2 className="font-display text-5xl md:text-6xl text-foreground mb-6">
          {t('headline1')} <br />
          {t('headline2')}
        </h2>
        <p className="text-xl text-muted-foreground mb-10">
          {t('subtext')}
        </p>

        <div className="flex flex-col items-center gap-4">
          <Link
            href={AppRoutes.editor}
            className="bg-primary text-primary-foreground text-lg font-medium px-10 py-4 rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            {t('cta')}
          </Link>
          <span className="text-sm text-muted-foreground">{t('note')}</span>
        </div>
      </div>
    </section>
  )
}
