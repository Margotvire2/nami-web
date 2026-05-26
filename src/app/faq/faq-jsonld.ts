/**
 * Générateur Schema.org FAQPage pour rich snippets Google.
 *
 * Documentation : https://schema.org/FAQPage
 * Permet à Google d'afficher la FAQ directement dans les résultats de recherche
 * (rich snippets expansibles) — boost SEO et taux de clic significatif.
 *
 * Strip markdown léger pour garder un texte propre dans le JSON-LD
 * (Google ne rendra pas le markdown — il attend du texte brut).
 */

import type { FAQPublicCategory } from "./faq-public-data";

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

export function buildFAQJsonLD(categories: FAQPublicCategory[]): FAQJsonLD {
  const allItems = categories.flatMap((c) => c.items);

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
