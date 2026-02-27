import { Type, Settings, Download } from 'lucide-react'

export function HowItWorks() {
  const steps = [
    {
      icon: Type,
      title: "Step 1: Enter Your Content",
      desc: ["Type a URL, WiFi password, contact info,", "SMS message, or plain text.", "Nothing is sent to any server."]
    },
    {
      icon: Settings,
      title: "Step 2: Customise",
      desc: ["Choose colours and dot style.", "Add a logo if you want.", "Preview updates live as you type."]
    },
    {
      icon: Download,
      title: "Step 3: Download",
      desc: ["Click download and save as PNG or SVG.", "Print-ready quality, no watermarks.", "That's it. Free forever."]
    }
  ]

  return (
    <section id="how-it-works" className="py-24 bg-background px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-primary font-medium tracking-wide text-sm uppercase">How It Works</span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">Three steps. No account. No waiting.</h2>
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
