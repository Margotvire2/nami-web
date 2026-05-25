import type { Metadata } from "next";
import { ProchesHero } from "./ProchesHero";
import { ProchesPersonae } from "./ProchesPersonae";
import { ProchesUseCase } from "./ProchesUseCase";
import { ProchesDelegation } from "./ProchesDelegation";
import { ProchesFonctionnalites } from "./ProchesFonctionnalites";
import { ProchesFAQMini } from "./ProchesFAQMini";
import { ProchesFinalCTA } from "./ProchesFinalCTA";
import { PublicFooter } from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title:
    "Pour les proches : aidants, parents, conjoints — Nami",
  description:
    "Gérer le suivi médical d'un proche. Centralisez ses rendez-vous, ses documents et la coordination avec ses soignants, dans le respect de son consentement.",
  keywords: [
    "aidants familiaux",
    "parents",
    "proches",
    "coordination soins",
    "suivi médical proche",
    "délégation parentale",
    "consentement rgpd",
  ],
  openGraph: {
    title: "Pour les proches — Nami",
    description:
      "Coordination de soins pour les aidants, parents et conjoints. Outil sécurisé, conforme RGPD.",
    type: "website",
    locale: "fr_FR",
  },
  alternates: { canonical: "/pour-les-proches" },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Pour les proches — Nami",
  description:
    "Landing publique dédiée aux aidants, parents et conjoints qui gèrent le suivi médical d'un proche.",
  url: "https://namipourlavie.com/pour-les-proches",
  audience: {
    "@type": "Audience",
    audienceType:
      "Aidants familiaux, parents d'enfants mineurs, conjoints, enfants adultes de parents âgés",
  },
};

export default function PourLesProchesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="main" style={{ background: "#FAFAF8" }}>
        <ProchesHero />
        <ProchesPersonae />
        <ProchesUseCase />
        <ProchesDelegation />
        <ProchesFonctionnalites />
        <ProchesFAQMini />
        <ProchesFinalCTA />
      </main>

      <PublicFooter />
    </>
  );
}
