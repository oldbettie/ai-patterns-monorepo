import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { AppRoutes } from '@/lib/config/featureToggles'

export function Comparison() {
  const rows = [
    { feature: "Edit PDFs", pure: true, others: true, pureText: "Free", othersText: "Free" },
    { feature: "Add Signatures", pure: true, others: true, pureText: "Free", othersText: "Free" },
    { feature: "Download Edited File", pure: true, others: false, pureText: "Always Free", othersText: "Requires subscription", highlight: true },
    { feature: "Signup Required", pure: false, others: "warn", pureText: "Never", othersText: "Usually required" },
    { feature: "Files Uploaded to Server", pure: false, others: "warn", pureText: "Never", othersText: "Usually yes" },
    { feature: "Works Offline", pure: true, others: false, pureText: "Yes", othersText: "Rarely" },
    { feature: "Watermark on Download", pure: false, others: "warn", pureText: "Never", othersText: "Often yes" },
    { feature: "Monthly Fee", pure: false, others: "warn", pureText: "None", othersText: "£8–£25/month" },
  ]

  return (
    <section className="py-24 bg-background px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <span className="text-primary font-medium tracking-wide text-sm uppercase">Why We Exist</span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">Why most "free" PDF editors aren't actually free</h2>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-6 font-medium text-muted-foreground w-1/3">Feature</th>
                <th className="p-6 font-display text-xl text-primary bg-card border-x border-border w-1/3">SimplifiedPDF</th>
                <th className="p-6 font-medium text-muted-foreground w-1/3">Most Others</th>
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
          We built SimplifiedPDF because we got tired of the same bait-and-switch. You search for "free PDF editor",
          you find one, you do the work, you click download — and suddenly it's $12 a month. That's not free.
          That's a demo with extra steps. SimplifiedPDF will always let you download your files for free.
        </p>
        <div className="mt-6 text-center">
          <Link href={AppRoutes.alternativesAdobeAcrobat} className="text-primary hover:underline text-sm font-medium">
            See full comparison vs. Adobe Acrobat →
          </Link>
        </div>
      </div>
    </section>
  )
}
