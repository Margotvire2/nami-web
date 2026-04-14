import type { Metadata } from "next"
import { PitchHero } from "@/components/pitch/PitchHero"
import { PitchProblem } from "@/components/pitch/PitchProblem"
import { PitchInsight } from "@/components/pitch/PitchInsight"
import { PitchStickyDemo } from "@/components/pitch/PitchStickyDemo"
import { PitchArchitecture } from "@/components/pitch/PitchArchitecture"
import { PitchTraction } from "@/components/pitch/PitchTraction"
import { PitchMarket } from "@/components/pitch/PitchMarket"
import { PitchPricing } from "@/components/pitch/PitchPricing"
import { PitchFounder } from "@/components/pitch/PitchFounder"
import { PitchCTA } from "@/components/pitch/PitchCTA"

export const metadata: Metadata = {
  title: "Nami — Pitch Investisseurs · Seed 2026",
  description: "Le système nerveux des parcours de soins complexes. Coordination pluridisciplinaire, base de connaissances propriétaire, modèle récurrent.",
  robots: { index: false, follow: false },
}

export default function PitchPage() {
  return (
    <div style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}>
      <PitchHero variant="vc" />
      <PitchProblem variant="vc" />
      <PitchInsight />
      <PitchStickyDemo />
      <PitchArchitecture />
      <PitchTraction />
      <PitchMarket />
      <PitchPricing variant="vc" />
      <PitchFounder />
      <PitchCTA variant="vc" />
    </div>
  )
}
