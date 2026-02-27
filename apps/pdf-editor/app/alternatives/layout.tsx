import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { AppRoutes } from '@/lib/config/featureToggles'
import { Footer } from '@/components/landing/sections/Footer'

export default function AlternativesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="py-4 px-6 border-b border-border bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link href={AppRoutes.home} className="hover:text-foreground transition-colors">
                SimplifiedPDF
              </Link>
            </li>
            <li aria-hidden="true"><ChevronRight className="w-4 h-4" /></li>
            <li className="text-foreground font-medium">Alternatives</li>
          </ol>
        </div>
      </nav>
      {children}
      <Footer />
    </>
  )
}
