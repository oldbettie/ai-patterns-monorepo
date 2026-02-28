import { PenTool, Briefcase, FileCheck, UserPlus, FileSignature, GraduationCap, ClipboardCheck, FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function UseCases() {
  const t = useTranslations('pages.home.useCases')

  const cases = [
    { icon: PenTool, text: t('case1') },
    { icon: Briefcase, text: t('case2') },
    { icon: ClipboardCheck, text: t('case3') },
    { icon: UserPlus, text: t('case4') },
    { icon: FileSignature, text: t('case5') },
    { icon: FileText, text: t('case6') },
    { icon: GraduationCap, text: t('case7') },
    { icon: FileCheck, text: t('case8') },
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
