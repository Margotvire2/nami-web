/**
 * Design tokens partagés des atoms du module intelligence/.
 * Phase 3.B.3 — palette Nami stricte verrouillée.
 *
 * NB : ce fichier est SCOPE-LOCAL au module intelligence/atoms/.
 * Ne PAS importer depuis d'autres modules sans audit.
 */

export const NAMI = {
  violet: "#5B4EC4",
  violetHover: "#4c44b0",
  violetSoft: "rgba(91, 78, 196, 0.10)",
  violetSoft2: "rgba(91, 78, 196, 0.18)",
  violetSoft3: "rgba(91, 78, 196, 0.30)",
  teal: "#2BA89C",
  tealSoft: "rgba(43, 168, 156, 0.12)",
  tealText: "#1f7d72",
  bg: "#FAFAF8",
  bgAlt: "#F5F3EF",
  dark: "#1A1A2E",
  text: "#1A1A2E",
  textMuted: "#4A4A5A",
  textFaint: "#6B7280",
  border: "rgba(26, 26, 46, 0.06)",
  borderStrong: "rgba(26, 26, 46, 0.12)",
  ease: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

export type RagSourceKind = "HAS" | "FFAB" | "NAMI_ALGO" | "NAMI_EXTRACT";

/**
 * Dérive la source humaine (HAS / FFAB / Nami algo / Nami extrait) à partir
 * du slug RAG, dans l'esprit de l'artifact V4. Mapping conservateur :
 *
 *   sem_*    → NAMI_EXTRACT (extrait sémantique généré par Nami, isAI=true)
 *   algo_*   → NAMI_ALGO    (algorithme structuré généré par Nami, isAI=true)
 *   pcr-*    → NAMI_EXTRACT (parcours, ai-assisted)
 *   ffab_*   → FFAB         (Fédération Française Anorexie Boulimie)
 *   fs-* / reco2clics / has-* → HAS
 *   ke_* + reste → HAS par défaut (fiche brute documentaire)
 */
export function deriveRagSource(slug: string): {
  kind: RagSourceKind;
  label: string;
  isAI: boolean;
} {
  const s = slug.toLowerCase();
  if (s.startsWith("ffab_") || s.includes("ffab")) {
    return { kind: "FFAB", label: "FFAB", isAI: false };
  }
  if (s.startsWith("sem_")) {
    return { kind: "NAMI_EXTRACT", label: "Nami extrait", isAI: true };
  }
  if (s.startsWith("algo_")) {
    return { kind: "NAMI_ALGO", label: "Nami algo", isAI: true };
  }
  if (s.startsWith("pcr-")) {
    return { kind: "NAMI_EXTRACT", label: "Nami parcours", isAI: true };
  }
  return { kind: "HAS", label: "HAS", isAI: false };
}

/**
 * Variant de couleur de la RelevanceBar — déterminé par la source humaine.
 */
export function relevanceVariant(kind: RagSourceKind): "has" | "ffab" | "nami" {
  if (kind === "FFAB") return "ffab";
  if (kind === "NAMI_ALGO" || kind === "NAMI_EXTRACT") return "nami";
  return "has";
}
