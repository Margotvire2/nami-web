/**
 * Profil clinique du patient pour la coloration contextuelle des deltas.
 *
 * underweight : anorexie / TCA restrictif / dénutrition — tout gain = bien, toute perte = alarme
 * overweight  : obésité / syndrome métabolique — perte de graisse = bien, perte de muscle = alarme
 * neutral     : pas de contexte connu — couleur neutre (gris)
 */

export type ClinicalProfile = "underweight" | "overweight" | "neutral";

/**
 * Détecte le profil clinique depuis le caseType et le pathwayTemplateId du dossier.
 * Ne nécessite pas de requête supplémentaire.
 */
export function getClinicalProfile(careCase?: {
  caseType?: string | null;
  pathwayTemplateId?: string | null;
}): ClinicalProfile {
  if (!careCase) return "neutral";

  const ct = (careCase.caseType || "").toLowerCase();
  const pw = (careCase.pathwayTemplateId || "").toLowerCase();

  // Dénutrition / TCA restrictif / anorexie
  if (
    ct === "tca" ||
    pw.includes("tca") ||
    pw.includes("anorex") ||
    pw.includes("denutr") ||
    pw.includes("restriction")
  ) {
    return "underweight";
  }

  // Surpoids / Obésité
  if (
    ct === "obesity" ||
    pw.includes("obes") ||
    pw.includes("surpoids")
  ) {
    return "overweight";
  }

  return "neutral";
}

/**
 * Préférence directionnelle par profil clinique.
 * "up_good"   : hausse = positif, baisse = alarme
 * "down_good" : baisse = positif, hausse = alarme
 * "neutral"   : pas de couleur directionnelle
 */
type Direction = "up_good" | "down_good" | "neutral";

const UNDERWEIGHT_DIRECTIONS: Record<string, Direction> = {
  // Anthropométrie
  weight_kg:             "up_good",
  bmi:                   "up_good",
  // Composition corporelle
  fat_mass_kg:           "up_good",
  fat_mass_pct:          "up_good",
  fat_free_mass_kg:      "up_good",
  skeletal_muscle_mass:  "up_good",
  appendicular_smm:      "up_good",
  body_cell_mass:        "up_good",
  total_body_water:      "up_good",
  total_protein_mass:    "up_good",
  bone_mineral_content:  "up_good",
  // Indices
  ffmi:                  "up_good",
  fmi:                   "up_good",
  asmi:                  "up_good",
  smi:                   "up_good",
  bia_smm_weight_ratio:  "up_good",
  // Métabolisme
  basal_metabolic_rate:  "up_good",
  bia_basal_metabolic_rate_ref: "up_good",
  bia_total_energy_expenditure: "up_good",
  // BIA hydratation & phases
  phase_angle:           "up_good",
  bia_e_i_ratio:         "up_good",
  // Scores psy (baisser = mieux dans les deux profils)
  phq9_score:            "down_good",
  eat26_score:           "down_good",
  gad7_score:            "down_good",
  binge_eating_score:    "down_good",
  // Gaps BIA (baisser gap = se rapprocher de la cible = mieux)
  bia_fat_mass_gap:      "down_good",
  bia_muscle_mass_gap:   "down_good",
  bia_water_volume_gap:  "down_good",
  bia_bone_mineral_gap:  "down_good",
};

const OVERWEIGHT_DIRECTIONS: Record<string, Direction> = {
  // Anthropométrie
  weight_kg:             "down_good",
  bmi:                   "down_good",
  // Graisse → perdre
  fat_mass_kg:           "down_good",
  fat_mass_pct:          "down_good",
  fmi:                   "down_good",
  bia_cardiovascular_risk_score: "down_good",
  bia_metabolic_risk_score:      "down_good",
  // Masse maigre → préserver
  fat_free_mass_kg:      "up_good",
  skeletal_muscle_mass:  "up_good",
  appendicular_smm:      "up_good",
  body_cell_mass:        "up_good",
  ffmi:                  "up_good",
  asmi:                  "up_good",
  smi:                   "up_good",
  // Scores psy
  phq9_score:            "down_good",
  eat26_score:           "down_good",
  gad7_score:            "down_good",
  binge_eating_score:    "down_good",
  // Gaps
  bia_fat_mass_gap:      "down_good",
  bia_muscle_mass_gap:   "down_good",
};

function getDirection(metricKey: string, profile: ClinicalProfile): Direction {
  if (profile === "underweight") return UNDERWEIGHT_DIRECTIONS[metricKey] ?? "neutral";
  if (profile === "overweight")  return OVERWEIGHT_DIRECTIONS[metricKey] ?? "neutral";
  return "neutral";
}

/**
 * Retourne la classe Tailwind de couleur pour un delta donné,
 * en tenant compte du profil clinique du patient.
 */
export function getDeltaColorClass(
  metricKey: string,
  delta: number,
  profile: ClinicalProfile
): string {
  if (delta === 0) return "text-gray-400";

  const dir = getDirection(metricKey, profile);
  if (dir === "neutral") return "text-gray-500";

  const isGood = (dir === "up_good" && delta > 0) || (dir === "down_good" && delta < 0);
  return isGood ? "text-emerald-600" : "text-red-500";
}
