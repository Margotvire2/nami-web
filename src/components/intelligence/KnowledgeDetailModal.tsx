"use client";

/**
 * KnowledgeDetailModal — modal détail d'un résultat RAG.
 *
 * ⚠️ Structure conservée à l'identique : overlay maison `<div fixed inset-0>`
 * et non Sheet shadcn. Migration vers `ui/sheet` réservée Phase 3.B.3.
 */

import { useEffect } from "react";
import { FileText, X } from "lucide-react";
import type { KnowledgeSearchResult } from "@/lib/api";
import { slugToCategory, CATEGORY_META, SOURCE_ICON } from "./_utils";
import KnowledgeContentRenderer from "./KnowledgeContentRenderer";

export default function KnowledgeDetailModal({
  result,
  onClose,
}: {
  result: KnowledgeSearchResult;
  onClose: () => void;
}) {
  const cat = slugToCategory(result.slug);
  const meta = CATEGORY_META[cat];
  const Icon = SOURCE_ICON[cat] ?? FileText;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div
              style={{
                marginTop: 2, flexShrink: 0, padding: "6px",
                borderRadius: 8, border: `1px solid ${meta?.color ?? "#6B7280"}22`,
                background: meta?.bg ?? "rgba(138,138,150,0.10)",
                color: meta?.color ?? "#6B7280",
              }}
            >
              <Icon size={14} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-gray-900 leading-snug">
                {result.sectionTitle || result.slug}
              </h2>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span
                  style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: meta?.color ?? "#6B7280",
                    background: meta?.bg ?? "rgba(138,138,150,0.10)",
                    padding: "2px 8px", borderRadius: 6,
                  }}
                >
                  {meta?.label ?? cat}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">{result.slug}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#5B4EC4" }}>
                  {Math.round(result.score * 100)}% pertinence
                </span>
                <span className="text-[10px] text-gray-400">
                  qualité {Math.round(result.qualityScore * 100)}%
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <KnowledgeContentRenderer content={result.content} source={cat} />
        </div>
      </div>
    </div>
  );
}
