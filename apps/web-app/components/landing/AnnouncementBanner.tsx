'use client'

import { Info, X } from 'lucide-react'
import { useState } from 'react'

export function AnnouncementBanner() {
  const [showDetails, setShowDetails] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  return (
    <div className="bg-muted/40 text-muted-foreground text-xs md:text-sm py-2.5 px-4 text-center font-medium border-b border-border relative z-50">
      <div className="max-w-7xl mx-auto relative">
        <span className="inline-flex items-center gap-2 flex-wrap justify-center">
          <span className="bg-primary text-primary-foreground text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold">Beta</span>
          <span className="opacity-90 text-foreground">SimplifiedPDF is in early development. We're shipping new features weekly! 🚀</span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity underline decoration-dotted text-foreground"
            aria-label="More information about beta"
          >
            <Info className="w-3.5 h-3.5" />
            <span>More info</span>
          </button>
        </span>
        
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity text-foreground"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-border text-xs max-w-2xl mx-auto text-left md:text-center text-foreground">
          <p className="opacity-80 leading-relaxed">
            <strong className="opacity-100">This is a new tool with limited use cases right now.</strong> We're actively working on expanding features and capabilities. 
            Your feedback helps us prioritize what matters most.{' '}
            <a 
              href="mailto:feedback@simplifiedpdf.com" 
              className="underline hover:opacity-100 transition-opacity"
            >
              Send us your thoughts
            </a>
            {' '}or suggestions!
          </p>
        </div>
      )}
    </div>
  )
}
