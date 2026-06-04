/**
 * Générateur Schema.org FAQPage pour rich snippets Google.
 *
 * Documentation : https://schema.org/FAQPage
 * Permet à Google d'afficher la FAQ directement dans les résultats de recherche
 * (rich snippets expansibles).
 *
 * Strip markdown léger pour garder un texte propre dans le JSON-LD
 * (Google attend du texte brut, pas du markdown rendu).
 */

import type { FAQSectionData } from "@/data/faq-items";

function stripMarkdown(md: string): string {
  return md
    .replace(/\*\*(.+?)\*\*/g, "$1") // gras
    .replace(/\*(.+?)\*/g, "$1") // italique
    .replace(/\[(.+?)\]\([^)]+\)/g, "$1") // liens [texte](url) → texte
    .trim();
}

export interface FAQJsonLD {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

export function buildFAQJsonLD(sections: FAQSectionData[]): FAQJsonLD {
  const allItems = sections.flatMap((c) => c.items);

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: stripMarkdown(item.answerMarkdown),
      },
    })),
  };
}
