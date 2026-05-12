"use client";

/**
 * KnowledgeDetailModal — sheet latérale (Niveau 3 V4) du détail RAG.
 * Phase 3.B.3 — migration de l'overlay maison vers ui/sheet (base-ui Dialog).
 *
 * Layout :
 *   - Slide depuis la droite (animation native ui/sheet)
 *   - Header : SourceBadgeRag + DraftAIBadge (si isAI) + titre H2
 *   - Body : snippet tokenisé (ClinicalCriterion) + grille meta sur fond bgAlt
 *           + content full via KnowledgeContentRenderer (markdown / SlideBlock)
 *   - Footer : "Copier la citation" primary
 *
 * Champs absents du payload backend :
 *   - sourceUrl → bouton "Ouvrir la source" non rendu (ticket dérivé D2)
 *   - entryTitle → fallback sectionTitle
 */

import { Fragment } from "react";
import { Copy } from "lucide-react";
import type { KnowledgeSearchResult } from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { NAMI, deriveRagSource } from "./atoms/_tokens";
import { tokenizeSnippet } from "./atoms/_criteria";
import { cleanRagContent } from "@/lib/ragContentCleanup";
import SourceBadgeRag from "./atoms/SourceBadgeRag";
import DraftAIBadge from "./atoms/DraftAIBadge";
import KnowledgeContentRenderer from "./KnowledgeContentRenderer";

function copyCitation(result: KnowledgeSearchResult, label: string): void {
  const citation = `${label} · ${result.sectionTitle || result.slug}\n${result.slug}`;
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    void navigator.clipboard.writeText(citation);
  }
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span
        style={{
          color: NAMI.textFaint,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </span>
      <span>{value}</span>
    </>
  );
}

export default function KnowledgeDetailModal({
  result,
  onClose,
}: {
  result: KnowledgeSearchResult | null;
  onClose: () => void;
}) {
  const open = result !== null;
  const sourceMeta = result ? deriveRagSource(result.slug) : null;
  const snippetPreview = result ? cleanRagContent(result.content) : "";
  const tokens = result ? tokenizeSnippet(snippetPreview.slice(0, 360)) : [];

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="!w-[480px] !max-w-[90vw] !sm:max-w-[480px] !bg-[#FAFAF8] !p-0 !border-l-[0.5px] !border-l-[rgba(26,26,46,0.06)]"
      >
        {result && sourceMeta && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
            }}
          >
            <SheetHeader
              style={{
                padding: "28px 28px 14px",
                gap: 10,
                borderBottom: `0.5px solid ${NAMI.border}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <SourceBadgeRag kind={sourceMeta.kind} label={sourceMeta.label} />
                {sourceMeta.isAI && <DraftAIBadge />}
              </div>
              <SheetTitle
                style={{
                  fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
                  fontWeight: 500,
                  fontSize: 17,
                  lineHeight: 1.35,
                  color: NAMI.text,
                  margin: "4px 0 0",
                  letterSpacing: "-0.005em",
                }}
              >
                {result.sectionTitle || result.slug}
              </SheetTitle>
            </SheetHeader>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 28px 12px",
              }}
            >
              {/* Snippet tokenisé (aperçu) */}
              <p
                style={{
                  fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: 1.75,
                  color: NAMI.text,
                  margin: "0 0 12px",
                  maxWidth: "60ch",
                }}
              >
                {tokens.map((tok, i) =>
                  tok.type === "text" ? (
                    <Fragment key={i}>{tok.value}</Fragment>
                  ) : (
                    <span
                      key={i}
                      style={{
                        display: "inline",
                        fontFamily: "Inter, system-ui, sans-serif",
                        fontWeight: 500,
                        fontSize: 13,
                        color: NAMI.text,
                        background: NAMI.violetSoft,
                        padding: "2px 7px",
                        borderRadius: 4,
                        whiteSpace: "nowrap",
                        fontVariantNumeric: "tabular-nums",
                        letterSpacing: "-0.005em",
                      }}
                    >
                      {tok.value}
                    </span>
                  ),
                )}
              </p>

              {/* Grille meta */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "8px 14px",
                  margin: "12px 0",
                  padding: "12px 14px",
                  background: NAMI.bgAlt,
                  borderRadius: 10,
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontWeight: 400,
                  fontSize: 12,
                  color: NAMI.textMuted,
                }}
              >
                <MetaRow label="Source" value={sourceMeta.label} />
                <MetaRow label="Document" value={result.slug} />
                <MetaRow
                  label="Pertinence"
                  value={`${Math.round(result.score * 100)} / 100 · qualité ${Math.round(result.qualityScore * 100)} / 100`}
                />
              </div>

              {/* Contenu complet via renderer */}
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: `0.5px solid ${NAMI.border}`,
                }}
              >
                <KnowledgeContentRenderer
                  content={result.content}
                  source={sourceMeta.kind}
                />
              </div>
            </div>

            <SheetFooter
              style={{
                padding: "14px 28px 20px",
                borderTop: `0.5px solid ${NAMI.border}`,
                flexDirection: "row",
                gap: 8,
              }}
            >
              <button
                onClick={() => copyCitation(result, sourceMeta.label)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
                  fontWeight: 500,
                  fontSize: 13,
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  background: NAMI.violet,
                  color: "#fff",
                  boxShadow: "0 1px 3px rgba(91,78,196,0.25)",
                  letterSpacing: "-0.005em",
                  transition: `all 200ms ${NAMI.ease}`,
                }}
              >
                <Copy size={14} aria-hidden />
                Copier la citation
              </button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
