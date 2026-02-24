import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import Container from '@/components/ui/Container'

export async function LandingFooter() {
  const t = await getTranslations('pages.landing')

  return (
    <footer className='pb-10 pt-6' role='contentinfo'>
      <Container className='flex flex-col items-center justify-between gap-4 text-sm text-neutral-600 md:flex-row dark:text-neutral-500'>
        <span>&copy; {new Date().getFullYear()} {t('footer.brand')}</span>
        <div className='flex items-center gap-4'>
          <Link href='/why' className='text-blue-600 hover:text-blue-600/90 dark:text-blue-400 dark:hover:text-blue-300'>
            {t('footer.whyLink')}
          </Link>
          <Link href='/login' className='text-blue-600 hover:text-blue-600/90 dark:text-blue-400 dark:hover:text-blue-300'>
            {t('footer.login')}
          </Link>
          <Link href='/signup' className='text-blue-600 hover:text-blue-600/90 dark:text-blue-400 dark:hover:text-blue-300'>
            {t('footer.signup')}
          </Link>
        </div>
      </Container>
    </footer>
  )
}
