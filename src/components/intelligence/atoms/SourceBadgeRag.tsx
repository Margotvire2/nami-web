"use client";

/**
 * SourceBadgeRag — pill source SOLID (catégorique sacré).
 *
 * Phase 3.B.5 — Vague 2 — palette source-dédiée (HAS violet, FFAB teal,
 * ANSM amber, DSM-5 gris, ESPGHAN violet variant, INCA coral, ORPHANET gris,
 * FICHE anthracite, OTHER gris clair).
 *
 * SOLID intentionnellement : badge catégorique sacré, anti-pattern glass
 * dans Liquid Glass × Nami v1.0.
 *
 * Source : `result.source` (payload semantic-search V2.1, backend FK entry).
 * - source === null → badge masqué (return null), pour les ~7% chunks orphelins
 * - source ∈ SourceLabel → badge SOLID coloré
 * - source ∉ SourceLabel (ex : "DU" venant de KnowledgeEntry.source brut) →
 *   fallback gracieux sur OTHER (gris). Évite le crash React TypeError sur
 *   les valeurs DB hors enum frontend.
 */

import type { SourceLabel } from "@/lib/api";

const SOURCE_COLORS: Record<SourceLabel, { bg: string; text: string }> = {
  HAS: { bg: "#5B4EC4", text: "#FFFFFF" },
  FFAB: { bg: "#2BA89C", text: "#FFFFFF" },
  ANSM: { bg: "#B07820", text: "#FFFFFF" },
  "DSM-5": { bg: "#6B7280", text: "#FFFFFF" },
  ESPGHAN: { bg: "#4c44b0", text: "#FFFFFF" },
  INCA: { bg: "#E07B5C", text: "#FFFFFF" },
  ORPHANET: { bg: "#6B7280", text: "#FFFFFF" },
  FICHE: { bg: "#4A4A5A", text: "#FFFFFF" },
  OTHER: { bg: "#8A8A96", text: "#FFFFFF" },
};

export default function SourceBadgeRag({
  source,
  size = "sm",
}: {
  source: string | null;
  size?: "sm" | "md";
}) {
  if (!source) return null;

  const isKnown = (source as SourceLabel) in SOURCE_COLORS;
  const displaySource: SourceLabel = isKnown ? (source as SourceLabel) : "OTHER";
  const colors = SOURCE_COLORS[displaySource];
  const sizePadding = size === "sm" ? "3px 9px" : "4px 11px";
  const sizeFont = size === "sm" ? 10 : 11;

  return (
    <span
      aria-label={`Source : ${displaySource}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
        fontWeight: 600,
        fontSize: sizeFont,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: sizePadding,
        borderRadius: 6,
        background: colors.bg,
        color: colors.text,
      }}
    >
      {displaySource}
    </span>
  );
}
