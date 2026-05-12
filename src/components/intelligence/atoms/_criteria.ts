/**
 * Détection regex simple des critères cliniques chiffrés dans un snippet RAG.
 * Phase 3.B.3 — tokenisation pragmatique pour câbler la sympathie cross-card.
 *
 * Patrons supportés : IMC < X, FC < X /min, kaliémie/K+ < X mmol/L,
 * glycémie < X g/L, percentile (pédiatrie), perte de poids > X %.
 *
 * Tokenisation complexe (parsing sémantique, ICD-10, etc.) → Phase 3.B.4.
 */

export type SnippetToken =
  | { type: "text"; value: string }
  | { type: "crit"; value: string; critKey: string };

interface CritPattern {
  key: string;
  re: RegExp;
}

const PATTERNS: CritPattern[] = [
  // IMC pédiatrique (percentile) — doit matcher AVANT IMC adulte
  { key: "imc-ped", re: /IMC\s*<\s*\d+(?:[eè]?(?:re|me|ème|ᵉ)?)\s*percentile/gi },
  // IMC adulte (IMC < 14 kg/m², IMC < 13, IMC < 14)
  { key: "imc", re: /IMC\s*<\s*\d+(?:[.,]\d+)?(?:\s*kg\/m[²2])?/gi },
  // Fréquence cardiaque (FC < 40, FC < 40 /min, tachycardie de repos > 60 /min)
  { key: "fc", re: /(?:FC|tachycardie(?:\s+de\s+repos)?)\s*[<>]\s*\d+(?:\s*\/?\s*min)?/gi },
  // Kaliémie / K+ (kaliémie < 3, K+ < 3, kaliémie < 3 mmol\/L)
  { key: "k", re: /(?:kali[éè]mie|K\+)\s*<\s*\d+(?:[.,]\d+)?(?:\s*mmol\/L)?/gi },
  // Glycémie (glycémie < 0.6, glycémie < 0.6 g\/L)
  { key: "gly", re: /glyc[ée]mie\s*<\s*\d+(?:[.,]\d+)?(?:\s*g\/L)?/gi },
  // Perte de poids (perte de poids > 20 %, perte de poids supérieure à 30 %)
  { key: "weight-loss", re: /perte\s+de\s+poids\s+(?:>|sup[ée]rieure?\s+à)\s+\d+\s*%/gi },
];

/**
 * Tokenise un snippet en alternant text/crit. Préserve l'ordre des matches.
 * Si aucun crit n'est détecté, retourne un seul token text.
 */
export function tokenizeSnippet(content: string): SnippetToken[] {
  const matches: Array<{ start: number; end: number; value: string; critKey: string }> = [];

  for (const { key, re } of PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        value: m[0],
        critKey: key,
      });
    }
  }

  if (matches.length === 0) {
    return [{ type: "text", value: content }];
  }

  // Trier par position de début, dédupliquer les overlaps (garder le premier)
  matches.sort((a, b) => a.start - b.start);
  const filtered: typeof matches = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start < cursor) continue;
    filtered.push(m);
    cursor = m.end;
  }

  // Construire la liste de tokens
  const tokens: SnippetToken[] = [];
  let lastEnd = 0;
  for (const m of filtered) {
    if (m.start > lastEnd) {
      tokens.push({ type: "text", value: content.slice(lastEnd, m.start) });
    }
    tokens.push({ type: "crit", value: m.value, critKey: m.critKey });
    lastEnd = m.end;
  }
  if (lastEnd < content.length) {
    tokens.push({ type: "text", value: content.slice(lastEnd) });
  }

  return tokens;
}
