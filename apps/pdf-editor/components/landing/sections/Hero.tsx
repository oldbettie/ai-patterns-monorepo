import Link from 'next/link'
import { AppRoutes } from '@/lib/config/featureToggles'
import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function Hero() {
  const t = useTranslations('pages.home.hero')
  const badges = [t('badge1'), t('badge2'), t('badge3'), t('badge4')]

  return (
    <section className="pt-12 pb-16 md:pt-20 md:pb-32 px-6">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="font-display text-5xl md:text-7xl text-foreground leading-[1.1] mb-6">
          {t('headline1')} <br className="hidden md:block" />
          <span className="text-primary">{t('headline2')}</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          {t('description')}
        </p>

        <div className="flex flex-col items-center gap-4 mb-12">
          <Link
            href={AppRoutes.editor}
            className="bg-primary text-primary-foreground text-lg font-medium px-8 py-4 rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            {t('cta')}
          </Link>
          <span className="text-sm text-muted-foreground">{t('subtext')}</span>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium text-foreground">
          {badges.map((text) => (
            <div key={text} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
