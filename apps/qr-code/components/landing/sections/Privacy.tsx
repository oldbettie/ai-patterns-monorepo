import { Shield, Lock, EyeOff, Trash2, FileText } from 'lucide-react'

export function Privacy() {
  return (
    <section id="privacy" className="py-24 bg-[#141412] dark:bg-card text-[#F0EFE9] dark:text-foreground px-6">
      <div className="container mx-auto max-w-4xl text-center">
        <span className="text-primary font-medium tracking-wide text-sm uppercase">Privacy By Design</span>
        <h2 className="font-display text-4xl md:text-5xl text-white dark:text-foreground mt-3 mb-8">Your QR code data is none of our business.</h2>

        <div className="text-lg md:text-xl text-[#F0EFE9]/80 dark:text-muted-foreground leading-relaxed space-y-6 mb-12">
          <p>
            When you generate a QR code with WiFi passwords, personal contact info, or private URLs in most tools,
            you're sending that data to a stranger's server. You're trusting their security. Their staff.
            Their privacy policy buried in 8,000 words of legal text.
          </p>
          <p>
            Simplified QR works differently. All processing happens inside your own browser, on your own device.
            When you generate a QR code, the data never leaves your machine — it doesn't touch our servers because it never gets sent to them.
          </p>
          <p className="text-white dark:text-foreground font-medium">
            No account means no data to breach. No uploads mean no exposure. Simple.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {[
            { icon: Lock, text: "Zero data uploads" },
            { icon: Shield, text: "No account required" },
            { icon: EyeOff, text: "No tracking of content" },
            { icon: Trash2, text: "Clear local data anytime" },
            { icon: FileText, text: "Open about how it works" }
          ].map((item, i) => (
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
