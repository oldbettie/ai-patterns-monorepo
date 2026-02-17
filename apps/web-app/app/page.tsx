import Link from 'next/link'
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
    <main className='relative min-h-screen overflow-x-hidden bg-background text-foreground'>
      {/* Background layers */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1000px_500px_at_50%_-200px,var(--color-neutral-200),transparent)] opacity-20 dark:opacity-10'
      />

      {/* Hero */}
      <section className='pt-28 pb-16 md:pt-36 md:pb-24'>
        <Container className='text-center' aria-label='Hero'>
          <div className='inline-flex items-center rounded-full border border-border bg-background/50 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur'>
            {t('badge')}
          </div>
          <h1 className='mt-5 text-4xl font-semibold tracking-tight md:text-6xl'>
            {t('hero.title')}
          </h1>
          <p className='mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg'>
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

          {/* Placeholder product preview */}
          <div className='mt-12 rounded-2xl border border-border bg-card p-2 shadow-sm backdrop-blur'>
            <div className='aspect-[16/9] w-full rounded-xl bg-muted/50' />
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
              { title: t('sections.value.items.patterns.title'), desc: t('sections.value.items.patterns.desc') },
              { title: t('sections.value.items.typeSafety.title'), desc: t('sections.value.items.typeSafety.desc') },
              { title: t('sections.value.items.maintainable.title'), desc: t('sections.value.items.maintainable.desc') },
            ].map((f, i) => (
              <div
                key={i}
                className='rounded-xl border border-border bg-card p-6 shadow-sm'
              >
                <h3 className='text-base font-semibold'>{f.title}</h3>
                <p className='mt-2 text-muted-foreground text-sm leading-relaxed'>{f.desc}</p>
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
                  className='rounded-xl border border-border bg-card p-6 shadow-sm'
                >
                  <div className='text-xs text-muted-foreground'>0{i + 1}</div>
                  <p className='mt-2 text-foreground'>{step}</p>
                </div>
              ),
            )}
          </div>
        </Container>
      </section>

      {/* Pricing CTA */}
      <section className='py-16 md:py-24' aria-label='Pricing'>
        <Container>
          <div className='rounded-2xl border border-border bg-card p-8 shadow-sm md:p-12'>
            <div className='mx-auto max-w-2xl text-center'>
              <h3 className='text-2xl font-semibold'>{t('pricing.title')}</h3>
              <p className='mt-2 text-muted-foreground'>{t('pricing.subtitle')}</p>
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
        <Container className='flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row'>
          <span>&copy; {new Date().getFullYear()} {t('footer.brand')}</span>
          <div className='flex items-center gap-4'>
            <Link href='/why' className='text-primary hover:underline underline-offset-4'>
              {t('footer.whyLink')}
            </Link>
            <Link href='/login' className='text-primary hover:underline underline-offset-4'>
              {t('footer.login')}
            </Link>
            <Link href='/signup' className='text-primary hover:underline underline-offset-4'>
              {t('footer.signup')}
            </Link>
          </div>
        </Container>
      </footer>
    </main>
  )
}
