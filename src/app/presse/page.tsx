import type { Metadata } from "next";
import { PresseHero } from "./PresseHero";
import { PresseBoilerplate } from "./PresseBoilerplate";
import { PresseKitMedia } from "./PresseKitMedia";
import { PresseCommuniques } from "./PresseCommuniques";
import { PresseContact } from "./PresseContact";
import { PresseCompliance } from "./PresseCompliance";
import { PublicFooter } from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Espace presse — Nami",
  description:
    "Ressources presse officielles : boilerplate institutionnel, logos, contact dédié, coordonnées juridiques. Pour les rédactions, médias spécialisés santé, podcasts.",
  keywords: [
    "presse nami",
    "kit media",
    "boilerplate",
    "logo nami",
    "contact presse",
    "coordination de soins",
  ],
  openGraph: {
    title: "Espace presse — Nami",
    description:
      "Boilerplate, kit media et contact dédié pour parler de Nami dans la presse.",
    type: "website",
    locale: "fr_FR",
  },
  alternates: { canonical: "/presse" },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Espace presse — Nami",
  description:
    "Page institutionnelle dédiée aux médias et rédactions souhaitant évoquer Nami.",
  url: "https://namipourlavie.com/presse",
  publisher: {
    "@type": "Organization",
    name: "Nami",
    url: "https://namipourlavie.com",
    logo: {
      "@type": "ImageObject",
      url: "https://namipourlavie.com/nami-mascot.png",
    },
  },
};

export default function PressePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="main" style={{ background: "#FAFAF8" }}>
        <PresseHero />
        <PresseBoilerplate />
        <PresseKitMedia />
        <PresseCommuniques />
        <PresseContact />
        <PresseCompliance />
      </main>

      <PublicFooter />
    </>
  );
}
