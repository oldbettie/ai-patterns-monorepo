import { Check, X } from 'lucide-react'

export function Comparison() {
  const rows = [
    { feature: "Generate QR Codes", pure: true, others: true, pureText: "Free", othersText: "Free" },
    { feature: "Download QR Code", pure: true, others: false, pureText: "Always Free", othersText: "Requires subscription", highlight: true },
    { feature: "SVG Export", pure: true, others: false, pureText: "Always Free", othersText: "Paid plan only", highlight: true },
    { feature: "Signup Required", pure: false, others: "warn", pureText: "Never", othersText: "Usually required" },
    { feature: "Data Uploaded to Server", pure: false, others: "warn", pureText: "Never", othersText: "Usually yes" },
    { feature: "Works Offline", pure: true, others: false, pureText: "Yes", othersText: "Rarely" },
    { feature: "Watermark on Download", pure: false, others: "warn", pureText: "Never", othersText: "Often yes" },
    { feature: "Monthly Fee", pure: false, others: "warn", pureText: "None", othersText: "£8–£25/month" },
  ]

  return (
    <section className="py-24 bg-background px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <span className="text-primary font-medium tracking-wide text-sm uppercase">Why We Exist</span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">Why most "free" QR generators aren't actually free</h2>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-6 font-medium text-muted-foreground w-1/3">Feature</th>
                <th className="p-6 font-display text-xl text-primary bg-card border-x border-border w-1/3">Simplified QR</th>
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
          We built Simplified QR because we got tired of the same bait-and-switch. You search for "free QR code generator",
          you find one, you customise it, you click download — and suddenly it's $12 a month or it adds a watermark.
          That's not free. Simplified QR will always let you download your QR codes for free.
        </p>
      </div>
    </section>
  )
}
