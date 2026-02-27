import { Link2, Wifi, Contact, UtensilsCrossed, Building2, ShoppingBag, GraduationCap, Newspaper } from 'lucide-react'

export function UseCases() {
  const cases = [
    { icon: Link2, text: "Sharing a website on a flyer" },
    { icon: Wifi, text: "Guest WiFi at cafes and offices" },
    { icon: Contact, text: "Digital business cards" },
    { icon: UtensilsCrossed, text: "Restaurant menus" },
    { icon: Building2, text: "Event check-in and ticketing" },
    { icon: ShoppingBag, text: "Product packaging links" },
    { icon: GraduationCap, text: "Classroom handouts and worksheets" },
    { icon: Newspaper, text: "Print media linking to online content" },
  ]

  return (
    <section className="py-24 bg-card/50 px-6">
      <div className="container mx-auto max-w-5xl text-center">
        <h2 className="font-display text-3xl md:text-4xl text-foreground mb-12">Built for every everyday use case</h2>

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
