import { getTranslations } from 'next-intl/server'
import Container from '@/components/ui/Container'
import SectionHeading from '@/components/ui/SectionHeading'

export async function PreSetupSection() {
  const t = await getTranslations('pages.landing')

  return (
    <section className='py-16 md:py-24' aria-label='Required providers'>
      <Container>
        <SectionHeading
          eyebrow={t('preSteps.eyebrow')}
          title={t('preSteps.title')}
          subtitle={t('preSteps.subtitle')}
        />
        <div className='mt-10 grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div className='rounded-xl border border-neutral-300 bg-white p-6 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80'>
            <h3 className='text-base font-semibold text-neutral-900 dark:text-neutral-100'>
              {t('preSteps.database.title')}
            </h3>
            <p className='mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300'>
              {t('preSteps.database.desc')}
            </p>
            <p className='mt-3 text-xs text-neutral-500 dark:text-neutral-400'>
              {t('preSteps.database.tip')}
            </p>
            <div className='mt-4 flex gap-3'>
              <a
                href='https://neon.tech'
                target='_blank'
                rel='noopener noreferrer'
                className='text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300'
              >
                Neon →
              </a>
              <a
                href='https://supabase.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300'
              >
                Supabase →
              </a>
            </div>
          </div>
          <div className='rounded-xl border border-neutral-300 bg-white p-6 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80'>
            <h3 className='text-base font-semibold text-neutral-900 dark:text-neutral-100'>
              {t('preSteps.email.title')}
            </h3>
            <p className='mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300'>
              {t('preSteps.email.desc')}
            </p>
            <p className='mt-3 text-xs text-neutral-500 dark:text-neutral-400'>
              {t('preSteps.email.tip')}
            </p>
            <div className='mt-4'>
              <a
                href='https://resend.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300'
              >
                Resend →
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
