import type { Metadata } from "next"
import { PublicNavbar } from "@/components/public/PublicNavbar"
import { PublicFooter } from "@/components/public/PublicFooter"
import { SecuriteHero } from "./SecuriteHero"
import { SecuriteHebergement } from "./SecuriteHebergement"
import { SecuriteAcces } from "./SecuriteAcces"
import { SecuriteCertifications } from "./SecuriteCertifications"
import { SecuriteVosDroitsRGPD } from "./SecuriteVosDroitsRGPD"
import { SecuriteIncidentBreach } from "./SecuriteIncidentBreach"
import { SecuriteContactDPO } from "./SecuriteContactDPO"
import { SecuriteFinalCTA } from "./SecuriteFinalCTA"

export const metadata: Metadata = {
  title: "Sécurité et données — Nami",
  description:
    "Comment Nami protège vos données de santé : hébergement en France, conformité RGPD, accès strictement limité aux soignants que vous autorisez, droits patients détaillés.",
  alternates: { canonical: "/securite-et-donnees" },
  openGraph: {
    title: "Sécurité et données — Nami",
    description:
      "Hébergement France, conformité RGPD, accès strict aux soignants autorisés, droits patients RGPD : tout ce que Nami fait pour protéger vos données de santé.",
    type: "website",
    url: "https://namipourlavie.com/securite-et-donnees",
  },
  robots: { index: true, follow: true },
}

export default function SecuriteEtDonneesPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#FAFAF8" }}>
      <PublicNavbar />
      <main id="main" style={{ flex: 1 }}>
        <SecuriteHero />
        <SecuriteHebergement />
        <SecuriteAcces />
        <SecuriteCertifications />
        <SecuriteVosDroitsRGPD />
        <SecuriteIncidentBreach />
        <SecuriteContactDPO />
        <SecuriteFinalCTA />
      </main>
      <PublicFooter />
    </div>
  )
}
