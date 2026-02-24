import { getTranslations } from 'next-intl/server'
import Container from '@/components/ui/Container'
import SectionHeading from '@/components/ui/SectionHeading'

export async function ValuePropsSection() {
  const t = await getTranslations('pages.landing')

  return (
    <section className='py-16 md:py-24' aria-label='Why this template'>
      <Container>
        <SectionHeading
          eyebrow={t('value.eyebrow')}
          title={t('value.title')}
          subtitle={t('value.subtitle')}
        />
        <div className='mt-10 grid grid-cols-1 gap-6 md:grid-cols-3'>
          {(['patterns', 'typeSafety', 'maintainable'] as const).map((key) => (
            <div
              key={key}
              className='rounded-xl border border-neutral-300 bg-white p-6 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80'
            >
              <h3 className='text-base font-semibold text-neutral-900 dark:text-neutral-100'>
                {t(`value.items.${key}.title`)}
              </h3>
              <p className='mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300'>
                {t(`value.items.${key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
