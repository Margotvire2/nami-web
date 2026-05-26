import type { Metadata } from "next";
import { PartenairesHero } from "./PartenairesHero";
import { PartenairesPourQui } from "./PartenairesPourQui";
import { PartenairesValeur } from "./PartenairesValeur";
import { PartenairesModalites } from "./PartenairesModalites";
import { PartenairesCompliance } from "./PartenairesCompliance";
import { PartenairesFAQ } from "./PartenairesFAQ";
import { PartenairesReferences } from "./PartenairesReferences";
import { PartenairesContact } from "./PartenairesContact";
import { PublicFooter } from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Partenariats institutionnels — Nami",
  description:
    "Nami pour les ARS, CPTS, hôpitaux, mutuelles et réseaux de soins. Coordination de parcours adaptée aux structures institutionnelles, conformité RGPD, hébergement en France.",
  keywords: [
    "partenariat nami",
    "ARS",
    "CPTS",
    "hôpital",
    "mutuelle",
    "DAC",
    "coordination de soins",
    "ville-hôpital",
  ],
  openGraph: {
    title: "Partenariats institutionnels — Nami",
    description:
      "Coordination de parcours pour ARS, CPTS, hôpitaux, mutuelles et réseaux de soins.",
    type: "website",
    locale: "fr_FR",
  },
  alternates: { canonical: "/partenaires" },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Partenariats institutionnels — Nami",
  description:
    "Page institutionnelle pour les acteurs publics et privés de la coordination de soins.",
  url: "https://namipourlavie.com/partenaires",
  audience: {
    "@type": "Audience",
    audienceType:
      "ARS, CPTS, hôpitaux publics et privés, mutuelles, réseaux de soins, DAC",
  },
};

export default function PartenairesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="main" style={{ background: "#FAFAF8" }}>
        <PartenairesHero />
        <PartenairesPourQui />
        <PartenairesValeur />
        <PartenairesModalites />
        <PartenairesCompliance />
        <PartenairesFAQ />
        <PartenairesReferences />
        <PartenairesContact />
      </main>

      <PublicFooter />
    </>
  );
}
