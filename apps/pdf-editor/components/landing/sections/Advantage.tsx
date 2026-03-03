import { Zap, ShieldCheck, Banknote } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function Advantage() {
  const t = useTranslations('pages.home.advantage')

  const advantages = [
    {
      icon: Zap,
      title: t('advantage1Title'),
      desc: t('advantage1Desc')
    },
    {
      icon: ShieldCheck,
      title: t('advantage2Title'),
      desc: t('advantage2Desc')
    },
    {
      icon: Banknote,
      title: t('advantage3Title'),
      desc: t('advantage3Desc')
    }
  ]

  return (
    <section className="py-24 bg-background px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-primary font-medium tracking-wide text-sm uppercase">{t('label')}</span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">{t('title')}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {advantages.map((adv, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <adv.icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-4">{adv.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {adv.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
