import { getTranslations } from 'next-intl/server'
import Container from '@/components/ui/Container'
import SectionHeading from '@/components/ui/SectionHeading'
import { DEPLOYMENT_PROVIDERS } from './constants'

export async function DeploymentProvidersSection() {
  const t = await getTranslations('pages.landing')

  return (
    <section className='py-16 md:py-24' aria-label='Deployment providers'>
      <Container>
        <SectionHeading
          eyebrow={t('deployments.eyebrow')}
          title={t('deployments.title')}
          subtitle={t('deployments.subtitle')}
        />
        <div className='mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {DEPLOYMENT_PROVIDERS.map(({ key, href, recommended }) => (
            <a
              key={key}
              href={href}
              target='_blank'
              rel='noopener noreferrer'
              className='group relative rounded-xl border border-neutral-300 bg-white p-6 shadow-sm backdrop-blur transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/80 dark:hover:border-neutral-700'
            >
              {recommended && (
                <span className='absolute right-3 top-3 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'>
                  {t('deployments.recommended')}
                </span>
              )}
              <h3 className='text-base font-semibold text-neutral-900 group-hover:text-blue-600 dark:text-neutral-100 dark:group-hover:text-blue-400'>
                {t(`deployments.providers.${key}.title`)}
              </h3>
              <p className='mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300'>
                {t(`deployments.providers.${key}.desc`)}
              </p>
            </a>
          ))}
        </div>
      </Container>
    </section>
  )
}
