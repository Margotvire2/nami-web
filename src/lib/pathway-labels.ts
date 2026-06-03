/**
 * Vocabulaire canonique du parcours — cross-espaces (cockpit + patient).
 *
 * Doctrine (cf. CROSS_ESPACES_AUDIT_2026_06_03 §5.8 corollaire 3) :
 *   - "phase"  → niveau groupe (EVAL_MULTIDIM, SEQ1_INTENSIVE, …)
 *   - "étape"  → niveau unité (un PathwayNode / PathwayTemplateStep individuel)
 *
 * Ce helper expose la pluralisation et délègue le mapping code→FR aux deux
 * référentiels existants pour éviter toute duplication :
 *   - pcr-labels.ts          (labels PCR Obésité — arrêté SFHS2604251A)
 *   - pathwayFamilyLabels.ts (familles génériques + fallback Title Case)
 */

import { labelPhase as pcrLabelPhase } from "./pcr-labels";
import { getPhaseLabel } from "./pathwayFamilyLabels";

export const PATHWAY_TERMS = {
  phaseGroup: { singular: "phase", plural: "phases" },
  stepUnit:   { singular: "étape", plural: "étapes" },
} as const;

/** "1 étape" / "5 étapes" — utilisé pour décrire des PathwayNode/Step unitaires. */
export function stepCountLabel(count: number): string {
  const term = count > 1 ? PATHWAY_TERMS.stepUnit.plural : PATHWAY_TERMS.stepUnit.singular;
  return `${count} ${term}`;
}

/** "1 phase" / "3 phases" — utilisé pour décrire des groupes de phases. */
export function phaseCountLabel(count: number): string {
  const term = count > 1 ? PATHWAY_TERMS.phaseGroup.plural : PATHWAY_TERMS.phaseGroup.singular;
  return `${count} ${term}`;
}

/**
 * Retourne le label FR d'un code de phase en consultant les deux référentiels.
 * Priorité pcr-labels (codes spécifiques PCR Obésité), fallback pathwayFamilyLabels
 * (codes génériques + Title Case si inconnu).
 */
export function pathwayPhaseLabel(code: string | null | undefined): string {
  if (!code) return "Sans phase";
  const fromPcr = pcrLabelPhase(code);
  // pcr-labels renvoie le code brut quand inconnu — détecte ce cas et délègue
  if (fromPcr !== code) return fromPcr;
  return getPhaseLabel(code);
}
