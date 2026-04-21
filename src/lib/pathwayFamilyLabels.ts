/**
 * Labels de spécialité en français pour les familles de PathwayTemplate.
 * Utilisé dans les dropdowns de sélection de parcours.
 */
export const SPECIALTY_LABELS: Record<string, string> = {
  addiction:           "Addictologie",
  allergie:            "Allergologie",
  cardio:              "Cardiologie",
  chirurgie:           "Chirurgie / RAAC",
  dermato:             "Dermatologie pédiatrique",
  dermatologie:        "Dermatologie",
  diabete:             "Diabétologie",
  digestif:            "Maladies inflammatoires digestives",
  douleur:             "Douleur chronique",
  dt2:                 "Diabète de type 2",
  endocrino:           "Endocrinologie",
  endometriose:        "Endométriose",
  gastro:              "Gastro-entérologie",
  genetique:           "Génétique",
  geriatrie:           "Gériatrie",
  gynecologie:         "Gynécologie",
  handicap:            "Handicap",
  hemato:              "Hématologie pédiatrique",
  hematologie:         "Hématologie",
  hepatique:           "Hépatologie",
  hta:                 "Hypertension artérielle",
  immunologie:         "Immunologie",
  infectiologie:       "Infectiologie",
  lithiase:            "Lithiases",
  maladies_rares:      "Maladies rares",
  medecine_interne:    "Médecine interne",
  medecine_sport:      "Médecine du sport",
  medecine_travail:    "Médecine du travail",
  nafld:               "NAFLD / NASH",
  nephro:              "Néphrologie",
  neurodeveloppement:  "Neurodéveloppement",
  neurologie:          "Neurologie",
  neuropsy:            "Neuropsychologie / Troubles dys",
  nutrition:           "Nutrition pédiatrique",
  nutrition_clinique:  "Nutrition clinique",
  obesity:             "Obésité",
  oncologie:           "Oncologie / Nutrition",
  ophtalmologie:       "Ophtalmologie",
  orl:                 "ORL",
  ortho:               "Orthopédie",
  pediatrics:          "Pédiatrie générale",
  pedopsychiatrie:     "Pédopsychiatrie",
  perinatologie:       "Périnatalité",
  plaies_cicatrisation:"Plaies et cicatrisation",
  pma_reproduction:    "PMA / Reproduction",
  pneumologie:         "Pneumologie",
  post_bariatrique:    "Post-chirurgie bariatrique",
  psychiatrie:         "Psychiatrie",
  readaptation:        "Réadaptation",
  renal:               "Néphrologie / IRC",
  rhumato:             "Rhumatologie",
  sahos:               "SAHOS / Sommeil",
  sante_mentale:       "Santé mentale",
  soins_palliatifs:    "Soins palliatifs",
  sommeil:             "Troubles du sommeil",
  sopk:                "SOPK",
  tca:                 "Troubles des conduites alimentaires",
  transplantation:     "Transplantation",
  urologie:            "Urologie",
  vasculaire:          "Vasculaire",
};

/** Retourne le label français d'une famille, ou la valeur brute en fallback */
export function getFamilyLabel(family: string): string {
  return SPECIALTY_LABELS[family] ?? family;
}

/** Labels français des phases de parcours (stockées en SCREAMING_SNAKE_CASE en DB) */
export const PHASE_LABELS: Record<string, string> = {
  EVALUATION_INITIALE:    "Évaluation initiale",
  TRAITEMENT_ACTIF:       "Traitement actif",
  REEVALUATION:           "Réévaluation",
  BILAN_COMPLEMENTAIRE:   "Bilan complémentaire",
  ANNONCE_PLAN:           "Annonce du plan de soins",
  SUIVI_LONG_COURS:       "Suivi au long cours",
  ESCALADE:               "Escalade",
  BILAN:                  "Bilan",
  CONSULTATION:           "Consultation",
  EDUCATION:              "Éducation thérapeutique",
  PRESCRIPTION:           "Prescription",
  QUESTIONNAIRE:          "Questionnaire",
  SUIVI:                  "Suivi",
};

/**
 * Retourne le label français d'une phase de parcours.
 * Fallback élégant pour les clés inconnues : "MOT_CLE" → "Mot clé"
 */
export function getPhaseLabel(key: string): string {
  if (!key) return "Sans phase";
  if (PHASE_LABELS[key]) return PHASE_LABELS[key];
  // Fallback : déjà en français (clés créées par les nouveaux scripts)
  if (/[a-zàâéèêëîïôùûüçœæ]/.test(key)) return key;
  // SCREAMING_SNAKE_CASE inconnu → Title Case
  return key.replace(/_/g, " ").toLowerCase().replace(/^\w/, c => c.toUpperCase());
}

/** Grouper une liste de templates par famille, triée par label français */
export function groupByFamily<T extends { family: string }>(
  items: T[]
): Array<{ family: string; label: string; items: T[] }> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const fam = item.family || "autres";
    if (!map.has(fam)) map.set(fam, []);
    map.get(fam)!.push(item);
  }
  return Array.from(map.entries())
    .map(([family, items]) => ({ family, label: getFamilyLabel(family), items }))
    .sort((a, b) => a.label.localeCompare(b.label, "fr"));
}
