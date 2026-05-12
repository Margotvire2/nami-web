"use client";

/**
 * AdressageFilterBar — glass-medium avec chips de filtrage + search.
 * Chips : Tous / À traiter / En cours / Terminés (mapping STATUS_CATEGORY).
 * Search input avec hint ⌘K (placeholder pour command palette future).
 */

import { FILTER_OPTIONS, type FilterValue } from "./_constants";
import { cn } from "@/lib/utils";

interface AdressageFilterBarProps {
  filter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
  searchValue: string;
  onSearchChange: (v: string) => void;
  className?: string;
}

export function AdressageFilterBar({
  filter,
  onFilterChange,
  searchValue,
  onSearchChange,
  className,
}: AdressageFilterBarProps) {
  return (
    <div
      className={cn(
        "glass-medium rounded-xl px-3 py-2 flex items-center gap-2 flex-wrap",
        className,
      )}
    >
      <div className="flex items-center gap-1" role="group" aria-label="Filtres">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onFilterChange(f.value)}
            aria-pressed={filter === f.value}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40",
              filter === f.value
                ? "bg-white/80 text-[#1A1A2E] shadow-sm"
                : "text-[#4A4A5A] hover:bg-white/40",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-w-[160px]">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher patient, soignant, motif…"
          aria-label="Recherche"
          className={cn(
            "w-full glass-soft rounded-lg px-3 py-1.5 text-sm",
            "text-[#1A1A2E] placeholder:text-[#8A8A96]",
            "focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30",
          )}
        />
      </div>
      <kbd
        className="hidden md:inline-flex items-center px-2 py-1 rounded-md bg-white/70 text-[10px] font-mono text-[#8A8A96] ring-1 ring-[#1A1A2E]/10"
        aria-hidden="true"
      >
        ⌘K
      </kbd>
    </div>
  );
}
