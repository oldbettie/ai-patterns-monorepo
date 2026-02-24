import { getTranslations } from 'next-intl/server'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'

export async function HeroSection() {
  const t = await getTranslations('pages.landing')

  return (
    <section className='pt-28 pb-16 md:pt-36 md:pb-24'>
      <Container className='text-center' aria-label='Hero'>
        <div className='inline-flex items-center rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-600 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-300'>
          {t('badge')}
        </div>
        <h1 className='mt-5 text-neutral-900 text-4xl font-semibold tracking-tight md:text-6xl dark:text-neutral-50'>
          {t('hero.title')}
        </h1>
        <p className='mx-auto mt-4 max-w-2xl text-neutral-700 md:text-lg dark:text-neutral-300'>
          {t('hero.subtitle')}
        </p>
        <div className='mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center'>
          <Button href='/signup'>{t('cta.getStarted')}</Button>
          <Button href='/login' variant='secondary'>
            {t('cta.signIn')}
          </Button>
          <Button href='/why' variant='ghost'>
            {t('hero.learnMore')}
          </Button>
        </div>
      </Container>
    </section>
  )
}
