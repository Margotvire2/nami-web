import type { Metadata } from "next"
import { PitchTcaClient } from "./PitchTcaClient"

export const metadata: Metadata = {
  title: "Nami — Coordination des parcours TCA",
  description:
    "Nami est l'infrastructure de coordination pour vos équipes TCA. Dossier partagé, communication sécurisée, indicateurs de complétude sourcés HAS.",
  robots: { index: false, follow: false },
}

export default function PitchTcaPage() {
  return <PitchTcaClient />
}
