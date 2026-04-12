"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type KnowledgeSearchResult, type KnowledgeEntryDetail } from "@/lib/api";
import {
  Search,
  BookOpen,
  FileText,
  GitBranch,
  Database,
  ExternalLink,
  FlaskConical,
  X,
  Microscope,
  Globe,
} from "lucide-react";

// ─── Source meta ─────────────────────────────────────────────────────────────

const SOURCE_META: Record<string, { label: string; color: string; desc: string }> = {
  FFAB:       { label: "FFAB",       color: "bg-purple-50 text-purple-700 border-purple-200",   desc: "DU TCA 2025-2026" },
  HAS:        { label: "HAS",        color: "bg-blue-50 text-blue-700 border-blue-200",          desc: "Haute Autorité de Santé" },
  FICHE:      { label: "Fiche",      color: "bg-emerald-50 text-emerald-700 border-emerald-200", desc: "Fiches pathologies Nami" },
  ORPHANET:   { label: "Orphanet",   color: "bg-rose-50 text-rose-700 border-rose-200",          desc: "Maladies rares" },
  PEDIADOC:   { label: "Pédiadoc",   color: "bg-sky-50 text-sky-700 border-sky-200",             desc: "Suivi pédiatrique" },
  ALGORITHME: { label: "Algorithme", color: "bg-amber-50 text-amber-700 border-amber-200",       desc: "Arbres décisionnels" },
};

const SOURCE_ICON: Record<string, typeof BookOpen> = {
  FFAB:       BookOpen,
  HAS:        FileText,
  FICHE:      Database,
  ORPHANET:   Microscope,
  PEDIADOC:   Globe,
  ALGORITHME: GitBranch,
};

const SUGGESTED_QUERIES = [
  "anorexie critères hospitalisation",
  "obésité bilan biologique",
  "doxycycline morsure tique",
  "IMC pédiatrique courbe",
  "renutrition syndrome de renutrition",
  "arfid diagnostic DSM-5",
  "diabète type 2 suivi glycémie",
  "boulimie traitement TCC",
];

// ─── Result card ─────────────────────────────────────────────────────────────

function ResultCard({
  result,
  onOpen,
}: {
  result: KnowledgeSearchResult;
  onOpen: (id: string) => void;
}) {
  const meta = SOURCE_META[result.source];
  const Icon = SOURCE_ICON[result.source] ?? FileText;

  return (
    <div
      className="bg-white rounded-xl border border-[#E8ECF4] hover:border-[#C7C4F0] hover:shadow-md transition-all cursor-pointer"
      onClick={() => onOpen(result.id)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 shrink-0 p-1.5 rounded-lg border ${meta?.color ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
            <Icon size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-gray-900 leading-snug">
                {result.title}
              </h3>
              {result.sourceUrl && (
                <a
                  href={result.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 mt-0.5 text-gray-400 hover:text-[#4F46E5] transition-colors"
                  title="Voir la source officielle"
                >
                  <ExternalLink size={13} />
                </a>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${meta?.color ?? "bg-gray-100"}`}>
                {meta?.label ?? result.source}
              </span>
              <span className="text-[10px] text-gray-500">{result.category}</span>
              {result.subcategory && (
                <span className="text-[10px] text-gray-400">· {result.subcategory}</span>
              )}
              {result.gradeEvidence && (
                <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  Grade {result.gradeEvidence}
                </span>
              )}
              {result.publicationDate && (
                <span className="text-[10px] text-gray-400">
                  {new Date(result.publicationDate).getFullYear()}
                </span>
              )}
            </div>

            <div
              className="text-xs text-gray-600 mt-2 leading-relaxed [&_mark]:bg-yellow-100 [&_mark]:text-yellow-900 [&_mark]:rounded [&_mark]:px-0.5 [&_mark]:font-medium"
              dangerouslySetInnerHTML={{ __html: result.excerpt }}
            />

            {result.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {result.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="text-[10px] text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Detail modal ─────────────────────────────────────────────────────────────

function KnowledgeDetailModal({
  entryId,
  onClose,
}: {
  entryId: string;
  onClose: () => void;
}) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);

  const { data: entry, isLoading } = useQuery<KnowledgeEntryDetail>({
    queryKey: ["knowledge-entry", entryId],
    queryFn: () => api.intelligence.knowledgeEntry(entryId),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const meta = entry ? SOURCE_META[entry.source] : undefined;
  const Icon = entry ? (SOURCE_ICON[entry.source] ?? FileText) : FileText;

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
            {meta && (
              <div className={`mt-0.5 shrink-0 p-1.5 rounded-lg border ${meta.color}`}>
                <Icon size={14} />
              </div>
            )}
            <div className="min-w-0">
              {isLoading ? (
                <div className="h-5 w-48 bg-gray-100 rounded animate-pulse" />
              ) : (
                <h2 className="text-sm font-semibold text-gray-900 leading-snug">
                  {entry?.title}
                </h2>
              )}
              {entry && (
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${meta?.color ?? "bg-gray-100"}`}>
                    {meta?.label ?? entry.source}
                  </span>
                  <span className="text-[10px] text-gray-500">{entry.category}</span>
                  {entry.subcategory && (
                    <span className="text-[10px] text-gray-400">· {entry.subcategory}</span>
                  )}
                  {entry.gradeEvidence && (
                    <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                      Grade {entry.gradeEvidence}
                    </span>
                  )}
                  {entry.publicationDate && (
                    <span className="text-[10px] text-gray-400">
                      {new Date(entry.publicationDate).getFullYear()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {entry?.sourceUrl && (
              <a
                href={entry.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-gray-400 hover:text-[#4F46E5] hover:bg-gray-50 transition-colors"
                title="Voir la source officielle"
              >
                <ExternalLink size={15} />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`h-3.5 rounded bg-gray-100 animate-pulse ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
              ))}
            </div>
          ) : entry ? (
            <KnowledgeContentRenderer content={entry.content} source={entry.source} />
          ) : (
            <p className="text-sm text-gray-400">Contenu indisponible.</p>
          )}
        </div>

        {/* Footer — tags + source ref */}
        {entry && (entry.tags.length > 0 || entry.sourceRef || entry.cim11Codes.length > 0) && (
          <div className="px-6 py-3 border-t shrink-0 bg-gray-50 flex flex-wrap gap-2 items-center">
            {entry.cim11Codes.slice(0, 3).map((c) => (
              <span key={c} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                {c}
              </span>
            ))}
            {entry.tags.slice(0, 5).map((t) => (
              <span key={t} className="text-[10px] text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded">
                {t}
              </span>
            ))}
            {entry.sourceRef && (
              <span className="text-[10px] text-gray-300 ml-auto truncate max-w-[200px]" title={entry.sourceRef}>
                {entry.sourceRef}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Content renderer ─────────────────────────────────────────────────────────

function KnowledgeContentRenderer({ content, source }: { content: string; source: string }) {
  // FFAB : contenu fusionné avec "--- Slide X ---" markers → afficher proprement
  if (source === "FFAB") {
    const slides = content.split(/^--- Slide \d+ ---$/m).filter(Boolean);
    return (
      <div className="space-y-3">
        {slides.map((slide, i) => {
          const text = slide.trim();
          if (!text) return null;
          return (
            <div key={i} className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-line border-l-2 border-purple-100 pl-3">
              {text}
            </div>
          );
        })}
      </div>
    );
  }

  // FICHE / ORPHANET : markdown structuré
  const lines = content.split("\n");
  return (
    <div className="space-y-0.5 text-sm text-gray-800">
      {lines.map((line, i) => {
        if (line.startsWith("# "))
          return <h1 key={i} className="text-base font-bold mt-4 mb-2 first:mt-0 text-gray-900">{line.slice(2)}</h1>;
        if (line.startsWith("## "))
          return <h2 key={i} className="text-sm font-semibold mt-4 mb-1.5 text-gray-900 border-b border-gray-100 pb-1">{line.slice(3)}</h2>;
        if (line.startsWith("### "))
          return <h3 key={i} className="text-xs font-semibold mt-3 mb-1 text-gray-700 uppercase tracking-wide">{line.slice(4)}</h3>;
        if (line.match(/^\|[-:\s|]+\|/)) return null; // ligne de séparation tableau
        if (line.startsWith("|")) {
          const cells = line.split("|").filter(Boolean).map(c => c.trim());
          return (
            <div key={i} className="flex gap-2 text-[12px] py-0.5">
              {cells.map((c, j) => <span key={j} className={`${j === 0 ? "font-medium text-gray-700 w-32 shrink-0" : "text-gray-600"}`}>{c}</span>)}
            </div>
          );
        }
        if (line.startsWith("- ") || line.startsWith("* "))
          return <li key={i} className="ml-4 list-disc text-[13px] text-gray-600 leading-relaxed">{line.slice(2)}</li>;
        if (line.trim() === "---" || line.trim() === "")
          return <div key={i} className="h-2" />;
        const parts = line.split(/(\*\*[^*]+\*\*)/);
        return (
          <p key={i} className="text-[13px] leading-relaxed text-gray-600">
            {parts.map((p, j) =>
              p.startsWith("**") && p.endsWith("**")
                ? <strong key={j} className="font-semibold text-gray-800">{p.slice(2, -2)}</strong>
                : p
            )}
          </p>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntelligencePage() {
  const { accessToken } = useAuthStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KnowledgeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const doSearch = async (q: string) => {
    if (!q.trim() || q.trim().length < 2) return;
    setLoading(true);
    setSearched(false);
    setSearchError(null);
    setActiveSource(null);
    try {
      const data = await apiWithToken(accessToken!).intelligence.knowledgeSearch(q, { limit: 30 });
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
    ? results.filter((r) => r.source === activeSource)
    : results;

  const sourceCounts = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.source] = (acc[r.source] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical size={18} className="text-[#4F46E5]" />
          <h1 className="text-xl font-bold text-gray-900">Références cliniques</h1>
        </div>
        <p className="text-sm text-gray-500">
          Recherche dans la base unifiée : FFAB · HAS · Fiches pathologies · Algorithmes diagnostiques
        </p>
      </div>

      {/* ── Search bar ── */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Chercher un médicament, une pathologie, un critère diagnostique…"
          className="w-full pl-11 pr-28 py-3.5 rounded-xl border border-[#E8ECF4] bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] shadow-sm transition-all"
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
            className="px-3 py-1.5 bg-[#4F46E5] text-white text-xs font-medium rounded-lg hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                className="text-xs px-3 py-1.5 rounded-lg border border-[#E8ECF4] bg-white text-gray-600 hover:border-[#4F46E5] hover:text-[#4F46E5] transition-all"
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
                ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                : "border-[#E8ECF4] bg-white text-gray-600 hover:border-[#4F46E5] hover:text-[#4F46E5]"
            }`}
          >
            Tous ({results.length})
          </button>
          {Object.entries(sourceCounts).map(([src, count]) => {
            const meta = SOURCE_META[src];
            return (
              <button
                key={src}
                onClick={() => setActiveSource(activeSource === src ? null : src)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  activeSource === src
                    ? `${meta?.color ?? "bg-gray-100 text-gray-700 border-gray-300"} font-semibold`
                    : "border-[#E8ECF4] bg-white text-gray-600 hover:border-[#4F46E5] hover:text-[#4F46E5]"
                }`}
              >
                {meta?.label ?? src} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* ── Results ── */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Recherche en cours…</p>
          </div>
        </div>
      )}

      {!loading && searched && filteredResults.length > 0 && (
        <div className="space-y-3">
          {filteredResults.map((r) => (
            <ResultCard key={r.id} result={r} onOpen={setSelectedEntryId} />
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
          {Object.entries(SOURCE_META).map(([key, meta]) => {
            const Icon = SOURCE_ICON[key] ?? FileText;
            return (
              <div key={key} className={`p-4 rounded-xl border ${meta.color} flex flex-col gap-1`}>
                <div className="flex items-center gap-2">
                  <Icon size={14} />
                  <span className="text-xs font-semibold">{meta.label}</span>
                </div>
                <p className="text-[10px] opacity-70">{meta.desc}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>

    {selectedEntryId && (
      <KnowledgeDetailModal entryId={selectedEntryId} onClose={() => setSelectedEntryId(null)} />
    )}
    </>
  );
}
