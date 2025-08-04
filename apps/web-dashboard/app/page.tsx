import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth/auth'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import SectionHeading from '../components/ui/SectionHeading'
import { getTranslations } from 'next-intl/server'

export default async function Home() {
  // Check if user is already authenticated
  const session = await auth.api.getSession({ headers: await headers() })
  
  // If authenticated, redirect to dashboard
  if (session) {
    redirect('/dashboard')
  }

  const t = await getTranslations('pages.landing')

  return (
    <main className='relative min-h-screen overflow-x-hidden'>
      {/* Background layers using Tailwind color utilities */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1000px_500px_at_50%_-200px,rgba(0,0,0,0.03),transparent)] dark:bg-[radial-gradient(1200px_600px_at_50%_-100px,rgba(255,255,255,0.06),transparent_60%)]'
      />

      {/* Hero */}
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
          </div>

          {/* Placeholder product preview */}
          <div className='mt-12 rounded-2xl border border-neutral-300 bg-white p-2 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80'>
            <div className='aspect-[16/9] w-full rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900' />
          </div>
        </Container>
      </section>

      {/* Value props */}
      <section className='py-16 md:py-24' aria-label='Value propositions'>
        <Container>
          <SectionHeading
            eyebrow={t('sections.value.eyebrow')}
            title={t('sections.value.title')}
            subtitle={t('sections.value.subtitle')}
          />
          <div className='mt-10 grid grid-cols-1 gap-6 md:grid-cols-3'>
            {[
              { title: t('sections.value.items.privacy.title'), desc: t('sections.value.items.privacy.desc') },
              { title: t('sections.value.items.performance.title'), desc: t('sections.value.items.performance.desc') },
              { title: t('sections.value.items.family.title'), desc: t('sections.value.items.family.desc') },
            ].map((f, i) => (
              <div
                key={i}
                className='rounded-xl border border-neutral-300 bg-white p-6 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80'
              >
                <h3 className='text-base font-semibold text-neutral-900 dark:text-neutral-100'>{f.title}</h3>
                <p className='mt-2 text-neutral-600 text-sm leading-relaxed dark:text-neutral-300'>{f.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className='py-16 md:py-24' aria-label='How it works'>
        <Container>
          <SectionHeading
            eyebrow={t('sections.how.eyebrow')}
            title={t('sections.how.title')}
            subtitle={t('sections.how.subtitle')}
          />
          <div className='mt-10 grid grid-cols-1 gap-6 md:grid-cols-3'>
            {[t('sections.how.steps.1'), t('sections.how.steps.2'), t('sections.how.steps.3')].map(
              (step, i) => (
                <div
                  key={i}
                  className='rounded-xl border border-neutral-300 bg-white p-6 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80'
                >
                  <div className='text-xs text-neutral-600 dark:text-neutral-400'>0{i + 1}</div>
                  <p className='mt-2 text-neutral-800 dark:text-neutral-300'>{step}</p>
                </div>
              ),
            )}
          </div>
        </Container>
      </section>

      {/* Pricing CTA */}
      <section className='py-16 md:py-24' aria-label='Pricing'>
        <Container>
          <div className='rounded-2xl border border-neutral-300 bg-white p-8 shadow-sm backdrop-blur md:p-12 dark:border-neutral-800 dark:bg-neutral-900/80'>
            <div className='mx-auto max-w-2xl text-center'>
              <h3 className='text-2xl font-semibold text-neutral-900 dark:text-neutral-100'>{t('pricing.title')}</h3>
              <p className='mt-2 text-neutral-600 dark:text-neutral-300'>{t('pricing.subtitle')}</p>
              <div className='mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center'>
                <Button href='/signup'>{t('pricing.primary')}</Button>
                <Button href='/login' variant='secondary'>
                  {t('pricing.secondary')}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className='pb-10 pt-6' role='contentinfo'>
        <Container className='flex flex-col items-center justify-between gap-4 text-sm text-neutral-600 md:flex-row dark:text-neutral-500'>
          <span>&copy; {new Date().getFullYear()} Family Privacy Proxy</span>
          <div className='flex items-center gap-4'>
            <Link href='/login' className='text-blue-600 hover:text-blue-600/90 dark:text-blue-400 dark:hover:text-blue-300'>
              {t('footer.login')}
            </Link>
            <Link href='/signup' className='text-blue-600 hover:text-blue-600/90 dark:text-blue-400 dark:hover:text-blue-300'>
              {t('footer.signup')}
            </Link>
          </div>
        </Container>
      </footer>
    </main>
  )
}
