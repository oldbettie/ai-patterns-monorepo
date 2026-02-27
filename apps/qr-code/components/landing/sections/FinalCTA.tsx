import Link from 'next/link'
import { AppRoutes } from '@/lib/config/featureToggles'

export function FinalCTA() {
  return (
    <section className="py-24 px-6 bg-background text-center">
      <div className="container mx-auto max-w-4xl">
        <h2 className="font-display text-5xl md:text-6xl text-foreground mb-6">
          Stop paying for QR codes. <br />
          Just generate one.
        </h2>
        <p className="text-xl text-muted-foreground mb-10">
          No account. No subscription. No watermarks. No nonsense.
        </p>

        <div className="flex flex-col items-center gap-4">
          <Link
            href={AppRoutes.generate}
            className="bg-primary text-primary-foreground text-lg font-medium px-10 py-4 rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Generate Your QR Code — It's Free
          </Link>
          <span className="text-sm text-muted-foreground">Your data never leaves your browser.</span>
        </div>
      </div>
    </section>
  )
}
