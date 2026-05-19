"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuthStore } from "@/lib/store";
import {
  apiWithToken,
  type KnowledgeSearchResult,
  type ConsensusBlock,
  type TokenKind,
} from "@/lib/api";
import { useRagConsensus } from "@/hooks/useRagConsensus";
import { Search, FileText, FlaskConical, X, MessageSquare } from "lucide-react";
import { ShimmerCard } from "@/components/ui/shimmer";
import CockpitMeshBackground from "@/components/cockpit/CockpitMeshBackground";
import QualityDashboard from "@/components/intelligence/QualityDashboard";
import ResultCard from "@/components/intelligence/ResultCard";
import KnowledgeDetailModal from "@/components/intelligence/KnowledgeDetailModal";
import QAClinique from "@/components/intelligence/QAClinique";
import RagConsensusBlock, {
  type ConsensusItem,
} from "@/components/intelligence/RagConsensusBlock";
import RagKbHint from "@/components/intelligence/RagKbHint";
import { useRagKeyboardNav } from "@/hooks/useRagKeyboardNav";
import {
  slugToCategory,
  CATEGORY_META,
  SOURCE_ICON,
} from "@/components/intelligence/_utils";
import "./nami-keyframes.css";

const SUGGESTED_QUERIES = [
  "critères hospitalisation anorexie",
  "seuils biologiques anorexie mentale",
  "bilan initial TCA adulte",
  "indications chirurgie bariatrique IMC",
  "profils PCR obésité complexe A B C D",
  "suivi nutritionnel post sleeve",
  "critères diagnostic PR biothérapie",
  "diabète gestationnel critères HAPO",
];

/**
 * Mapping TokenKind → label humain pour le bargraph consensus (V3.2b).
 * Source de vérité unique côté front pour les 14 kinds extraits par le
 * tokeniseur backend (D10).
 */
const KIND_LABELS: Record<TokenKind, string> = {
  IMC: "IMC",
  FC: "Fréquence cardiaque",
  GLYCEMIE: "Glycémie",
  KALIEMIE: "Kaliémie",
  PHOSPHOREMIE: "Phosphorémie",
  NATREMIE: "Natrémie",
  CYTOLYSE: "Cytolyse",
  LEUCOPENIE: "Leucocytes",
  NEUTROPHILES: "Neutrophiles",
  CLAIRANCE: "Clairance",
  PERCENTILE: "Percentile",
  PERTE_POIDS: "Perte de poids",
  TA: "Tension art.",
  TEMPERATURE: "Température",
};

function blockToConsensusItem(
  block: ConsensusBlock,
  maxSources: number,
): ConsensusItem {
  const uniqueSources = new Set(block.sources.map((s) => s.source)).size;
  const label = `${KIND_LABELS[block.kind]} ${block.consensusValue} ${block.unit}`.trim();
  return {
    key: block.kind,
    label,
    sourceCount: uniqueSources,
    maxSources,
    severity: block.dominantSeverity,
  };
}

// ── Filtre PNDS hors-scope TCA (Phase 3.B.4)
// Stratégie C : slug blacklist ciblée appliquée UNIQUEMENT quand la query
// contient des mots-clés TCA. Ne masque jamais sur d'autres contextes
// (ex. une recherche "AMP" légitime continue de retourner les PNDS AMP).
// Pas de seuil dur sur le score — on préserve les résultats à faible
// pertinence qui peuvent rester utiles cliniquement.
const PNDS_OUT_OF_SCOPE_TCA_PATTERNS: RegExp[] = [
  /^pnds_amp/i,
  /procreation/i,
  /assistance.medicale.procreation/i,
];

const TCA_QUERY_KEYWORDS = [
  "tca",
  "anorexie",
  "boulimie",
  "hyperphagie",
  "comportement alimentaire",
  "restriction alimentaire",
  "compulsion alimentaire",
];

function isTcaQuery(q: string): boolean {
  const lower = q.toLowerCase();
  return TCA_QUERY_KEYWORDS.some((kw) => lower.includes(kw));
}

function isHorsScopeTcaSlug(slug: string): boolean {
  return PNDS_OUT_OF_SCOPE_TCA_PATTERNS.some((pat) => pat.test(slug));
}

export default function IntelligencePage() {
  const { accessToken } = useAuthStore();
  const [mode, setMode] = useState<"search" | "qa">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KnowledgeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<KnowledgeSearchResult | null>(null);
  const [kbHintVisible, setKbHintVisible] = useState(true);
  const [showAllQuality, setShowAllQuality] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const doSearch = async (q: string) => {
    if (!q.trim() || q.trim().length < 2) return;
    setLoading(true);
    setSearched(false);
    setSearchError(null);
    setActiveSource(null);
    try {
      const data = await apiWithToken(accessToken!).intelligence.knowledgeSearch(q, {
        limit: 10,
        ...(showAllQuality && { minQuality: 0 }),
      });
      setResults(data.results);
      setSearched(true);
    } catch (err: unknown) {
      setResults([]);
      setSearchError(err instanceof Error ? err.message : "Erreur de recherche");
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") doSearch(query);
  };

  // Re-lance la recherche quand le toggle "Voir tous les résultats" bascule
  // (changement de seuil minQuality côté backend).
  useEffect(() => {
    if (searched && query.trim()) {
      doSearch(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAllQuality]);

  // Phase 3.B.4 — filtre PNDS hors-scope TCA appliqué AVANT le filtre source.
  const pndsScopedResults = useMemo(
    () =>
      isTcaQuery(query)
        ? results.filter((r) => !isHorsScopeTcaSlug(r.slug))
        : results,
    [results, query],
  );

  const filteredResults = activeSource
    ? pndsScopedResults.filter((r) => slugToCategory(r.slug) === activeSource)
    : pndsScopedResults;

  const pndsHiddenCount = results.length - pndsScopedResults.length;

  const sourceCounts = pndsScopedResults.reduce<Record<string, number>>((acc, r) => {
    const cat = slugToCategory(r.slug);
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});

  // ── Sympathie cross-card : hover sur un crit highlight toutes ses occurrences
  const handleSympathy = useCallback((critKey: string, on: boolean) => {
    if (!rootRef.current) return;
    const elements = rootRef.current.querySelectorAll<HTMLElement>(
      `[data-crit="${critKey}"]`,
    );
    elements.forEach((el) => {
      el.style.background = on ? "rgba(91,78,196,0.18)" : "rgba(91,78,196,0.10)";
    });
  }, []);

  // ── Navigation clavier J/K/↵/Esc
  const { focusedIdx, setFocusedIdx, reset: resetFocus } = useRagKeyboardNav({
    itemCount: filteredResults.length,
    enabled: mode === "search",
    onActivate: (idx) => {
      const target = filteredResults[idx];
      if (target) setSelectedResult(target);
    },
    onEscape: () => {
      if (selectedResult) {
        setSelectedResult(null);
      } else {
        resetFocus();
      }
    },
  });

  // ── Auto-hide hint clavier après 12s (verrouillé brief)
  useEffect(() => {
    if (!kbHintVisible) return;
    const t = setTimeout(() => setKbHintVisible(false), 12_000);
    return () => clearTimeout(t);
  }, [kbHintVisible]);

  // ── Reset focus à chaque nouvelle recherche
  useEffect(() => {
    resetFocus();
  }, [results, activeSource, resetFocus]);

  // V3.2b — consensus dynamique via /intelligence/consensus
  // (remplace l'ancien MOCK_CONSENSUS + trigger sur "hospitalisation")
  const consensusQuery = useRagConsensus(query, {
    enabled: searched && results.length > 0,
    limit: 20,
  });
  const consensusBlocks = consensusQuery.data?.consensusBlocks ?? [];
  const maxSourcesScanned = consensusQuery.data?.uniqueSources.length ?? 0;
  const showConsensus =
    searched && results.length > 0 && consensusBlocks.length > 0;

  return (
    <>
      <CockpitMeshBackground />
      <div ref={rootRef} className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Header ── */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <FlaskConical size={18} className="text-[#5B4EC4]" />
              <h1 className="text-xl font-bold text-gray-900">Intelligence clinique</h1>
            </div>
            <div className="flex items-center gap-1 p-1 glass-medium rounded-xl">
              <button
                onClick={() => setMode("search")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={
                  mode === "search"
                    ? { background: "#fff", color: "#5B4EC4", boxShadow: "0 1px 3px rgba(26,26,46,0.08)" }
                    : { color: "#6B7280" }
                }
              >
                <Search size={13} /> Recherche documentaire
              </button>
              <button
                onClick={() => setMode("qa")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={
                  mode === "qa"
                    ? { background: "#fff", color: "#5B4EC4", boxShadow: "0 1px 3px rgba(26,26,46,0.08)" }
                    : { color: "#6B7280" }
                }
              >
                <MessageSquare size={13} /> QA Clinique
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {mode === "search"
              ? "Recherche dans la base unifiée : FFAB · HAS · Fiches pathologies · Algorithmes diagnostiques"
              : "Posez une question clinique — synthèse structurée avec sources citées"}
          </p>
        </div>

        {mode === "search" && <QualityDashboard />}
        {mode === "qa" && <QAClinique />}

        {mode === "search" && (
          <>
            {/* ── Search bar ── */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Chercher un médicament, une pathologie, un critère diagnostique…"
                className="w-full pl-11 pr-28 py-3.5 rounded-xl border border-[#E8ECF4] bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] shadow-sm transition-all"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {query && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setResults([]);
                      setSearched(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={15} />
                  </button>
                )}
                <button
                  onClick={() => doSearch(query)}
                  disabled={loading || query.trim().length < 2}
                  className="px-3 py-1.5 bg-[#5B4EC4] text-white text-xs font-medium rounded-lg hover:bg-[#4940A8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "…" : "Rechercher"}
                </button>
              </div>
            </div>

            {/* ── Hint clavier dismissible (auto-hide 12s) ── */}
            {searched && results.length > 0 && (
              <RagKbHint
                visible={kbHintVisible}
                onDismiss={() => setKbHintVisible(false)}
              />
            )}

            {/* ── Bloc consensus (V3.2b — backend /intelligence/consensus) ── */}
            {showConsensus && (
              <RagConsensusBlock
                title={`Valeurs cliniques convergentes — ${consensusQuery.data?.uniqueSources.join(" · ") ?? ""}`}
                items={consensusBlocks.map((b) =>
                  blockToConsensusItem(b, Math.max(maxSourcesScanned, 2)),
                )}
                onSympathy={handleSympathy}
                onClickCrit={(item) => {
                  // T12 — sheet pré-filtrée sur ce critère
                  void item;
                }}
              />
            )}
            {searched &&
              results.length > 0 &&
              consensusQuery.isLoading && (
                <div className="text-xs text-[#6B7280] mb-4 mt-2">
                  Recherche de valeurs convergentes…
                </div>
              )}
            {searched &&
              results.length > 0 &&
              consensusQuery.data &&
              consensusBlocks.length === 0 && (
                <div className="text-xs text-[#6B7280] mb-4 mt-2">
                  Aucune valeur clinique convergente entre sources pour cette
                  requête.
                </div>
              )}

            {/* ── Suggestions ── */}
            {!searched && (
              <div className="mb-8 mt-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                  Exemples
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUERIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setQuery(q);
                        doSearch(q);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg border border-[#E8ECF4] bg-white text-gray-600 hover:border-[#5B4EC4] hover:text-[#5B4EC4] transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Toggle qualité : voir tous les résultats (minQuality=0) ── */}
            {searched && (
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="show-all-quality"
                  checked={showAllQuality}
                  onChange={(e) => setShowAllQuality(e.target.checked)}
                  className="rounded border-gray-300 focus:ring-2 focus:ring-[#5B4EC4] cursor-pointer"
                />
                <label
                  htmlFor="show-all-quality"
                  className="text-sm text-gray-600 cursor-pointer select-none"
                >
                  Voir tous les résultats
                </label>
                {showAllQuality && (
                  <span className="text-xs text-gray-400">
                    (filtre qualité désactivé)
                  </span>
                )}
              </div>
            )}

            {/* ── Filtre source ── */}
            {searched && results.length > 0 && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => setActiveSource(null)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    activeSource === null
                      ? "bg-[#5B4EC4] text-white border-[#5B4EC4]"
                      : "border-[#E8ECF4] bg-white text-gray-600 hover:border-[#5B4EC4] hover:text-[#5B4EC4]"
                  }`}
                >
                  Tous ({results.length})
                </button>
                {Object.entries(sourceCounts).map(([src, count]) => {
                  const meta = CATEGORY_META[src];
                  const isActive = activeSource === src;
                  return (
                    <button
                      key={src}
                      onClick={() => setActiveSource(isActive ? null : src)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-all"
                      style={
                        isActive
                          ? ({
                              "--cat-color": meta?.color ?? "#5B4EC4",
                              "--cat-bg": meta?.bg ?? "rgba(91,78,196,0.08)",
                              borderColor: "var(--cat-color)",
                              color: "var(--cat-color)",
                              background: "var(--cat-bg)",
                            } as React.CSSProperties)
                          : {
                              borderColor: "rgba(26,26,46,0.08)",
                              color: "#374151",
                              background: "#fff",
                            }
                      }
                    >
                      {meta?.label ?? src} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Loading ── */}
            {loading && (
              <div className="flex flex-col gap-3 py-4">
                {[...Array(5)].map((_, i) => (
                  <ShimmerCard key={i} />
                ))}
              </div>
            )}

            {/* ── Résultats ── */}
            {!loading && searched && filteredResults.length > 0 && (
              <div>
                {filteredResults.map((r, idx) => (
                  <ResultCard
                    key={r.id}
                    result={r}
                    index={idx}
                    query={query}
                    focused={focusedIdx === idx}
                    onOpen={setSelectedResult}
                    onFocus={() => setFocusedIdx(idx)}
                    onSympathy={handleSympathy}
                  />
                ))}
                {pndsHiddenCount > 0 && (
                  <p
                    style={{
                      fontFamily: "Inter, system-ui, sans-serif",
                      fontSize: 11,
                      color: "#6B7280",
                      marginTop: 12,
                      textAlign: "center",
                    }}
                  >
                    {pndsHiddenCount} résultat{pndsHiddenCount > 1 ? "s" : ""}{" "}
                    hors-scope TCA masqué{pndsHiddenCount > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            )}

            {!loading && searched && results.length === 0 && (
              <div className="text-center py-16">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search size={20} className="text-gray-400" />
                </div>
                {searchError ? (
                  <>
                    <p className="text-red-600 font-medium">Erreur de recherche</p>
                    <p className="text-sm text-red-400 mt-1">{searchError}</p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 font-medium">
                      Aucun résultat pour «&nbsp;{query}&nbsp;»
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Essayez d'autres termes ou vérifiez l'orthographe
                    </p>
                  </>
                )}
              </div>
            )}

            {!loading && !searched && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {Object.entries(CATEGORY_META).map(([key, meta]) => {
                  const Icon = SOURCE_ICON[key] ?? FileText;
                  return (
                    <div
                      key={key}
                      className="p-4 rounded-xl border flex flex-col gap-1"
                      style={
                        {
                          "--cat-color": meta.color,
                          "--cat-bg": meta.bg,
                          borderColor: `${meta.color}22`,
                          background: "var(--cat-bg)",
                        } as React.CSSProperties
                      }
                    >
                      <div className="flex items-center gap-1.5" style={{ color: "var(--cat-color)" }}>
                        <Icon size={14} />
                        <span className="text-xs font-bold" style={{ color: "var(--cat-color)" }}>
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-[10px] opacity-70" style={{ color: "var(--cat-color)" }}>
                        {meta.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Footer légal MDR (conforme RGPD/non-DM) ── */}
            <div
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 400,
                fontSize: 11,
                color: "#6B7280",
                padding: "22px 4px 8px",
                letterSpacing: "0.01em",
                marginTop: 24,
              }}
            >
              Outil de coordination
              <span style={{ margin: "0 8px", opacity: 0.5 }}>·</span>
              Non dispositif médical
              <span style={{ margin: "0 8px", opacity: 0.5 }}>·</span>
              Conforme RGPD
            </div>
          </>
        )}
      </div>

      <KnowledgeDetailModal
        result={selectedResult}
        onClose={() => setSelectedResult(null)}
      />
    </>
  );
}
