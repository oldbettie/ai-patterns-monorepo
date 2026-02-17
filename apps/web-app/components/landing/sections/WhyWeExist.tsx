export function WhyWeExist() {
  return (
    <section className="py-20 bg-[#141412] dark:bg-card text-[#F0EFE9] dark:text-foreground px-6">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="sr-only">Why We Exist</h2>
        <div className="space-y-6 text-xl md:text-2xl leading-relaxed font-light">
          <p>
            Most "free" PDF editors are free to edit, not free to download!
          </p>
          <p className="opacity-80">
            You upload your document, spend five minutes editing it, click download — and hit a paywall.
            Some charge £10/month. Some lock you in with a trial you forgot to cancel.
            Some quietly upload your sensitive documents to their servers.
          </p>
          <p className="font-display text-2xl md:text-3xl italic text-primary-foreground dark:text-primary pt-4">
            SimplifiedPDF is different. Everything runs in your browser. Your files are never uploaded anywhere.
            Editing is free. Downloading is free. Always.
          </p>
          <p className="opacity-80 text-sm pt-8">
            You NEVER need an account (unless you want advanced features and file sharing) and you don't need to pay for simple things like adding text or signatures
          </p>
        </div>
      </div>
    </section>
  )
}
