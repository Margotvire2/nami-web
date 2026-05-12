"use client";

/**
 * SourceBadgeRag — pill source (HAS / FFAB / Nami algo / Nami extrait).
 * Phase 3.B.3 — distinct de `src/components/SourceBadge.tsx` (sources humaines
 * orthogonales). Sémantique : catégorie RAG dérivée du slug.
 */

import { NAMI, type RagSourceKind } from "./_tokens";

const STYLES: Record<
  RagSourceKind,
  {
    bg: string;
    color: string;
    uppercase: boolean;
    italic: boolean;
    border: string | "none";
  }
> = {
  HAS: {
    bg: NAMI.violetSoft,
    color: NAMI.violet,
    uppercase: true,
    italic: false,
    border: "none",
  },
  FFAB: {
    bg: NAMI.tealSoft,
    color: NAMI.tealText,
    uppercase: true,
    italic: false,
    border: "none",
  },
  NAMI_ALGO: {
    bg: NAMI.bgAlt,
    color: NAMI.textMuted,
    uppercase: false,
    italic: true,
    border: "0.5px solid rgba(91,78,196,0.12)",
  },
  NAMI_EXTRACT: {
    bg: NAMI.bgAlt,
    color: NAMI.textMuted,
    uppercase: false,
    italic: true,
    border: "0.5px solid rgba(91,78,196,0.12)",
  },
};

export default function SourceBadgeRag({
  kind,
  label,
}: {
  kind: RagSourceKind;
  label: string;
}) {
  const s = STYLES[kind];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
        fontWeight: 500,
        fontSize: 11,
        letterSpacing: s.uppercase ? "0.04em" : 0,
        textTransform: s.uppercase ? "uppercase" : "none",
        fontStyle: s.italic ? "italic" : "normal",
        padding: "4px 10px",
        borderRadius: 999,
        background: s.bg,
        color: s.color,
        border: s.border === "none" ? undefined : s.border,
      }}
    >
      {label}
    </span>
  );
}
