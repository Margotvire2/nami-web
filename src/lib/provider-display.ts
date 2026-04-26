/**
 * src/lib/provider-display.ts
 *
 * Helpers d'affichage pour les soignants Nami.
 * Pattern repris de pathwayFamilyLabels.ts (mapping + fonction + fallback).
 */

// ─── Titre de civilité ────────────────────────────────────────────────────────

const PHYSICIAN_VIEWS = new Set(["PHYSICIAN", "PEDIATRICIAN", "ENDOCRINOLOGIST"]);

/**
 * Retourne "Dr " (avec espace) si le soignant est médecin, "" sinon.
 * Les paramédicaux (diét, psy, kiné, infirmier…) ne portent pas le titre "Dr".
 */
export function getProviderTitle(specialtyView: string | null | undefined): string {
  if (!specialtyView) return "";
  return PHYSICIAN_VIEWS.has(specialtyView) ? "Dr " : "";
}

// ─── Libellés FR des spécialités ─────────────────────────────────────────────
// Couvre les valeurs snake_case et kebab-case effectivement présentes en DB.
// Fallback : capitalise la première lettre et remplace _ / - par des espaces.

export const PROVIDER_SPECIALTY_LABELS: Record<string, string> = {
  // Médecins
  medecin_generaliste:        "Médecin généraliste",
  "medecin-generaliste":      "Médecin généraliste",
  medecin_generaliste_du_sport: "Médecin du sport",
  pediatre:                   "Pédiatre",
  cardiologue:                "Cardiologue",
  psychiatre:                 "Psychiatre",
  endocrinologue:             "Endocrinologue",
  dermatologue:               "Dermatologue",
  "gastro-enterologue":       "Gastro-entérologue",
  gastro_enterologue:         "Gastro-entérologue",
  gynecologue:                "Gynécologue",
  gynecologiste:              "Gynécologue",
  neurologue:                 "Neurologue",
  neuropediatre:              "Neuropédiatre",
  ophtalmologue:              "Ophtalmologue",
  ophtalmologiste:            "Ophtalmologue",
  orl:                        "ORL",
  pneumologue:                "Pneumologue",
  radiologue:                 "Radiologue",
  rhumatologue:               "Rhumatologue",
  chirurgien_dentiste:        "Chirurgien-dentiste",
  "chirurgien-dentiste":      "Chirurgien-dentiste",
  anesthesiste:               "Anesthésiste",
  medecin_interne:            "Médecine interne",
  // Paramédicaux
  dieteticien:                "Diététicien·ne",
  dieteticienne:              "Diététicien·ne",
  psychologue:                "Psychologue",
  orthophoniste:              "Orthophoniste",
  kinesitherapeute:           "Masseur-kinésithérapeute",
  "masseur-kinesitherapeute": "Masseur-kinésithérapeute",
  masseur_kinesitherapeute:   "Masseur-kinésithérapeute",
  infirmier:                  "Infirmier·ère",
  infirmiere:                 "Infirmier·ère",
  sage_femme:                 "Sage-femme",
  "sage-femme":               "Sage-femme",
  ergotherapeute:             "Ergothérapeute",
  psychomotricien:            "Psychomotricien·ne",
  podologue:                  "Podologue",
  pharmacien:                 "Pharmacien·ne",
  osteopathe:                 "Ostéopathe",
  // Catégories libres fréquentes
  dietetique:                 "Diététicien·ne",
  nutrition:                  "Nutrition",
  tca:                        "Spécialiste TCA",
  obesite:                    "Spécialiste obésité",
  addictologie:               "Addictologue",
  pedopsychiatre:             "Pédopsychiatre",
};

/**
 * Retourne le libellé FR d'une spécialité.
 * Fallback : remplace _ et - par des espaces, capitalise la première lettre.
 *
 * @example formatProviderSpecialty("dieteticien")        → "Diététicien·ne"
 * @example formatProviderSpecialty("medecin_generaliste") → "Médecin généraliste"
 * @example formatProviderSpecialty("PSYCHIATRE")          → "Psychiatre"
 */
export function formatProviderSpecialty(specialty: string | null | undefined): string {
  if (!specialty) return "";
  const normalized = specialty.toLowerCase().trim();
  if (PROVIDER_SPECIALTY_LABELS[normalized]) return PROVIDER_SPECIALTY_LABELS[normalized];
  // Si déjà lisible (contient des minuscules accentuées ou espaces), retourner tel quel
  if (/[àâéèêëîïôùûüçœæ ]/.test(specialty)) return specialty;
  // Fallback SCREAMING_CASE ou slug → Title Case
  return normalized
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}
