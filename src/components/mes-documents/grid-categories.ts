/**
 * Catégories grid V1 de /mes-documents. Mapping DocumentType Prisma →
 * catégorie visible côté patient. TRANSCRIPTION est filtrée systématiquement
 * (artefact audio brut, jamais exposée patient-side). LETTER et OTHER ne sont
 * pas dans les 4 grosses cases V1 — accessibles uniquement via la vue
 * "Tous mes documents" (cat=ALL).
 */

export type GridCategoryKey =
  | "BILANS"
  | "ORDONNANCES"
  | "COMPTES_RENDUS"
  | "EXAMENS"
  | "ALL";

export interface GridCategoryMeta {
  key: GridCategoryKey;
  emoji: string;
  label: string;
  description: string;
  accent: string;
  bg: string;
}

/**
 * Ordre d'affichage canonique de la grid (4 cases). "ALL" n'est pas dans la
 * grid principale — il est exposé via un lien discret "Voir tous mes documents".
 */
export const GRID_CATEGORIES: readonly GridCategoryMeta[] = [
  {
    key: "BILANS",
    emoji: "🧪",
    label: "Mes bilans",
    description: "Résultats biologiques",
    accent: "#2563EB",
    bg: "#EFF6FF",
  },
  {
    key: "ORDONNANCES",
    emoji: "💊",
    label: "Mes ordonnances",
    description: "Traitements prescrits",
    accent: "#059669",
    bg: "#ECFDF5",
  },
  {
    key: "COMPTES_RENDUS",
    emoji: "📋",
    label: "Mes comptes-rendus",
    description: "Suite à une consultation",
    accent: "#D97706",
    bg: "#FFFBEB",
  },
  {
    key: "EXAMENS",
    emoji: "🩻",
    label: "Mes examens",
    description: "Imagerie, ECG, ostéodensitométrie…",
    accent: "#0EA5E9",
    bg: "#F0F9FF",
  },
] as const;

/**
 * Métadonnées de la vue "Tous mes documents" (cat=ALL) — exposée comme
 * fallback pour accéder aux LETTER/OTHER qui ne sont pas dans la grid V1.
 */
export const ALL_CATEGORY_META: GridCategoryMeta = {
  key: "ALL",
  emoji: "📁",
  label: "Tous mes documents",
  description: "Vue plate de tous les documents partagés",
  accent: "#5B4EC4",
  bg: "#EFEDF8",
};

/**
 * Bucket virtuel "Examens" = HOSPITAL_REPORT + IMAGING + ECG_REPORT +
 * IMPEDANCE_REPORT + DXA_REPORT. Cohérence métier : un compte-rendu
 * d'hospitalisation contient typiquement les examens réalisés.
 *
 * Retourne null pour les types non exposés en grid V1 (LETTER, OTHER,
 * TRANSCRIPTION) — ils restent visibles dans la vue "Tous mes documents".
 */
export function mapDocTypeToGridCategory(
  docType: string,
): Exclude<GridCategoryKey, "ALL"> | null {
  switch (docType) {
    case "BIOLOGICAL_REPORT":
      return "BILANS";
    case "PRESCRIPTION":
      return "ORDONNANCES";
    case "CONSULTATION_REPORT":
      return "COMPTES_RENDUS";
    case "HOSPITAL_REPORT":
    case "IMAGING":
    case "ECG_REPORT":
    case "IMPEDANCE_REPORT":
    case "DXA_REPORT":
      return "EXAMENS";
    default:
      return null;
  }
}

/**
 * Documents masqués côté patient (artefacts internes). TRANSCRIPTION =
 * fichier audio brut généré par le service de transcription — n'est jamais
 * destiné à être présenté au patient.
 */
export function isVisiblePatientDoc(docType: string): boolean {
  return docType !== "TRANSCRIPTION";
}

/**
 * Filtre une liste de documents par catégorie grid. "ALL" renvoie tous
 * les documents visibles patient (donc sans TRANSCRIPTION).
 */
export function filterDocsByGridCategory<T extends { documentType: string }>(
  docs: T[],
  category: GridCategoryKey,
): T[] {
  const visible = docs.filter((d) => isVisiblePatientDoc(d.documentType));
  if (category === "ALL") return visible;
  return visible.filter(
    (d) => mapDocTypeToGridCategory(d.documentType) === category,
  );
}

export type GridCounts = Record<GridCategoryKey, number>;

/**
 * Compte les documents visibles par catégorie. Utilisé pour les badges
 * de la grid + chips CategorieFilter.
 */
export function computeGridCounts<T extends { documentType: string }>(
  docs: T[],
): GridCounts {
  const counts: GridCounts = {
    BILANS: 0,
    ORDONNANCES: 0,
    COMPTES_RENDUS: 0,
    EXAMENS: 0,
    ALL: 0,
  };
  for (const d of docs) {
    if (!isVisiblePatientDoc(d.documentType)) continue;
    counts.ALL += 1;
    const cat = mapDocTypeToGridCategory(d.documentType);
    if (cat) counts[cat] += 1;
  }
  return counts;
}

/**
 * Valide qu'une chaîne URL ?cat= correspond à une GridCategoryKey connue.
 * Retourne null sinon — la page tombe alors en mode "racine" (grid).
 */
export function parseGridCategoryParam(raw: string | null): GridCategoryKey | null {
  if (!raw) return null;
  switch (raw) {
    case "BILANS":
    case "ORDONNANCES":
    case "COMPTES_RENDUS":
    case "EXAMENS":
    case "ALL":
      return raw;
    default:
      return null;
  }
}
