import { PenTool, Briefcase, FileCheck, UserPlus, FileSignature, GraduationCap, ClipboardCheck, FileText } from 'lucide-react'

export function UseCases() {
  const cases = [
    { icon: PenTool, text: "Signing rental agreements" },
    { icon: Briefcase, text: "Filling in job application forms" },
    { icon: ClipboardCheck, text: "Completing medical intake forms" },
    { icon: UserPlus, text: "Adding your name and address to PDFs" },
    { icon: FileSignature, text: "Signing contracts without printing" },
    { icon: FileText, text: "Annotating documents before sending" },
    { icon: GraduationCap, text: "Completing university or school forms" },
    { icon: FileCheck, text: "Approving documents on the go" },
  ]

  return (
    <section className="py-24 bg-card/50 px-6">
      <div className="container mx-auto max-w-5xl text-center">
        <h2 className="font-display text-3xl md:text-4xl text-foreground mb-12">Built for everyday document tasks</h2>
        
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
