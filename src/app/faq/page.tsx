import type { Metadata } from "next";
import FAQPageClient from "./page-client";
import { PublicFooter } from "@/components/public/PublicFooter";
import { FAQ_PUBLIC_CATEGORIES } from "./faq-public-data";
import { buildFAQJsonLD } from "./faq-jsonld";

export const metadata: Metadata = {
  title: "FAQ — Foire aux questions · Nami",
  description:
    "Toutes les réponses à vos questions sur Nami : ce que c'est, comment ça marche, prix, vos données et vos droits. Outil de coordination de soins, non dispositif médical.",
  keywords: [
    "faq nami",
    "questions fréquentes",
    "coordination soins",
    "rendez-vous médical",
    "données de santé",
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
  const jsonLD = buildFAQJsonLD(FAQ_PUBLIC_CATEGORIES);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
      />

      <FAQPageClient />

      <PublicFooter />
    </>
  );
}
