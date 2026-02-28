import { Shield, Lock, EyeOff, Trash2, FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function Privacy() {
  const t = useTranslations('pages.home.privacy')

  const badges = [
    { icon: Lock, text: t('badge1') },
    { icon: Shield, text: t('badge2') },
    { icon: EyeOff, text: t('badge3') },
    { icon: Trash2, text: t('badge4') },
    { icon: FileText, text: t('badge5') }
  ]

  return (
    <section id="privacy" className="py-24 bg-[#141412] dark:bg-card text-[#F0EFE9] dark:text-foreground px-6">
      <div className="container mx-auto max-w-4xl text-center">
        <span className="text-primary font-medium tracking-wide text-sm uppercase">{t('label')}</span>
        <h2 className="font-display text-4xl md:text-5xl text-white dark:text-foreground mt-3 mb-8">{t('title')}</h2>

        <div className="text-lg md:text-xl text-[#F0EFE9]/80 dark:text-muted-foreground leading-relaxed space-y-6 mb-12">
          <p>{t('para1')}</p>
          <p>{t('para2')}</p>
          <p className="text-white dark:text-foreground font-medium">{t('para3')}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {badges.map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/5 dark:bg-accent/10 px-4 py-2 rounded-full text-sm font-medium border border-white/10 dark:border-border">
              <item.icon className="w-4 h-4 text-primary" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
