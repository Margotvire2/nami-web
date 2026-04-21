import type { Metadata } from "next"
import { PitchDeckTCAClient } from "./PitchDeckTCAClient"

export const metadata: Metadata = {
  title: "Nami — Vision · Coordination TCA",
  description: "Pourquoi Nami est l'infrastructure de coordination qui manque aux parcours TCA.",
  robots: { index: false, follow: false },
}

export default function PitchDeckTCAPage() {
  return <PitchDeckTCAClient />
}
