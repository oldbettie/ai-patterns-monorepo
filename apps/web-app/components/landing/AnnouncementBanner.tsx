export function AnnouncementBanner() {
  return (
    <div className="bg-foreground text-background text-xs md:text-sm py-2.5 px-4 text-center font-medium border-b border-white/10 dark:border-border relative z-50">
      <span className="inline-flex items-center gap-2">
        <span className="bg-primary text-primary-foreground text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold">Beta</span>
        <span className="opacity-90">SimplifiedPDF is in early development. We're shipping new features weekly! 🚀</span>
      </span>
    </div>
  )
}
