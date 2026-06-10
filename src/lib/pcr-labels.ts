/**
 * Mapping codes (DB) → labels affichables (UI)
 * Traduit les valeurs brutes stockées en DB (codes arrêté SFHS2604251A,
 * codes spécialités) en libellés français lisibles.
 *
 * Source : Arrêté du 26 février 2026 (NOR SFHS2604251A) +
 *          DP gouvernement 24 avril 2026
 */

export const PHASE_LABELS_PCR: Record<string, string> = {
  EVAL_MULTIDIM:    "Évaluation multidimensionnelle",
  SEQ1_INTENSIVE:   "Séquence 1 — Prise en charge initiale intensive",
  SEQ2_SUIVI:       "Séquence 2 — Suivi renforcé",
  TRANSVERSAL:      "Critères d'escalade",
  // Fallbacks legacy si encore en DB sur certains parcours
  EVALUATION_INITIALE:    "Évaluation initiale",
  TRAITEMENT_ACTIF:       "Traitement actif",
  REEVALUATION:           "Réévaluation",
  BILAN_COMPLEMENTAIRE:   "Bilan complémentaire",
  SUIVI_LONG_COURS:       "Suivi au long cours",
  ANNONCE_PLAN:           "Annonce du plan de soins",
  ESCALADE:               "Escalade",
};

export const PHASE_SUBTITLES: Record<string, string> = {
  EVAL_MULTIDIM:    "8 axes du bilan initial · Annexe 2.2.1° de l'arrêté",
  SEQ1_INTENSIVE:   "12 mois (max 18) · sous-séquences possibles",
  SEQ2_SUIVI:       "12 mois max · suivi renforcé post-séquence intensive",
  TRANSVERSAL:      "Mobilisable à tout moment du parcours",
};

/**
 * INVARIANT — deux règles à ne jamais casser :
 * 1. Clés en minuscules uniquement (labelSpecialty normalise via .toLowerCase() avant lookup).
 *    Ne jamais ajouter de clé en MAJUSCULES — ce serait un doublon mort.
 * 2. Valeurs = titre du PROFESSIONNEL, pas la discipline.
 *    ✅ "Psychiatre", "Psychologue", "Médecin généraliste"
 *    ❌ "Psychiatrie", "Psychologie", "Médecine générale"  ← régression connue, déjà remontée 3×
 */
export const SPECIALTY_LABELS_NODES: Record<string, string> = {
  "médecine générale":       "Médecine générale",
  "medecine_generale":       "Médecine générale",
  "medecine generale":       "Médecine générale",
  "dietetique":              "Diététique",
  "diététique":              "Diététique",
  "psychologie":             "Psychologue",
  "psychiatrie":             "Psychiatre",
  "endocrinologie":          "Endocrinologie",
  "activite_physique":       "Activité physique adaptée",
  "kinesitherapie":          "Kinésithérapie",
  "kinésithérapie":          "Kinésithérapie",
  "biologie médicale":       "Biologie médicale",
  "biologie_medicale":       "Biologie médicale",
  "pneumologie":             "Pneumologie",
  "cardiologie":             "Cardiologie",
  "chirurgie":               "Chirurgie",
  "education_therapeutique": "Éducation thérapeutique",
  "éducation thérapeutique": "Éducation thérapeutique",
  "gastroenterologie":       "Gastro-entérologie",
  "pediatrie":               "Pédiatrie",
  "coordination":            "Coordination",
  "nutrition":               "Diététicienne",
  "dentaire":                "Chirurgien-dentiste",
  "radiologie":              "Radiologie",
  "pluridisciplinaire":      "Pluridisciplinaire",
};

export const ACT_TYPE_LABELS_FR: Record<string, string> = {
  CONSULTATION:   "Consultation",
  BILAN:          "Bilan",
  PRESCRIPTION:   "Prescription",
  SUIVI:          "Suivi",
  EDUCATION:      "Éducation thérapeutique",
  RCP:            "RCP",
  QUESTIONNAIRE:  "Questionnaire",
  PSYCHOTHERAPIE: "Psychothérapie",
};

/** Retourne le label FR d'une phase avec fallback sur la valeur brute */
export function labelPhase(code: string | null | undefined): string {
  if (!code) return "Sans phase";
  return PHASE_LABELS_PCR[code] ?? code;
}

function safeLabelFallback(normalized: string): string {
  return normalized
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Retourne le label FR d'une spécialité node-level — insensible à la casse, jamais d'enum brut */
export function labelSpecialty(code: string | null | undefined): string {
  if (!code) return "—";
  const normalized = code.toLowerCase();
  return SPECIALTY_LABELS_NODES[normalized] ?? safeLabelFallback(normalized);
}

/** Retire les séparateurs cadratin/demi du titre affiché en liste (la source DATA n'est pas modifiée) */
export function cleanTitle(label: string): string {
  return label.split(/\s*[—–]\s*/)[0].trim();
}

/** Retourne le label FR d'un type d'acte avec fallback */
export function labelActType(code: string | null | undefined): string {
  if (!code) return "—";
  return ACT_TYPE_LABELS_FR[code] ?? code;
}

/** Retourne le sous-titre de phase ou null si inexistant */
export function subtitlePhase(code: string | null | undefined): string | null {
  if (!code) return null;
  return PHASE_SUBTITLES[code] ?? null;
}
