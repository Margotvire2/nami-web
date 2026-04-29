import type { Metadata } from "next"
import { PitchDeckHAPClient } from "./PitchDeckHAPClient"

export const metadata: Metadata = {
  title: "Nami — Pitch · Clinique Pédiatrique",
  description: "Pourquoi Nami est l'infrastructure de coordination qui manque entre l'hôpital et la ville.",
  robots: { index: true, follow: true },
}

export default function PitchDeckHAPPage() {
  return <PitchDeckHAPClient />
}
