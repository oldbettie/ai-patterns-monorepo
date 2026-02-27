'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { AppRoutes } from '@/lib/config/featureToggles'
import { cn } from '@/lib/utils'
import ThemeToggle from '@/components/theme-toggle'

export function Navbar() {
  const pathname = usePathname()
  const isHomepage = pathname === '/'
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = isHomepage
    ? [
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Features', href: '#features' },
        { name: 'Privacy', href: '#privacy' },
        { name: 'FAQ', href: '#faq' },
      ]
    : [
        { name: 'FAQ', href: AppRoutes.home + '#faq' },
      ]

  return (
    <div className="sticky top-0 left-0 right-0 z-40 flex flex-col font-sans">
      <nav
        className={cn(
          "w-full transition-all duration-300",
          isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm py-3 border-b border-border" : "bg-transparent py-5"
        )}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl text-foreground font-medium tracking-tight">
            Quick QR
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link
              href={AppRoutes.generate}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-all hover:shadow-md font-medium text-sm"
            >
              Generate QR Code →
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button
              className="text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-foreground font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href={AppRoutes.generate}
              className="bg-primary text-primary-foreground px-5 py-3 rounded-lg text-center font-medium mt-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Generate QR Code →
            </Link>
          </div>
        )}
      </nav>
    </div>
  )
}
