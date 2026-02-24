import { getTranslations } from 'next-intl/server'
import Container from '@/components/ui/Container'
import SectionHeading from '@/components/ui/SectionHeading'
import { TECH_STACK } from './constants'

export async function TechStackSection() {
  const t = await getTranslations('pages.landing')

  return (
    <section className='py-12 md:py-16' aria-label='Tech stack'>
      <Container>
        <SectionHeading
          eyebrow={t('techStack.eyebrow')}
          title={t('techStack.title')}
        />
        <div className='mt-8 flex flex-wrap justify-center gap-3'>
          {TECH_STACK.map((tech) => (
            <span
              key={tech}
              className='rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
            >
              {tech}
            </span>
          ))}
        </div>
      </Container>
    </section>
  )
}
