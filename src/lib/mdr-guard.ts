/**
 * mdr-guard — Lexique interdit dans les UI strings de Nami
 *
 * Nami est un canal de coordination, PAS un dispositif médical (MDR 2017/745)
 * ni un outil de télésurveillance médicale (Art. R6316-1 CSP).
 *
 * Un seul mot interdit dans une UI string suffit à exposer Nami à une
 * requalification réglementaire (DM Class IIa, MDCG 2019-11). Ce module
 * définit les patterns à proscrire et la fonction `containsForbidden`
 * utilisée par le test CI guard (`mdr-ui-strings.test.tsx`).
 *
 * Périmètre : UI strings uniquement (literal strings dans les .tsx hors KB).
 * Hors périmètre : contenu KB (decision-trees, kb_v2 chunks), tests, comments.
 *
 * Source canonique du lexique :
 *   ~/.claude/skills/nami-brand-copy/references/forbidden-lexicon.md
 */

export const FORBIDDEN_WORDS: ReadonlyArray<string> = [
  // Surveillance / Détection clinique
  "surveillance",
  "surveiller",
  "monitoring",
  "alerte clinique",
  "alerte santé",
  "détecter",
  "détection",
  "drapeaux rouges",
  // Jugement clinique / promesse
  "anormal",
  "risque clinique",
  "danger clinique",
  "mayday",
  "à vérifier par le soignant",
  "pathologie suggérée",
  "diagnostic suggéré",
  "écart de trajectoire",
  "écarts de trajectoire",
  "trajectoire détectée",
  // Outputs IA bloquants
  "non observance",
  "non-observance",
];

const NORMALIZED_FORBIDDEN = FORBIDDEN_WORDS.map((w) => w.toLowerCase());

/**
 * Retourne le premier mot interdit trouvé dans `text`, ou `null`.
 * Comparaison normalisée minuscules + accents préservés.
 */
export function containsForbidden(text: string): string | null {
  if (!text) return null;
  const haystack = text.toLowerCase();
  for (const needle of NORMALIZED_FORBIDDEN) {
    if (haystack.includes(needle)) return needle;
  }
  return null;
}
