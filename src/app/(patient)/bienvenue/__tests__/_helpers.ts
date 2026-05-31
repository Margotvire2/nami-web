/**
 * Helpers de test pour /bienvenue.
 *
 * Liste des mots interdits (extrait CLAUDE.md MDR-safe).
 * On vérifie seulement leur absence dans les copies utilisateur — la prose
 * MDR-safe doit utiliser : coordination, organiser, structurer, faciliter, etc.
 *
 * NB : on évite "risque" / "danger" car ces mots peuvent apparaître dans des
 * tests futurs (ex : "à risque de panne"). Le focus est sur les mots strictement
 * cliniques (diagnostic, pathologie, dépistage…) listés ci-dessous.
 */
export const FORBIDDEN_MOTS: string[] = [
  "suspicion",
  "diagnostic",
  "pathologie",
  "anorexie",
  "boulimie",
  "ARFID",
  "hyperphagie",
  "orthorexie",
];

/**
 * Détecte un mot interdit dans une chaîne (case-insensitive, recherche substring).
 */
export function faqContainsMot(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}
