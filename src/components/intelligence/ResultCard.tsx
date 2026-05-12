"use client";

/**
 * ResultCard — carte de résultat du mode "Recherche documentaire" de la
 * page Intelligence clinique. Les helpers `cleanForPreview`, `highlightTerms`
 * et `ScoreDots` sont exclusifs à ce composant.
 */

import { useState } from "react";
import type { KnowledgeSearchResult } from "@/lib/api";
import { slugToCategory, CATEGORY_META } from "./_utils";
import { cleanRagContent } from "@/lib/ragContentCleanup";

function cleanForPreview(content: string): string {
  // Phase 3.B.2 : preprocess universel AVANT le strip markdown pour que
  // les artefacts PPT (puces 9/x/■▪▫●◦) ne polluent pas le snippet 200 chars.
  return cleanRagContent(content)
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^[-*•]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^---+$/gm, "")
    .replace(/^\|.+\|$/gm, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function highlightTerms(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const terms = query.trim().split(/\s+/).filter((t) => t.length > 2);
  if (terms.length === 0) return text;
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    pattern.test(part) ? <strong key={i} style={{ fontWeight: 700, color: "#1A1A2E" }}>{part}</strong> : part
  );
}

function ScoreDots({ score }: { score: number }) {
  const filled = Math.round(score * 5);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            width: 7, height: 7, borderRadius: "50%",
            background: i < filled ? "#5B4EC4" : "rgba(91,78,196,0.15)",
            flexShrink: 0,
          }}
        />
      ))}
      <span style={{ fontSize: 10, color: "#6B7280", marginLeft: 4, fontVariantNumeric: "tabular-nums" }}>
        {Math.round(score * 100)}%
      </span>
    </div>
  );
}

export default function ResultCard({
  result,
  query,
  onOpen,
}: {
  result: KnowledgeSearchResult;
  query: string;
  onOpen: (r: KnowledgeSearchResult) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cat = slugToCategory(result.slug);
  const meta = CATEGORY_META[cat];

  const clean = cleanForPreview(result.content);
  const LIMIT = 200;
  const preview = clean.slice(0, LIMIT);
  const hasMore = clean.length > LIMIT;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(26,26,46,0.06)",
        borderLeft: `4px solid ${meta?.color ?? "rgba(26,26,46,0.12)"}`,
        borderRadius: 12,
        padding: "14px 16px",
        cursor: "pointer",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(91,78,196,0.18)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 10px rgba(91,78,196,0.07)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(26,26,46,0.06)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
      onClick={() => onOpen(result)}
    >
      {/* Top row: badge + score */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span
          style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: meta?.color ?? "#6B7280",
            background: meta?.bg ?? "rgba(138,138,150,0.10)",
            padding: "2px 8px", borderRadius: 6,
            flexShrink: 0,
          }}
        >
          {meta?.label ?? cat}
        </span>
        <ScoreDots score={result.score} />
        {result.qualityScore > 0 && result.qualityScore < 0.75 && (
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(230,153,62,0.08)", color: "#E6993E", border: "1px solid rgba(230,153,62,0.2)", flexShrink: 0 }}>
            Qualité source limitée
          </span>
        )}
        <span style={{ fontSize: 10, color: "#6B7280", marginLeft: "auto" }}>
          {result.qualityScore > 0 ? `${Math.round(result.qualityScore * 100)}%` : ""}
        </span>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E", lineHeight: 1.4, marginBottom: 3, fontFamily: "var(--font-jakarta)" }}>
        {result.sectionTitle || result.slug}
      </h3>

      {/* Source slug */}
      <p style={{ fontSize: 10, color: "#6B7280", marginBottom: 8, letterSpacing: "0.02em" }}>
        {result.slug}
      </p>

      {/* Content prose */}
      <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.65 }}>
        {expanded
          ? highlightTerms(clean, query)
          : <>{highlightTerms(preview, query)}{hasMore && <span style={{ color: "#6B7280" }}>…</span>}</>}
      </p>

      {/* Voir plus / Réduire */}
      {hasMore && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          style={{
            fontSize: 11, color: "#5B4EC4", fontWeight: 600,
            marginTop: 6, background: "none", border: "none",
            cursor: "pointer", padding: 0, display: "block",
          }}
        >
          {expanded ? "Réduire" : "Voir plus"}
        </button>
      )}
    </div>
  );
}
