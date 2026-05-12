"use client";

/**
 * ResultCard — carte de résultat refondue V4 (Phase 3.B.3).
 *
 * Grammaire V4 :
 *   - Card border 0.5px, radius 12px, padding 18/20/16, animation namiCardIn
 *     stagger (100 + index * 60 ms)
 *   - SourceBadgeRag (mapping slug → HAS/FFAB/Nami algo/Nami extrait)
 *   - DraftAIBadge "Brouillon IA — à vérifier" sur les sources IA (SEM/ALGO)
 *   - RelevanceBar à droite, breathing=true si featured (rang 1)
 *   - AmbientGlowFrame overlay si featured
 *   - ClinicalCriterion inline (sympathie cross-card via data-crit + onSympathy)
 *   - Focus indicator (ring violet) si focused via keyboard nav
 *   - Snippet : preprocess universel (cleanRagContent + cleanForPreview) +
 *     tokenisation regex critères chiffrés (IMC/FC/K+/glycémie/percentile)
 *
 * Adaptation par rapport à l'artifact V4 :
 *   - Payload backend n'a pas snippetParts pré-tokenisé → on tokenise au render
 *   - Pas de subExtracts dans le payload → RagExtras désactivé (ticket D-extras)
 *   - Pas de sourceUrl dans le payload → lien externe non affiché (ticket D2)
 *   - Truncate 280 chars + "Voir plus" : adaptation pragmatique car nos chunks
 *     bruts (200-2200 chars) sont plus longs que les snippets de l'artifact
 */

import { Fragment, useState } from "react";
import type { KnowledgeSearchResult } from "@/lib/api";
import { cleanRagContent, hasSlideMarkers, splitSlides } from "@/lib/ragContentCleanup";
import {
  NAMI,
  deriveRagSource,
  relevanceVariant,
} from "./atoms/_tokens";
import { tokenizeSnippet } from "./atoms/_criteria";
import SourceBadgeRag from "./atoms/SourceBadgeRag";
import DraftAIBadge from "./atoms/DraftAIBadge";
import ClinicalCriterion from "./atoms/ClinicalCriterion";
import RelevanceBar from "./atoms/RelevanceBar";
import AmbientGlowFrame from "./atoms/AmbientGlowFrame";

const PREVIEW_LIMIT = 280;

function cleanForPreview(content: string): string {
  // Si le content contient des marqueurs "--- Slide N ---" : extraire le
  // premier slide non-vide pour le preview (sinon le snippet afficherait
  // le marqueur brut). cleanRagContent ne strip pas ces marqueurs car ils
  // sont utilisés par splitSlides() côté KnowledgeContentRenderer.
  let source = content;
  if (hasSlideMarkers(content)) {
    const slides = splitSlides(content);
    const firstWithBody = slides.find((s) => s.content.trim().length > 30);
    const chosen = firstWithBody ?? slides[0];
    if (chosen) {
      source = chosen.title
        ? `${chosen.title}\n${chosen.content}`
        : chosen.content;
    }
  }

  return cleanRagContent(source)
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

/**
 * Wrappe les termes de la query trouvés dans un texte avec <strong>.
 * Renvoie un tableau de React nodes.
 */
function highlightTerms(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const terms = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 2);
  if (terms.length === 0) return text;
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    pattern.test(part) ? (
      <strong key={i} style={{ fontWeight: 700, color: NAMI.text }}>
        {part}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

export default function ResultCard({
  result,
  index = 0,
  query,
  focused = false,
  onOpen,
  onFocus,
  onSympathy,
}: {
  result: KnowledgeSearchResult;
  index?: number;
  query: string;
  focused?: boolean;
  onOpen: (r: KnowledgeSearchResult) => void;
  onFocus?: () => void;
  onSympathy?: (critKey: string, on: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const sourceMeta = deriveRagSource(result.slug);
  const featured = index === 0;

  const clean = cleanForPreview(result.content);
  const hasMore = clean.length > PREVIEW_LIMIT;
  const displayText = expanded || !hasMore ? clean : clean.slice(0, PREVIEW_LIMIT);
  const tokens = tokenizeSnippet(displayText);

  const handleClick = () => {
    onFocus?.();
    onOpen(result);
  };

  return (
    <div
      tabIndex={0}
      data-item={index}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="glass-soft rounded-xl"
      style={{
        position: "relative",
        // Border focus state — surcharge intentionnellement la border blanche
        // de glass-soft pour exposer le ring violet en navigation clavier.
        border: focused
          ? `0.5px solid ${NAMI.violetSoft3}`
          : "0.5px solid rgba(255,255,255,0.4)",
        padding: "18px 20px 16px",
        marginBottom: 12,
        cursor: "pointer",
        opacity: 0,
        transform: "translateY(8px)",
        animation: `namiCardIn 460ms ${NAMI.ease} ${100 + index * 60}ms forwards`,
        boxShadow: focused
          ? `0 0 0 3px rgba(91,78,196,0.08)`
          : undefined,
        transition: `transform 200ms ${NAMI.ease}, box-shadow 200ms ${NAMI.ease}, border-color 200ms ${NAMI.ease}`,
      }}
    >
      {featured && <AmbientGlowFrame />}

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 14,
          marginBottom: 10,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <SourceBadgeRag source={result.source} />
            {sourceMeta.isAI && <DraftAIBadge />}
          </div>
          <h3
            style={{
              fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
              fontWeight: 500,
              fontSize: 16,
              lineHeight: 1.4,
              color: NAMI.text,
              margin: "8px 0 4px",
              letterSpacing: "-0.005em",
            }}
          >
            {result.entryTitle ?? result.sectionTitle ?? result.slug}
          </h3>
          {result.entryTitle &&
            result.sectionTitle &&
            result.entryTitle !== result.sectionTitle && (
              <div
                style={{
                  fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
                  fontWeight: 400,
                  fontSize: 12,
                  color: NAMI.textMuted,
                  margin: "0 0 4px",
                  letterSpacing: "0.005em",
                }}
              >
                {result.sectionTitle}
              </div>
            )}
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 400,
              fontSize: 12,
              color: NAMI.textFaint,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "0.01em",
            }}
          >
            <span style={{ wordBreak: "break-all" }}>{result.slug}</span>
            {result.qualityScore > 0 && result.qualityScore < 0.75 && (
              <>
                <span
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: "50%",
                    background: NAMI.textFaint,
                    opacity: 0.5,
                  }}
                />
                <span style={{ color: "#D97706", fontWeight: 500 }}>
                  Qualité source limitée
                </span>
              </>
            )}
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <RelevanceBar
            value={result.score}
            variant={relevanceVariant(sourceMeta.kind)}
            breathing={featured}
          />
        </div>
      </div>

      <p
        style={{
          fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          lineHeight: 1.7,
          color: NAMI.text,
          margin: "12px 0 4px",
          maxWidth: "62ch",
        }}
      >
        {tokens.map((tok, i) =>
          tok.type === "text" ? (
            <Fragment key={i}>{highlightTerms(tok.value, query)}</Fragment>
          ) : (
            <ClinicalCriterion
              key={i}
              critKey={tok.critKey}
              onSympathy={onSympathy}
            >
              {tok.value}
            </ClinicalCriterion>
          ),
        )}
        {!expanded && hasMore && (
          <span style={{ color: NAMI.textFaint }}>…</span>
        )}
      </p>

      {hasMore && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          style={{
            marginTop: 6,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 12,
            color: NAMI.violet,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 0",
            transition: "color 150ms",
          }}
        >
          {expanded ? "Réduire" : "Voir plus"}
        </button>
      )}
    </div>
  );
}
