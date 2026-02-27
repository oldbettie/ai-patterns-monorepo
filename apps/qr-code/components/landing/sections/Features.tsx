import { Link2, Wifi, Contact, MessageSquare, Mail, FileText, Download, ShieldCheck } from 'lucide-react'

export function Features() {
  const features = [
    {
      icon: Link2,
      title: "URL QR Codes",
      desc: "Generate QR codes that open any website or link. Perfect for business cards, flyers, menus, and anywhere you want to bridge print and digital."
    },
    {
      icon: Wifi,
      title: "WiFi QR Codes",
      desc: "Let guests connect to your WiFi by scanning a code — no typing required. Supports WPA2, WEP, and open networks."
    },
    {
      icon: Contact,
      title: "vCard / Contact",
      desc: "Share your contact details with a scan. Name, phone, email, and organisation — all saved instantly to the scanner's contacts."
    },
    {
      icon: MessageSquare,
      title: "SMS QR Codes",
      desc: "Pre-fill a text message with a recipient number and body text. One scan opens the Messages app ready to send."
    },
    {
      icon: Mail,
      title: "Email QR Codes",
      desc: "Pre-address an email with recipient, subject, and body. Ideal for feedback forms, support requests, and contact pages."
    },
    {
      icon: FileText,
      title: "Plain Text",
      desc: "Encode any plain text — notes, coupons, serial numbers, instructions. Simple and universally readable."
    },
    {
      icon: Download,
      title: "PNG & SVG Export",
      desc: "Download your QR code as a high-resolution PNG for screens or as a scalable SVG for print. No watermarks. No branding.",
      highlight: true
    },
    {
      icon: ShieldCheck,
      title: "Nothing Uploaded, Ever",
      desc: "Your content never leaves your device. No cloud storage. No third-party access. What you encode is only ever seen by you.",
      highlight: true
    }
  ]

  return (
    <section id="features" className="py-24 bg-card/50 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-primary font-medium tracking-wide text-sm uppercase">What You Can Do</span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">Every QR code type you need.</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
