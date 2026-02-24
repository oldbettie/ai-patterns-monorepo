import { BackgroundDecoration } from './BackgroundDecoration'
import { HeroSection } from './HeroSection'
import { TechStackSection } from './TechStackSection'
import { ValuePropsSection } from './ValuePropsSection'
import { SetupStepsSection } from './SetupStepsSection'
import { PreSetupSection } from './PreSetupSection'
import { DeploymentProvidersSection } from './DeploymentProvidersSection'
import { AdvancedFeaturesSection } from './AdvancedFeaturesSection'
import { LandingFooter } from './LandingFooter'

export async function LandingPage() {
  return (
    <main className='relative min-h-screen overflow-x-hidden'>
      <BackgroundDecoration />
      <HeroSection />
      <TechStackSection />
      <ValuePropsSection />
      <SetupStepsSection />
      <PreSetupSection />
      <DeploymentProvidersSection />
      <AdvancedFeaturesSection />
      <LandingFooter />
    </main>
  )
}
