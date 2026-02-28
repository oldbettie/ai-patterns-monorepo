export function WhyWeExist() {
  return (
    <section className="py-20 bg-[#141412] dark:bg-card text-[#F0EFE9] dark:text-foreground px-6">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl md:text-4xl text-[#F0EFE9] dark:text-foreground mb-8">Why We Exist</h2>
        <div className="space-y-6 text-xl md:text-2xl leading-relaxed font-light">
          <p>
            Most "free" QR code generators aren't really free!
          </p>
          <p className="opacity-80">
            You fill in your details, customise the design, go to download — and hit a paywall.
            Some charge monthly subscriptions. Some slap their branding on your QR code.
            Some quietly store your data on their servers.
          </p>
          <p className="font-display text-2xl md:text-3xl font-semibold text-primary-foreground dark:text-primary pt-4 border-l-4 border-primary pl-6 text-left">
            Simplified QR is different. Everything runs in your browser. Your data is never uploaded anywhere.
            Generating is free. Downloading is free. Always.
          </p>
          <p className="opacity-80 text-sm pt-8">
            You NEVER need an account to generate QR codes. No watermarks, no branding, no subscriptions.
          </p>
        </div>
      </div>
    </section>
  )
}
