import { getTranslations } from 'next-intl/server'
import Container from '@/components/ui/Container'
import SectionHeading from '@/components/ui/SectionHeading'

export async function SetupStepsSection() {
  const t = await getTranslations('pages.landing')

  return (
    <section
      className='py-16 md:py-24 bg-neutral-50 dark:bg-neutral-900/50'
      aria-label='Setup steps'
    >
      <Container>
        <SectionHeading
          eyebrow={t('setup.eyebrow')}
          title={t('setup.title')}
          subtitle={t('setup.subtitle')}
        />
        <ol className='mt-12 space-y-4'>
          {(['1', '2', '3', '4'] as const).map((n, i) => (
            <li
              key={n}
              className='flex items-start gap-6 rounded-2xl border border-neutral-200 bg-white px-6 py-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900'
            >
              <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white dark:bg-blue-500'>
                {i + 1}
              </span>
              <p className='pt-1.5 text-base leading-relaxed text-neutral-800 dark:text-neutral-200'>
                {t(`setup.steps.${n}`)}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
