"use client";

import { Search, X } from "lucide-react";

interface FAQSearchBarProps {
  value: string;
  onChange: (v: string) => void;
  total: number;
  hasQuery: boolean;
}

export function FAQSearchBar({
  value,
  onChange,
  total,
  hasQuery,
}: FAQSearchBarProps) {
  return (
    <div className="mb-8 md:mb-10">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#9CA3AF" }}
          aria-hidden="true"
        />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Rechercher une question…"
          aria-label="Rechercher dans la FAQ"
          className="w-full pl-11 pr-11 py-3 rounded-xl text-sm transition-all focus:outline-none focus-visible:ring-2"
          style={{
            background: "#fff",
            border: "1px solid rgba(26,26,46,0.08)",
            color: "#1A1A2E",
            boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
            // @ts-expect-error CSS custom property
            "--tw-ring-color": "rgba(91,78,196,0.4)",
          }}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Effacer la recherche"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors hover:bg-[rgba(91,78,196,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)]"
            style={{ color: "#6B7280" }}
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {hasQuery && (
        <p
          role="status"
          aria-live="polite"
          className="mt-3 text-xs"
          style={{ color: "#6B7280" }}
        >
          {total === 0
            ? `Aucun résultat pour « ${value} »`
            : total === 1
              ? `1 résultat pour « ${value} »`
              : `${total} résultats pour « ${value} »`}
        </p>
      )}
    </div>
  );
}
