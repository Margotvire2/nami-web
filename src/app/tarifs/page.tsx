import type { Metadata } from "next"
import { TarifsHero } from "./TarifsHero"
import { TarifsPatientSection } from "./TarifsPatientSection"
import { TarifsSoignantLiberalSection } from "./TarifsSoignantLiberalSection"
import { TarifsStructureSection } from "./TarifsStructureSection"
import { TarifsComparison } from "./TarifsComparison"
import { TarifsFAQ } from "./TarifsFAQ"
import { TarifsCompliance } from "./TarifsCompliance"
import { TarifsFinalCTA } from "./TarifsFinalCTA"

export const metadata: Metadata = {
  title: "Tarifs — Nami",
  description:
    "Tarifs Nami : sans frais pour les patients, formules adaptées aux soignants libéraux et aux structures (CPTS, MSP, hôpital). Transparence et conformité L113-3.",
  alternates: { canonical: "/tarifs" },
  openGraph: {
    title: "Tarifs — Nami",
    description:
      "Sans frais pour les patients. Formules pour soignants libéraux et structures de soin.",
    url: "/tarifs",
    type: "website",
  },
  robots: { index: true, follow: true },
}

export default function TarifsPage() {
  return (
    <main
      id="main"
      style={{
        background: "#FAFAF8",
        fontFamily: "var(--font-jakarta), system-ui, sans-serif",
      }}
    >
      <TarifsHero />
      <TarifsPatientSection />
      <TarifsSoignantLiberalSection />
      <TarifsStructureSection />
      <TarifsComparison />
      <TarifsFAQ />
      <TarifsCompliance />
      <TarifsFinalCTA />
    </main>
  )
}
