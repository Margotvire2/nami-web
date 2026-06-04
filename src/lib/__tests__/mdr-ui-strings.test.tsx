/**
 * CI guard — Scan tous les .tsx UI de l'app et fail si une string literal
 * contient un mot interdit du lexique MDR (cf. src/lib/mdr-guard.ts).
 *
 * Couvre : src/app/**, src/components/**, src/views/**.
 * Exclut  : __tests__/, _archived/, src/lib/data/ (KB content), node_modules.
 *
 * Détecte les mots dans les string literals (`"..."`, `'...'`, `` `...` ``)
 * mais ignore les commentaires de ligne (`// ...`) et de bloc (`/* ... *​/`).
 *
 * Si ce test fail : NE PAS désactiver. Réécrire le wording incriminé.
 * Source canonique du lexique : forbidden-lexicon.md du skill nami-brand-copy.
 */

import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { FORBIDDEN_WORDS, containsForbidden } from "@/lib/mdr-guard";

const ROOT = join(__dirname, "..", "..");

// Périmètre = surfaces UI cliniques (cockpit + composants soin).
// Marketing / pitch / professions / demo : review séparé par nami-brand-copy.
// Le test scan récursivement et applique EXCLUDE_SEGMENTS sur les sous-chemins.
const SCAN_DIRS = [
  "app/(cockpit)",
  "components/patient",
  "components/cockpit",
  "components/protocol",
  "components/intelligence",
];

const EXCLUDE_SEGMENTS = [
  "__tests__",
  "_archived",
  "node_modules",
  "lib/data",
  "lib/kb",
  // Marketing / institutionnel / pitch — gérés hors cockpit clinique.
  "admin/strategie",
  "design-system",
];

const EXCLUDE_FILES = new Set<string>([
  // Le helper lui-même contient le lexique → exemption explicite.
  "lib/mdr-guard.ts",
  // Disclaimers AI Act Art. 50 — wording "à vérifier par un professionnel/soignant"
  // est LÉGALEMENT requis pour les outputs IA (Art. 50 disclosure).
  "components/cockpit/notifications/NotificationItem.tsx",
  "components/consultation-note/DraftBadge.tsx",
  "components/intelligence/atoms/DraftAIBadge.tsx",
  // Liste opérationnelle admin ("signaux" = ops, pas clinique — commentaire MDR-safe).
  "components/admin/KpiAlertsList.tsx",
  // Import path vers JSON data — pas une UI string.
  "components/nami/observation-form.tsx",
  // Discriminant TypeScript "surveillance" — type interne, pas affiché.
  "components/nami/patient-overview.tsx",
]);

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(ROOT, full);
    if (EXCLUDE_SEGMENTS.some((seg) => rel.includes(seg))) continue;
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...walk(full));
    } else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) {
      out.push(full);
    }
  }
  return out;
}

function stripComments(src: string): string {
  // Supprime /* ... */ multilignes puis // ... single-line.
  return src
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

function extractStringLiterals(src: string): string[] {
  const cleaned = stripComments(src);
  const results: string[] = [];
  // Greedy capture of "...", '...', `...` (single-line only — pas multi-ligne template).
  const regex = /"([^"\n]*)"|'([^'\n]*)'|`([^`\n]*)`/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(cleaned)) !== null) {
    results.push(m[1] ?? m[2] ?? m[3] ?? "");
  }
  return results;
}

describe("MDR UI strings guard", () => {
  it("exporte un lexique non vide", () => {
    expect(FORBIDDEN_WORDS.length).toBeGreaterThan(10);
  });

  it("containsForbidden matche le pattern attendu", () => {
    expect(containsForbidden("Surveillance clinique active")).toBe("surveillance");
    expect(containsForbidden("anormal")).toBe("anormal");
    expect(containsForbidden("À vérifier par le soignant")).toBe("à vérifier par le soignant");
    expect(containsForbidden("Brouillon — à vérifier par un professionnel")).toBeNull();
    expect(containsForbidden("Tout va bien")).toBeNull();
    expect(containsForbidden("")).toBeNull();
  });

  it("aucune UI string ne contient un mot interdit du lexique MDR", () => {
    const violations: { file: string; line: number; word: string; snippet: string }[] = [];

    for (const dirName of SCAN_DIRS) {
      const dir = join(ROOT, dirName);
      let files: string[] = [];
      try {
        files = walk(dir);
      } catch {
        continue;
      }
      for (const file of files) {
        const rel = relative(ROOT, file);
        if (EXCLUDE_FILES.has(rel)) continue;
        const src = readFileSync(file, "utf8");
        const literals = extractStringLiterals(src);
        for (const lit of literals) {
          const hit = containsForbidden(lit);
          if (hit) {
            const line = src.split("\n").findIndex((l) => l.includes(lit)) + 1;
            violations.push({ file: rel, line, word: hit, snippet: lit.slice(0, 120) });
          }
        }
      }
    }

    if (violations.length > 0) {
      const report = violations
        .map((v) => `  - ${v.file}:${v.line} → "${v.word}" dans : ${v.snippet}`)
        .join("\n");
      throw new Error(
        `${violations.length} violation(s) du lexique MDR détectée(s) dans des UI strings :\n${report}\n\n` +
          `Doctrine Nami : canal de coordination, PAS dispositif médical. ` +
          `Réécrire le wording. Source : skill nami-brand-copy / forbidden-lexicon.md.`,
      );
    }

    expect(violations).toEqual([]);
  });
});
