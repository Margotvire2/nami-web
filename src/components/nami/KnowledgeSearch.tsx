"use client";

import { useState, useCallback, useRef } from "react";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type SemanticSearchResult } from "@/lib/api";

interface KnowledgeSearchProps {
  placeholder?: string;
  className?: string;
}

export function KnowledgeSearch({
  placeholder = "Rechercher un protocole, une pathologie…",
  className = "",
}: KnowledgeSearchProps) {
  const { accessToken } = useAuthStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    async (q: string) => {
      if (q.trim().length < 3) {
        setResults([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      try {
        const data = await apiWithToken(accessToken!).intelligence.semanticSearch(q, 6);
        setResults(data.results);
        setOpen(true);
      } catch {
        setResults([]);
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
    debounceRef.current = setTimeout(() => search(val), 400);
  };

  const handleBlur = () => {
    // délai pour laisser le temps au clic sur un résultat
    setTimeout(() => setOpen(false), 200);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E8ECF4] bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5]"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 rounded-full border-2 border-[#4F46E5] border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown résultats */}
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 z-50 mt-1 bg-white rounded-xl border border-[#E8ECF4] shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-[#F0F2FA]">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Références cliniques — {results.length} résultats
            </span>
          </div>
          <ul className="max-h-80 overflow-y-auto divide-y divide-[#F0F2FA]">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  className="w-full px-4 py-3 text-left hover:bg-[#F0F2FA] transition-colors"
                  onClick={() => {
                    window.open(`/protocoles/fiches/${r.slug}`, "_blank");
                    setOpen(false);
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {r.sectionTitle}
                      </p>
                      <p className="text-xs text-[#4F46E5] mt-0.5">{r.slug.replace(/-/g, " ")}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.content.slice(0, 150)}…</p>
                    </div>
                    <span className="shrink-0 text-xs font-mono text-gray-400 mt-0.5">
                      {Math.round(r.score * 100)}%
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div className="px-4 py-2 border-t border-[#F0F2FA] bg-[#F8F9FF]">
            <p className="text-xs text-gray-400">
              Basé sur les fiches cliniques Nami • Powered by OpenAI Embeddings
            </p>
          </div>
        </div>
      )}

      {open && results.length === 0 && !loading && query.trim().length >= 3 && (
        <div className="absolute left-0 right-0 z-50 mt-1 bg-white rounded-xl border border-[#E8ECF4] shadow-lg px-4 py-3">
          <p className="text-sm text-gray-500">Aucun résultat pour «&nbsp;{query}&nbsp;»</p>
        </div>
      )}
    </div>
  );
}
