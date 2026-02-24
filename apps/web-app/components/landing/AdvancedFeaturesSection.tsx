import { getTranslations } from 'next-intl/server'
import Container from '@/components/ui/Container'
import SectionHeading from '@/components/ui/SectionHeading'
import { ADVANCED_ITEMS } from './constants'

export async function AdvancedFeaturesSection() {
  const t = await getTranslations('pages.landing')

  return (
    <section className='py-16 md:py-24' aria-label='Advanced features'>
      <Container>
        <SectionHeading
          eyebrow={t('advanced.eyebrow')}
          title={t('advanced.title')}
          subtitle={t('advanced.subtitle')}
        />
        <div className='mt-10 grid grid-cols-1 gap-6 md:grid-cols-3'>
          {ADVANCED_ITEMS.map((item) => (
            <div
              key={item}
              className='rounded-xl border border-neutral-300 bg-white p-6 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80'
            >
              <h3 className='text-base font-semibold text-neutral-900 dark:text-neutral-100'>
                {t(`advanced.items.${item}.title`)}
              </h3>
              <p className='mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300'>
                {t(`advanced.items.${item}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
