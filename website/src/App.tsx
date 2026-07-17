import Lightning from "@/components/Lightning"
import Nav from "@/sections/Nav"
import Hero from "@/sections/Hero"
import CodeBand from "@/sections/CodeBand"
import HowItWorks from "@/sections/HowItWorks"
import Features from "@/sections/Features"
import LanguagesBand from "@/sections/LanguagesBand"
import HmdBand from "@/sections/HmdBand"
import StatsBand from "@/sections/StatsBand"
import CtaBand from "@/sections/CtaBand"
import Footer from "@/sections/Footer"

export default function App() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      {/* Viewport-fixed ambient background: follows the user through the whole page */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 opacity-60">
        <Lightning hue={225} speed={0.8} intensity={0.8} size={1.2} />
      </div>
      <Nav />
      <main>
        <Hero />
        <CodeBand />
        <HowItWorks />
        <Features />
        <LanguagesBand />
        <HmdBand />
        <StatsBand />
        <CtaBand />
      </main>
      <Footer />
    </div>
  )
}
