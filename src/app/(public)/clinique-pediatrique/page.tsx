import type { Metadata } from "next"
import { CliniquePedPage } from "@/components/pitch/CliniquePedPage"

export const metadata: Metadata = {
  title: "Nami — Clinique Pédiatrique · Hôpital Américain de Paris",
  description: "Coordination pédiatrique, carnet de santé digital, réseau ville-hôpital.",
  robots: { index: true, follow: true },
}

export default function CliniquePediatriquePage() {
  return <CliniquePedPage />
}
