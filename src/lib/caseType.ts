/**
 * Mapping unifié des types de parcours (caseType).
 *
 * Source unique pour :
 *   - badges colorés cockpit (agenda, patients, adressages, aujourd-hui, messages)
 *   - labels lisibles
 *   - couleurs cohérentes
 *
 * Fallback intelligent : "NEW_TYPE" → "New type" (snake_case → Title case)
 */

export interface CareTypeConfig {
  label: string;
  color: string; // couleur texte/bordure (hex)
  bg: string;    // couleur fond (hex, semi-transparent)
}

const CARE_TYPE_MAP: Record<string, CareTypeConfig> = {
  TCA:           { label: "TCA",                  color: "#7C3AED", bg: "#EDE9FE" },
  OBESITY:       { label: "Obésité",              color: "#D97706", bg: "#FEF3C7" },
  PEDIATRIC:     { label: "Pédiatrie",            color: "#059669", bg: "#D1FAE5" },
  MENTAL_HEALTH: { label: "Santé mentale",        color: "#2563EB", bg: "#DBEAFE" },
  CHRONIC:       { label: "Chron. complexe",      color: "#6B7280", bg: "#F3F4F6" },
  CHRONIC_PAIN:  { label: "Douleur chronique",    color: "#DC2626", bg: "#FEE2E2" },
  METABOLIC:     { label: "Métabolisme",          color: "#E6993E", bg: "#FEF3C7" },
  GASTRO:        { label: "Gastroentérologie",    color: "#EA580C", bg: "#FFEDD5" },
  GYNECO:        { label: "Gynécologie",          color: "#EC4899", bg: "#FCE7F3" },
  ADDICTION:     { label: "Addictologie",         color: "#DC2626", bg: "#FEE2E2" },
  NUTRITION:     { label: "Nutrition",            color: "#10B981", bg: "#D1FAE5" },
  OTHER:         { label: "Suivi",                color: "#6B7280", bg: "#F3F4F6" },
};

/** Retourne la config couleur+label pour un caseType.
 *  Fallback pour tout type inconnu : "SOME_NEW_TYPE" → "Some new type" */
export function getCareType(raw?: string | null): CareTypeConfig {
  if (!raw) return CARE_TYPE_MAP.OTHER;
  if (CARE_TYPE_MAP[raw]) return CARE_TYPE_MAP[raw];
  const label = raw
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
  return { label, color: "#6B7280", bg: "#F3F4F6" };
}

/** Raccourcis pour les endroits qui n'ont besoin que d'une valeur */
export const getCareTypeLabel = (raw?: string | null) => getCareType(raw).label;
export const getCareTypeColor = (raw?: string | null) => getCareType(raw).color;
