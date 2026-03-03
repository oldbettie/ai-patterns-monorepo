import { Navbar } from './Navbar'
import { Hero } from './sections/Hero'
import { WhyWeExist } from './sections/WhyWeExist'
import { HowItWorks } from './sections/HowItWorks'
import { Features } from './sections/Features'
import { Advantage } from './sections/Advantage'
import { Privacy } from './sections/Privacy'
import { Comparison } from './sections/Comparison'
import { UseCases } from './sections/UseCases'
import { FAQ } from './sections/FAQ'
import { FinalCTA } from './sections/FinalCTA'
import { Footer } from './sections/Footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main>
        <Hero />
        <WhyWeExist />
        <HowItWorks />
        <Features />
        <Advantage />
        <Privacy />
        <Comparison />
        <UseCases />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
