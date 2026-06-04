import type { Metadata } from "next";
import { FAQ_SECTIONS } from "@/data/faq-items";
import FAQPageClient from "./page-client";
import { buildFAQJsonLD } from "./faq-jsonld";

export const metadata: Metadata = {
  title: "FAQ — Foire aux questions · Nami",
  description:
    "Toutes les réponses à vos questions sur Nami : créer un compte, ajouter un soignant, sécurité HDS, IA, suppression du compte. Outil de coordination, non dispositif médical.",
  keywords: [
    "faq nami",
    "questions fréquentes",
    "coordination soins",
    "rendez-vous médical",
    "données de santé",
    "hds",
    "rgpd santé",
    "aidants",
  ],
  openGraph: {
    title: "FAQ — Nami",
    description:
      "Toutes les réponses sur Nami : coordination de soins, prix, données, aidants.",
    type: "website",
    locale: "fr_FR",
  },
  alternates: { canonical: "/faq" },
  robots: { index: true, follow: true },
};

export default function FAQPage() {
  const jsonLD = buildFAQJsonLD(FAQ_SECTIONS);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
      />

      <FAQPageClient />
    </>
  );
}
