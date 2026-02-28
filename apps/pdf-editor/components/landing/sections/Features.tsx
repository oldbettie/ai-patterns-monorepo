import Link from 'next/link'
import { Type, PenLine, FolderOpen, WifiOff, ShieldCheck, Download } from 'lucide-react'
import { AppRoutes } from '@/lib/config/featureToggles'
import { useTranslations } from 'next-intl'

export function Features() {
  const t = useTranslations('pages.home.features')

  const features = [
    {
      icon: Type,
      title: t('feature1Title'),
      desc: t('feature1Desc')
    },
    {
      icon: PenLine,
      title: t('feature2Title'),
      desc: t('feature2Desc'),
      link: AppRoutes.signPdf,
      linkText: t('feature2Link')
    },
    {
      icon: FolderOpen,
      title: t('feature3Title'),
      desc: t('feature3Desc')
    },
    {
      icon: WifiOff,
      title: t('feature4Title'),
      desc: t('feature4Desc')
    },
    {
      icon: ShieldCheck,
      title: t('feature5Title'),
      desc: t('feature5Desc'),
      highlight: true
    },
    {
      icon: Download,
      title: t('feature6Title'),
      desc: t('feature6Desc'),
      highlight: true
    }
  ]

  return (
    <section id="features" className="py-24 bg-card/50 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-primary font-medium tracking-wide text-sm uppercase">{t('label')}</span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">{t('title')}</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`p-8 rounded-xl border transition-all hover:shadow-md ${
                feature.highlight
                  ? "bg-accent/30 border-primary/20"
                  : "bg-card border-border"
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${
                feature.highlight ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}>
                <feature.icon className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                {feature.desc}
              </p>
              {'link' in feature && feature.link && (
                <Link href={feature.link} className="mt-4 inline-block text-sm text-primary hover:underline">
                  {feature.linkText}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
