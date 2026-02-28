import { Type, Settings, Download } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function HowItWorks() {
  const t = useTranslations('pages.home.howItWorks')

  const steps = [
    {
      icon: Type,
      title: t('step1Title'),
      desc: [t('step1Desc1'), t('step1Desc2'), t('step1Desc3')]
    },
    {
      icon: Settings,
      title: t('step2Title'),
      desc: [t('step2Desc1'), t('step2Desc2'), t('step2Desc3')]
    },
    {
      icon: Download,
      title: t('step3Title'),
      desc: [t('step3Desc1'), t('step3Desc2'), t('step3Desc3')]
    }
  ]

  return (
    <section id="how-it-works" className="py-24 bg-background px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-primary font-medium tracking-wide text-sm uppercase">{t('label')}</span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">{t('title')}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-border -z-10" />

          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center bg-background">
              <div className="w-24 h-24 bg-card rounded-2xl border border-border shadow-sm flex items-center justify-center mb-6 relative z-10">
                <step.icon className="w-10 h-10 text-primary" strokeWidth={1.5} />
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
              </div>
              <h3 className="font-display text-2xl text-foreground mb-4">{step.title}</h3>
              <div className="text-muted-foreground space-y-1">
                {step.desc.map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
