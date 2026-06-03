"use client";

import Link from "next/link";
import type { GridCategoryMeta } from "./grid-categories";

interface CategorieCardProps {
  meta: GridCategoryMeta;
  count: number;
}

/**
 * Grosse case emoji du grid principal /mes-documents. Click → navigation
 * vers la sous-vue ?cat=<key>. Empty state affiché si count = 0.
 */
export function CategorieCard({ meta, count }: CategorieCardProps) {
  const empty = count === 0;

  return (
    <Link
      href={`/mes-documents?cat=${meta.key}`}
      aria-label={`${meta.label} — ${count} document${count !== 1 ? "s" : ""}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "24px 20px",
        background: "var(--nami-card)",
        border: "1px solid var(--nami-border)",
        borderRadius: 20,
        boxShadow: "0 1px 3px rgba(26,26,46,0.05)",
        textDecoration: "none",
        color: "inherit",
        transition: "transform 160ms ease, box-shadow 160ms ease",
        minHeight: 140,
        position: "relative",
      }}
      className="categorie-card"
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: meta.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          lineHeight: 1,
        }}
        aria-hidden="true"
      >
        {meta.emoji}
      </div>

      <div style={{ marginTop: 6 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--nami-dark)",
            letterSpacing: "-0.01em",
          }}
        >
          {meta.label}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--nami-text-muted)",
            marginTop: 4,
            lineHeight: 1.35,
          }}
        >
          {empty ? "Aucun document" : meta.description}
        </div>
      </div>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 18,
          right: 20,
          minWidth: 26,
          height: 22,
          padding: "0 8px",
          borderRadius: 999,
          background: empty ? "rgba(26,26,46,0.06)" : meta.bg,
          color: empty ? "var(--nami-text-muted)" : meta.accent,
          fontSize: 12,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {count}
      </div>
    </Link>
  );
}
