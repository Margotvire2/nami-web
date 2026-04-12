"use client";

import { useState, useCallback, useRef } from "react";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type KnowledgeSearchResult } from "@/lib/api";
import { Search, BookOpen, FileText, GitBranch, Database, ExternalLink, X } from "lucide-react";

// ─── Source badges ────────────────────────────────────────────────────────────

const SOURCE_META: Record<string, { label: string; color: string }> = {
  FFAB:       { label: "FFAB",       color: "bg-purple-50 text-purple-700 border-purple-200" },
  HAS:        { label: "HAS",        color: "bg-blue-50 text-blue-700 border-blue-200" },
  FICHE:      { label: "Fiche",      color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ALGORITHME: { label: "Algorithme", color: "bg-amber-50 text-amber-700 border-amber-200" },
};

const SOURCE_ICON: Record<string, typeof BookOpen> = {
  FFAB:       BookOpen,
  HAS:        FileText,
  FICHE:      Database,
  ALGORITHME: GitBranch,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface KnowledgeSearchProps {
  placeholder?: string;
  className?: string;
  /** Mode inline : affiche les résultats sous la barre (défaut: true) */
  inline?: boolean;
  /** Callback quand un résultat est sélectionné */
  onSelect?: (result: KnowledgeSearchResult) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function KnowledgeSearch({
  placeholder = "Rechercher dans la base clinique (doxycycline, IMC, anorexie…)",
  className = "",
  inline = true,
  onSelect,
}: KnowledgeSearchProps) {
  const { accessToken } = useAuthStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KnowledgeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(
    async (q: string) => {
      if (q.trim().length < 2) {
        setResults([]);
        setOpen(false);
        setSearched(false);
        return;
      }
      setLoading(true);
      setSearched(false);
      try {
        const data = await apiWithToken(accessToken!).intelligence.knowledgeSearch(q, { limit: 12 });
        setResults(data.results);
        setOpen(true);
        setSearched(true);
      } catch {
        setResults([]);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 350);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      search(query);
    }
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const clear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    setSearched(false);
    inputRef.current?.focus();
  };

  const handleSelect = (r: KnowledgeSearchResult) => {
    if (onSelect) {
      onSelect(r);
    } else if (r.sourceUrl) {
      window.open(r.sourceUrl, "_blank", "noopener");
    }
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* ── Input ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-[#E8ECF4] bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {loading && (
            <div className="h-3.5 w-3.5 rounded-full border-2 border-[#4F46E5] border-t-transparent animate-spin" />
          )}
          {query && !loading && (
            <button onClick={clear} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Results dropdown ── */}
      {open && (
        <div className={`${inline ? "relative" : "absolute left-0 right-0 z-50"} mt-2 bg-white rounded-xl border border-[#E8ECF4] shadow-lg overflow-hidden`}>
          {results.length > 0 ? (
            <>
              <div className="px-4 py-2.5 border-b border-[#F0F2FA] flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {results.length} résultat{results.length > 1 ? "s" : ""}
                </span>
                <div className="flex gap-1 flex-wrap">
                  {Array.from(new Set(results.map((r) => r.source))).map((src) => {
                    const meta = SOURCE_META[src];
                    return (
                      <span key={src} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${meta?.color ?? "bg-gray-100 text-gray-600"}`}>
                        {meta?.label ?? src}
                      </span>
                    );
                  })}
                </div>
              </div>

              <ul className="max-h-[480px] overflow-y-auto divide-y divide-[#F0F2FA]">
                {results.map((r) => {
                  const meta = SOURCE_META[r.source];
                  const Icon = SOURCE_ICON[r.source] ?? FileText;
                  return (
                    <li key={r.id}>
                      <button
                        className="w-full px-4 py-3 text-left hover:bg-[#F8F9FF] transition-colors group"
                        onClick={() => handleSelect(r)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 shrink-0 p-1 rounded ${meta?.color ?? "bg-gray-100 text-gray-500"}`}>
                            <Icon size={13} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-1 group-hover:text-[#4F46E5] transition-colors">
                                {r.title}
                              </p>
                              {r.sourceUrl && (
                                <ExternalLink size={12} className="shrink-0 mt-1 text-gray-300 group-hover:text-[#4F46E5] transition-colors" />
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${meta?.color ?? "bg-gray-100"}`}>
                                {meta?.label ?? r.source}
                              </span>
                              <span className="text-[10px] text-gray-400">{r.category}</span>
                              {r.gradeEvidence && (
                                <span className="text-[10px] text-blue-600 font-medium">Grade {r.gradeEvidence}</span>
                              )}
                              {r.publicationDate && (
                                <span className="text-[10px] text-gray-400">
                                  {new Date(r.publicationDate).getFullYear()}
                                </span>
                              )}
                            </div>
                            {/* Extrait avec highlights */}
                            <p
                              className="text-xs text-gray-500 mt-1.5 line-clamp-3 leading-relaxed [&_mark]:bg-yellow-100 [&_mark]:text-yellow-900 [&_mark]:rounded [&_mark]:px-0.5"
                              dangerouslySetInnerHTML={{ __html: r.excerpt }}
                            />
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="px-4 py-2 border-t border-[#F0F2FA] bg-[#F8F9FF]">
                <p className="text-[10px] text-gray-400">
                  Base Nami • FFAB · HAS · Fiches cliniques · Algorithmes diagnostiques
                </p>
              </div>
            </>
          ) : searched && query.trim().length >= 2 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-500">Aucun résultat pour «&nbsp;{query}&nbsp;»</p>
              <p className="text-xs text-gray-400 mt-1">Essayez d'autres termes ou une formulation plus simple</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
