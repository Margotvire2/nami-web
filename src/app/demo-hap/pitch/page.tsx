import type { Metadata } from "next"
import { PitchDeckHAPClient } from "./PitchDeckHAPClient"

export const metadata: Metadata = {
  title: "Nami — Pitch · Clinique Pédiatrique",
  description: "Pourquoi Nami est l'infrastructure de coordination qui manque entre l'hôpital et la ville.",
  robots: { index: false, follow: false },
}

export default function PitchDeckHAPPage() {
  return <PitchDeckHAPClient />
}
