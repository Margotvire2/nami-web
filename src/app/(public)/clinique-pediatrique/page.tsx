import type { Metadata } from "next"
import { CliniquePedPage } from "@/components/pitch/CliniquePedPage"

export const metadata: Metadata = {
  title: "Nami — Clinique Pédiatrique · Coordination pédiatrique pluridisciplinaire",
  description: "Coordination pédiatrique pluridisciplinaire : carnet de santé digital, réseau ville-hôpital, suivi TCA enfant, TDAH, autisme. Nami relie l'équipe autour de chaque enfant.",
  alternates: { canonical: "/clinique-pediatrique" },
  robots: { index: false, follow: false },
}

export default function CliniquePediatriquePage() {
  return <CliniquePedPage />
}
