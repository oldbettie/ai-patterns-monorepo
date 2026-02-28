import { useTranslations } from 'next-intl'

export function WhyWeExist() {
  const t = useTranslations('pages.home.whyWeExist')

  return (
    <section className="py-20 bg-[#141412] dark:bg-card text-[#F0EFE9] dark:text-foreground px-6">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl md:text-4xl text-[#F0EFE9] dark:text-foreground mb-8">{t('title')}</h2>
        <div className="space-y-6 text-xl md:text-2xl leading-relaxed font-light">
          <p>
            {t('problem')}
          </p>
          <p className="opacity-80">
            {t('detail')}
          </p>
          <p className="font-display text-2xl md:text-3xl font-semibold text-primary-foreground dark:text-primary pt-4 border-l-4 border-primary pl-6 text-left">
            {t('solution')}
          </p>
          <p className="opacity-80 text-sm pt-8">
            {t('note')}
          </p>
        </div>
      </div>
    </section>
  )
}
