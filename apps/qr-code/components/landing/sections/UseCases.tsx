import { Link2, Wifi, Contact, UtensilsCrossed, Building2, ShoppingBag, GraduationCap, Newspaper } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function UseCases() {
  const t = useTranslations('pages.home.useCases')

  const cases = [
    { icon: Link2, text: t('case1') },
    { icon: Wifi, text: t('case2') },
    { icon: Contact, text: t('case3') },
    { icon: UtensilsCrossed, text: t('case4') },
    { icon: Building2, text: t('case5') },
    { icon: ShoppingBag, text: t('case6') },
    { icon: GraduationCap, text: t('case7') },
    { icon: Newspaper, text: t('case8') },
  ]

  return (
    <section className="py-24 bg-card/50 px-6">
      <div className="container mx-auto max-w-5xl text-center">
        <h2 className="font-display text-3xl md:text-4xl text-foreground mb-12">{t('title')}</h2>

        <div className="flex flex-wrap justify-center gap-4">
          {cases.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-6 py-3 rounded-full bg-background border border-border text-foreground hover:border-primary/50 hover:bg-accent/20 transition-all cursor-default"
            >
              <item.icon className="w-4 h-4 text-primary" />
              <span className="font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
