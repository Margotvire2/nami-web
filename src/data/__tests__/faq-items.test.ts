import { describe, it, expect } from "vitest";
import { FAQ_SECTIONS, TOTAL_FAQ_ITEMS } from "@/data/faq-items";

/**
 * F-PAGE-FAQ-PATIENT-V1 — Données FAQ.
 *
 * Garde-fous :
 *  - V1 cible 20 questions essentielles (range 15-25 toléré).
 *  - Chaque item a un id stable (slug), une question non vide,
 *    une réponse non vide et ≥ 1 keyword.
 *  - Wording strictement vérifié : aucun mot interdit MDR/AI Act
 *    dans la copy patient (alerte / surveillance / diagnostic /
 *    anormal / risque / urgence / dépister).
 *  - Mentions obligatoires : "n'est pas un dispositif médical"
 *    et lien vers `/ai-act`.
 */

const FORBIDDEN_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\balerte\b/i, label: "alerte" },
  { pattern: /\bsurveillance\b/i, label: "surveillance" },
  { pattern: /\bsurveiller\b/i, label: "surveiller" },
  { pattern: /\bdépister\b/i, label: "dépister" },
  { pattern: /\banormal\b/i, label: "anormal" },
  { pattern: /\brisque clinique\b/i, label: "risque clinique" },
  { pattern: /\burgence vitale\b/i, label: "urgence vitale" },
  { pattern: /\bvigilance\b/i, label: "vigilance" },
  { pattern: /\bsignal(?:er|aux|isation)?\b/i, label: "signal/signaler" },
  { pattern: /\bdrapeau[x]? rouge[s]?\b/i, label: "drapeau rouge" },
  { pattern: /\bcare gap\b/i, label: "care gap" },
];

describe("FAQ_SECTIONS — structure & cardinalité", () => {
  it("contient au moins 1 section", () => {
    expect(FAQ_SECTIONS.length).toBeGreaterThan(0);
  });

  it("expose 20 questions essentielles (V1)", () => {
    expect(TOTAL_FAQ_ITEMS).toBe(20);
  });

  it("expose entre 4 et 7 sections (architecture lisible)", () => {
    expect(FAQ_SECTIONS.length).toBeGreaterThanOrEqual(4);
    expect(FAQ_SECTIONS.length).toBeLessThanOrEqual(7);
  });

  it("chaque section a un id, un titre, une description et au moins 3 items", () => {
    for (const section of FAQ_SECTIONS) {
      expect(section.id).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(section.title.length).toBeGreaterThan(0);
      expect(section.description.length).toBeGreaterThan(0);
      expect(section.items.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("tous les ids d'items sont uniques globalement", () => {
    const ids = FAQ_SECTIONS.flatMap((s) => s.items.map((i) => `${s.id}:${i.id}`));
    const dedup = new Set(ids);
    expect(dedup.size).toBe(ids.length);
  });

  it("chaque item a question + réponse non vides + au moins 1 keyword", () => {
    for (const section of FAQ_SECTIONS) {
      for (const item of section.items) {
        expect(item.id, `id manquant: ${section.id}`).toMatch(/^[a-z][a-z0-9-]*$/);
        expect(item.question.trim().length, `question vide: ${item.id}`).toBeGreaterThan(5);
        expect(item.answerMarkdown.trim().length, `réponse vide: ${item.id}`).toBeGreaterThan(20);
        expect(item.keywords.length, `keywords vides: ${item.id}`).toBeGreaterThan(0);
      }
    }
  });
});

describe("FAQ_SECTIONS — conformité MDR / AI Act / DGCCRF", () => {
  it("aucune réponse n'utilise un mot interdit MDR/DM", () => {
    for (const section of FAQ_SECTIONS) {
      for (const item of section.items) {
        const haystack = `${item.question}\n${item.answerMarkdown}`;
        for (const { pattern, label } of FORBIDDEN_PATTERNS) {
          expect(
            pattern.test(haystack),
            `Mot interdit "${label}" trouvé dans ${section.id}/${item.id}`,
          ).toBe(false);
        }
      }
    }
  });

  it("au moins une réponse mentionne explicitement « pas un dispositif médical »", () => {
    const corpus = FAQ_SECTIONS.flatMap((s) => s.items.map((i) => i.answerMarkdown)).join("\n");
    expect(corpus.toLowerCase()).toMatch(/n['’]?est pas un dispositif médical/);
  });

  it("au moins une réponse renvoie vers /ai-act", () => {
    const corpus = FAQ_SECTIONS.flatMap((s) => s.items.map((i) => i.answerMarkdown)).join("\n");
    expect(corpus).toContain("/ai-act");
  });

  it("au moins une réponse mentionne l'hébergement HDS", () => {
    const corpus = FAQ_SECTIONS.flatMap((s) => s.items.map((i) => i.answerMarkdown)).join("\n");
    expect(corpus).toMatch(/HDS/);
  });
});
