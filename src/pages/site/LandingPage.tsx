import { useEffect, useState } from 'react'
import { SiteHeader } from '../../components/site/SiteHeader'
import { HeroSection } from '../../components/site/HeroSection'
import { DiagnosticoSection } from '../../components/site/DiagnosticoSection'
import { BeforeAfterSection } from '../../components/site/BeforeAfterSection'
import { TestimonialsSection } from '../../components/site/TestimonialsSection'
import { FeaturesSection } from '../../components/site/FeaturesSection'
import { PlatformShowcaseSection } from '../../components/site/PlatformShowcaseSection'
import { ROICalculatorSection } from '../../components/site/ROICalculatorSection'
import { PricingSection } from '../../components/site/PricingSection'
import { TrustSection } from '../../components/site/TrustSection'
import { FAQSection } from '../../components/site/FAQSection'
import { TrialSection } from '../../components/site/TrialSection'
import { SiteFooter } from '../../components/site/SiteFooter'
import { KeaLexAdvisorWidget } from '../../components/site/KeaLexAdvisorWidget'

export function LandingPage() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="font-sans antialiased">
      {/* Barra de progresso de scroll */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#00C2A8] to-[#F96313] transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
      <SiteHeader />
      <main>
        <HeroSection />
        <DiagnosticoSection />
        <BeforeAfterSection />
        <TestimonialsSection />
        <FeaturesSection />
        <PlatformShowcaseSection />
        <ROICalculatorSection />
        <PricingSection />
        <TrustSection />
        <FAQSection />
        <TrialSection />
      </main>
      <SiteFooter />
      <KeaLexAdvisorWidget />
    </div>
  )
}
