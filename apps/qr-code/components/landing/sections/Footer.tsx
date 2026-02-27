import Link from 'next/link'
import { AppRoutes } from '@/lib/config/featureToggles'

export function Footer() {
  return (
    <footer className="bg-[#141412] dark:bg-card text-[#F0EFE9] dark:text-foreground py-16 px-6 border-t border-white/10 dark:border-border">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <Link href="/" className="font-display text-2xl text-white dark:text-foreground mb-4 block">
              Quick QR
            </Link>
            <p className="text-[#F0EFE9]/60 dark:text-muted-foreground max-w-sm mb-6">
              The free QR code generator with no catch.
              Built by developers who got tired of QR code paywalls.
            </p>
            <div className="flex gap-4">
              <Link href={AppRoutes.generate} className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Generate QR Code
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-white dark:text-foreground mb-4">Product</h4>
            <ul className="space-y-3 text-[#F0EFE9]/60 dark:text-muted-foreground text-sm">
              <li><Link href="#how-it-works" className="hover:text-white dark:hover:text-foreground transition-colors">How It Works</Link></li>
              <li><Link href="#features" className="hover:text-white dark:hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href={AppRoutes.generate} className="hover:text-white dark:hover:text-foreground transition-colors">QR Generator</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white dark:text-foreground mb-4">Support</h4>
            <ul className="space-y-3 text-[#F0EFE9]/60 dark:text-muted-foreground text-sm">
              <li><Link href="#faq" className="hover:text-white dark:hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link href={AppRoutes.privacy} className="hover:text-white dark:hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><a href="mailto:hello@quickqr.app" className="hover:text-white dark:hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 dark:border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#F0EFE9]/40 dark:text-muted-foreground">
          <div>
            © 2025 Quick QR · Made with ☕ · No data uploaded in the making of this generator
          </div>
          <div className="flex gap-6">
            <Link href={AppRoutes.privacy} className="hover:text-white dark:hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
