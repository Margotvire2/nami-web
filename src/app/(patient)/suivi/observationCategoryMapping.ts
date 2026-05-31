// Mapping côté patient des observations cliniques par catégorie.
// Décision UX 31/05 (Option D) : groupement + disclaimer interprétatif sur la
// biologie, masquage V1 des scores cliniques (override soignant V1.1+).
// Aucune obs cliniquement retirée — uniquement organisée et contextualisée.

export type PatientObservationCategory =
  | "anthropometry"
  | "body_composition"
  | "vital_signs"
  | "biology"
  | "score"
  | "other";

export interface CategorizableIndicator {
  slug: string;
  label: string;
}

// Normalise une string pour matcher slug + label (lowercase, sans accents,
// séparateurs uniformes). On compare ensuite contre des keywords plats.
function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[_\-./]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Matche si l'une des keywords apparaît comme mot/sous-séquence dans le texte
// normalisé. Pour les acronymes très courts (k, na, fc...) on impose un match
// "mot entier" via bordures \b pour éviter les faux positifs (ex : "kg" qui
// contiendrait "k").
function hasKeyword(text: string, keywords: ReadonlyArray<string>): boolean {
  for (const kw of keywords) {
    if (kw.length <= 3) {
      const re = new RegExp(`(^|\\s)${kw}(\\s|$)`, "i");
      if (re.test(text)) return true;
    } else if (text.includes(kw)) {
      return true;
    }
  }
  return false;
}

const ANTHROPOMETRY_KEYWORDS = [
  "poids",
  "imc",
  "bmi",
  "taille",
  "tour de taille",
  "tour taille",
  "perimetre",
  "perimetre abdominal",
  "perimetre brachial",
  "perimetre cranien",
  "circumference",
  "hauteur",
] as const;

const BODY_COMPOSITION_KEYWORDS = [
  "masse grasse",
  "masse maigre",
  "eau corporelle",
  "bia",
  "impedance",
  "metabolisme de base",
  "metabolisme basal",
  "tissu adipeux",
  "muscle squelettique",
] as const;

const VITAL_SIGNS_KEYWORDS = [
  "frequence",
  "fc",
  "bpm",
  "ta",
  "tension",
  "saturation",
  "spo2",
  "temperature",
  "pouls",
  "rythme cardiaque",
] as const;

const BIOLOGY_KEYWORDS = [
  "potassium",
  "k",
  "sodium",
  "na",
  "crp",
  "ferritine",
  "glycemie",
  "hba1c",
  "creatinine",
  "uree",
  "alat",
  "asat",
  "ggt",
  "hemoglobine",
  "hb",
  "leucocytes",
  "plaquettes",
  "cholesterol",
  "ldl",
  "hdl",
  "triglycerides",
  "tsh",
  "t3",
  "t4",
  "vitamine",
  "calcium",
  "magnesium",
  "phosphore",
  "albumine",
  "bilirubine",
  "lipase",
  "amylase",
] as const;

const SCORE_KEYWORDS = [
  "eat 26",
  "eat26",
  "bdi",
  "had",
  "edeq",
  "ede q",
  "score",
  "echelle",
] as const;

/**
 * Catégorise un indicateur observable côté patient à partir de son slug et
 * label. Le match va du plus spécifique (biologie) au plus générique (other).
 * Ordre intentionnel : biology AVANT vital_signs pour éviter qu'un libellé
 * comme "Hémoglobine glyquée" ne tombe dans une mauvaise case.
 */
export function categorizeIndicator(
  indicator: CategorizableIndicator,
): PatientObservationCategory {
  const haystack = `${normalize(indicator.slug)} ${normalize(indicator.label)}`;

  if (hasKeyword(haystack, BIOLOGY_KEYWORDS)) return "biology";
  if (hasKeyword(haystack, BODY_COMPOSITION_KEYWORDS)) return "body_composition";
  if (hasKeyword(haystack, ANTHROPOMETRY_KEYWORDS)) return "anthropometry";
  if (hasKeyword(haystack, VITAL_SIGNS_KEYWORDS)) return "vital_signs";
  if (hasKeyword(haystack, SCORE_KEYWORDS)) return "score";
  return "other";
}

/**
 * Filtre V1 launch : les scores cliniques (EAT-26, BDI, HAD, EDE-Q...) restent
 * cachés côté patient. Override soignant viendra V1.1+ (ticket dérivé).
 */
export function shouldShowToPatient(category: PatientObservationCategory): boolean {
  return category !== "score";
}

/**
 * Indique si la catégorie nécessite le disclaimer permanent d'interprétation.
 * Seule la biologie en a besoin : un potassium ou une CRP hors fourchette n'a
 * aucun sens isolé sans le contexte clinique du soignant.
 */
export function needsInterpretationDisclaimer(
  category: PatientObservationCategory,
): boolean {
  return category === "biology";
}

// Libellés MDR-safe — aucun mot clinique anxiogène, aucune pathologie nommée.
export const CATEGORY_LABELS: Record<PatientObservationCategory, string> = {
  anthropometry: "Mensurations",
  body_composition: "Composition de votre corps",
  vital_signs: "Lors de vos consultations",
  biology: "Bilans biologiques",
  score: "Questionnaires",
  other: "Autres mesures",
};

// Ordre d'affichage : du plus lisible patient au plus technique.
export const CATEGORY_ORDER: ReadonlyArray<PatientObservationCategory> = [
  "anthropometry",
  "body_composition",
  "vital_signs",
  "biology",
  "other",
  "score",
];
