import { getTranslations } from 'next-intl/server'
import Container from '@/components/ui/Container'
import SectionHeading from '@/components/ui/SectionHeading'

const AI_STRATEGY_ITEMS = ['tags', 'skills', 'context'] as const

export async function AiStrategySection() {
  const t = await getTranslations('pages.landing')

  return (
    <section className='py-16 md:py-24' aria-label='AI development strategy'>
      <Container>
        <SectionHeading
          eyebrow={t('aiStrategy.eyebrow')}
          title={t('aiStrategy.title')}
          subtitle={t('aiStrategy.subtitle')}
        />
        <div className='mt-10 grid grid-cols-1 gap-6 md:grid-cols-3'>
          {AI_STRATEGY_ITEMS.map((item) => (
            <div
              key={item}
              className='rounded-xl border border-neutral-300 bg-white p-6 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80'
            >
              <p className='mb-3 font-mono text-xs text-neutral-400 dark:text-neutral-500'>
                {t(`aiStrategy.items.${item}.tag`)}
              </p>
              <h3 className='text-base font-semibold text-neutral-900 dark:text-neutral-100'>
                {t(`aiStrategy.items.${item}.title`)}
              </h3>
              <p className='mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300'>
                {t(`aiStrategy.items.${item}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
