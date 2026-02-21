import Link from 'next/link'
import { Type, PenLine, FolderOpen, WifiOff, ShieldCheck, Download } from 'lucide-react'
import { AppRoutes } from '@/lib/config/featureToggles'

export function Features() {
  const features = [
    {
      icon: Type,
      title: "Add Text",
      desc: "Click anywhere on a PDF page and start typing. Choose your font, size, and colour. Perfect for filling in forms, adding names, dates, or addresses."
    },
    {
      icon: PenLine,
      title: "Sign Documents",
      desc: "Draw your signature with your mouse or finger. Save it for reuse across documents. Add, move, resize, or remove signatures at any time.",
      link: AppRoutes.signPdf,
      linkText: "Learn about signing PDFs →"
    },
    {
      icon: FolderOpen,
      title: "Manage Your Files",
      desc: "All your edited PDFs are stored locally in your browser — like a private drive on your own device. Access, re-edit, or delete them anytime."
    },
    {
      icon: WifiOff,
      title: "Works Offline",
      desc: "Load the editor once and it works without an internet connection. Your documents and signatures are always available, even on a plane."
    },
    {
      icon: ShieldCheck,
      title: "Nothing Uploaded, Ever",
      desc: "Your documents never leave your device. No cloud storage. No third-party access. No risk. What you edit is only ever seen by you.",
      highlight: true
    },
    {
      icon: Download,
      title: "Free to Download",
      desc: "When you're done editing, just click download. No account prompt. No \"upgrade to export\". No watermark on your files. Free means free.",
      highlight: true
    }
  ]

  return (
    <section id="features" className="py-24 bg-card/50 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-primary font-medium tracking-wide text-sm uppercase">What You Can Do</span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">Everything you need for everyday PDF editing.</h2>
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
