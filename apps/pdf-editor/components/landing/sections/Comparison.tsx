import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { AppRoutes } from '@/lib/config/featureToggles'
import { useTranslations } from 'next-intl'

export function Comparison() {
  const t = useTranslations('pages.home.comparison')

  const rows = [
    { feature: t('row1Feature'), pure: true, others: true, pureText: t('row1Us'), othersText: t('row1Others') },
    { feature: t('row2Feature'), pure: true, others: true, pureText: t('row2Us'), othersText: t('row2Others') },
    { feature: t('row3Feature'), pure: true, others: false, pureText: t('row3Us'), othersText: t('row3Others'), highlight: true },
    { feature: t('row4Feature'), pure: false, others: "warn", pureText: t('row4Us'), othersText: t('row4Others') },
    { feature: t('row5Feature'), pure: false, others: "warn", pureText: t('row5Us'), othersText: t('row5Others') },
    { feature: t('row6Feature'), pure: true, others: false, pureText: t('row6Us'), othersText: t('row6Others') },
    { feature: t('row7Feature'), pure: false, others: "warn", pureText: t('row7Us'), othersText: t('row7Others') },
    { feature: t('row8Feature'), pure: false, others: "warn", pureText: t('row8Us'), othersText: t('row8Others') },
  ]

  return (
    <section className="py-24 bg-background px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <span className="text-primary font-medium tracking-wide text-sm uppercase">{t('label')}</span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">{t('title')}</h2>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-6 font-medium text-muted-foreground w-1/3">{t('colFeature')}</th>
                <th className="p-6 font-display text-xl text-primary bg-card border-x border-border w-1/3">{t('colUs')}</th>
                <th className="p-6 font-medium text-muted-foreground w-1/3">{t('colOthers')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={`border-b border-border last:border-0 ${row.highlight ? 'bg-accent/20' : ''}`}>
                  <td className="p-6 text-foreground font-medium">{row.feature}</td>

                  <td className="p-6 bg-card border-x border-border">
                    <div className="flex items-center gap-3">
                      {row.pure ? (
                        <Check className="w-5 h-5 text-primary shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground shrink-0" />
                      )}
                      <span className={row.highlight ? "font-bold text-primary" : "text-foreground"}>
                        {row.pureText}
                      </span>
                    </div>
                  </td>

                  <td className="p-6 text-muted-foreground">
                    <div className="flex items-center gap-3">
                      {row.others === true ? (
                        <Check className="w-5 h-5 text-muted-foreground shrink-0" />
                      ) : row.others === "warn" ? (
                        <span className="w-5 h-5 flex items-center justify-center text-amber-500 font-bold text-xs shrink-0">⚠️</span>
                      ) : (
                        <X className="w-5 h-5 text-destructive shrink-0" />
                      )}
                      <span className={row.others === false ? "text-destructive" : ""}>
                        {row.othersText}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-center text-muted-foreground max-w-3xl mx-auto">
          {t('note')}
        </p>
        <div className="mt-6 text-center">
          <Link href={AppRoutes.alternativesAdobeAcrobat} className="text-primary hover:underline text-sm font-medium">
            {t('compareLink')}
          </Link>
        </div>
      </div>
    </section>
  )
}
