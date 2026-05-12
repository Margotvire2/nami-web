"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type KnowledgeSearchResult } from "@/lib/api";
import {
  Search,
  FileText,
  FlaskConical,
  X,
  MessageSquare,
} from "lucide-react";
import { ShimmerCard } from "@/components/ui/shimmer";
import QualityDashboard from "@/components/intelligence/QualityDashboard";
import ResultCard from "@/components/intelligence/ResultCard";
import KnowledgeDetailModal from "@/components/intelligence/KnowledgeDetailModal";
import QAClinique from "@/components/intelligence/QAClinique";
import { slugToCategory, CATEGORY_META, SOURCE_ICON } from "@/components/intelligence/_utils";

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

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  const doSearch = async (q: string) => {
    if (!q.trim() || q.trim().length < 2) return;
    setLoading(true);
    setSearched(false);
    setSearchError(null);
    setActiveSource(null);
    try {
      const data = await apiWithToken(accessToken!).intelligence.knowledgeSearch(q, { limit: 10 });
      setResults(data.results);
      setSearched(true);
    } catch (err: any) {
      setResults([]);
      setSearchError(err?.message || "Erreur de recherche");
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") doSearch(query);
  };

  const filteredResults = activeSource
    ? results.filter((r) => slugToCategory(r.slug) === activeSource)
    : results;

  const sourceCounts = results.reduce<Record<string, number>>((acc, r) => {
    const cat = slugToCategory(r.slug);
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <FlaskConical size={18} className="text-[#5B4EC4]" />
            <h1 className="text-xl font-bold text-gray-900">Intelligence clinique</h1>
          </div>
          {/* Mode toggle */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setMode("search")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={mode === "search" ? { background: "#fff", color: "#5B4EC4", boxShadow: "0 1px 3px rgba(26,26,46,0.08)" } : { color: "#6B7280" }}
            >
              <Search size={13} /> Recherche documentaire
            </button>
            <button
              onClick={() => setMode("qa")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={mode === "qa" ? { background: "#fff", color: "#5B4EC4", boxShadow: "0 1px 3px rgba(26,26,46,0.08)" } : { color: "#6B7280" }}
            >
              <MessageSquare size={13} /> QA Clinique
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {mode === "search"
            ? "Recherche dans la base unifiée : FFAB · HAS · Fiches pathologies · Algorithmes diagnostiques"
            : "Posez une question clinique — réponse structurée avec sources et niveau de confiance"}
        </p>
      </div>

      {/* ── Quality Dashboard (search mode only) ── */}
      {mode === "search" && <QualityDashboard />}

      {/* ── QA Clinique mode ── */}
      {mode === "qa" && <QAClinique />}

      {/* ── Search mode ── */}
      {mode === "search" && <>

      {/* ── Search bar ── */}
      <div className="relative mb-6">
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
              onClick={() => { setQuery(""); setResults([]); setSearched(false); }}
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

      {/* ── Suggested queries ── */}
      {!searched && (
        <div className="mb-8">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Exemples</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => { setQuery(q); doSearch(q); }}
                className="text-xs px-3 py-1.5 rounded-lg border border-[#E8ECF4] bg-white text-gray-600 hover:border-[#5B4EC4] hover:text-[#5B4EC4] transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Source filter tabs ── */}
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
                style={{
                  fontSize: 12, fontWeight: 600, padding: "6px 12px",
                  borderRadius: 8, border: "1px solid",
                  cursor: "pointer", transition: "all 0.15s",
                  borderColor: isActive ? (meta?.color ?? "#5B4EC4") : "rgba(26,26,46,0.08)",
                  color: isActive ? (meta?.color ?? "#5B4EC4") : "#374151",
                  background: isActive ? (meta?.bg ?? "rgba(91,78,196,0.08)") : "#fff",
                }}
              >
                {meta?.label ?? src} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* ── Results ── */}
      {loading && (
        <div className="flex flex-col gap-3 py-4">
          {[...Array(5)].map((_, i) => <ShimmerCard key={i} />)}
        </div>
      )}

      {!loading && searched && filteredResults.length > 0 && (
        <div className="space-y-3">
          {filteredResults.map((r) => (
            <ResultCard key={r.id} result={r} query={query} onOpen={setSelectedResult} />
          ))}
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
              <p className="text-gray-600 font-medium">Aucun résultat pour «&nbsp;{query}&nbsp;»</p>
              <p className="text-sm text-gray-400 mt-1">Essayez d'autres termes ou vérifiez l'orthographe</p>
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
                style={{
                  padding: 16, borderRadius: 12,
                  border: `1px solid ${meta.color}22`,
                  background: meta.bg,
                  display: "flex", flexDirection: "column", gap: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: meta.color }}>
                  <Icon size={14} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>{meta.label}</span>
                </div>
                <p style={{ fontSize: 10, color: meta.color, opacity: 0.7 }}>{meta.desc}</p>
              </div>
            );
          })}
        </div>
      )}

      </>}
    </div>

    {selectedResult && (
      <KnowledgeDetailModal result={selectedResult} onClose={() => setSelectedResult(null)} />
    )}
    </>
  );
}
