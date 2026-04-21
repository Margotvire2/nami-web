import type { Metadata } from "next"
import { PublicNavbar } from "@/components/public/PublicNavbar"
import { PublicFooter } from "@/components/public/PublicFooter"

export const metadata: Metadata = {
  title: "Trouver un soignant spécialisé — TCA, nutrition, obésité, pédiatrie",
  description:
    "Recherchez un professionnel de santé spécialisé en troubles du comportement alimentaire, nutrition, obésité ou pédiatrie. Profils vérifiés RPPS, prise de rendez-vous.",
  keywords: [
    "trouver soignant", "diététicien spécialisé TCA", "psychologue TCA",
    "pédiatre", "nutritionniste", "obésité", "anorexie", "boulimie",
    "rendez-vous en ligne", "professionnel de santé",
  ],
  openGraph: {
    title: "Trouver un soignant spécialisé | Nami",
    description: "Professionels de santé vérifiés, spécialisés en TCA, nutrition, obésité, pédiatrie.",
  },
  alternates: {
    canonical: "/trouver-un-soignant",
  },
}

// JSON-LD for the search page
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Trouver un soignant spécialisé",
  description: "Recherchez un professionnel de santé spécialisé. Profils vérifiés RPPS.",
  url: "https://namipourlavie.com/trouver-un-soignant",
  isPartOf: { "@type": "WebSite", name: "Nami", url: "https://namipourlavie.com" },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://namipourlavie.com/trouver-un-soignant?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
}

export default function TrouverSoignantLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PublicNavbar />
      {children}
      <PublicFooter />
    </>
  )
}
