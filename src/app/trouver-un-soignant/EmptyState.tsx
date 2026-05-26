"use client";

import { Search, RotateCcw } from "lucide-react";

interface EmptyStateProps {
  hasActiveFilters: boolean;
  onReset?: () => void;
}

export function EmptyState({ hasActiveFilters, onReset }: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-2xl p-8 md:p-12 text-center max-w-xl mx-auto"
      style={{
        background: "#fff",
        border: "1px dashed rgba(26,26,46,0.12)",
      }}
    >
      <div
        className="inline-flex items-center justify-center rounded-full mx-auto mb-5"
        style={{
          width: 56,
          height: 56,
          background: "rgba(91,78,196,0.10)",
          color: "#5B4EC4",
        }}
        aria-hidden="true"
      >
        <Search size={22} />
      </div>

      <h3
        className="text-base md:text-lg font-bold mb-2"
        style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
      >
        Aucun soignant ne correspond à votre recherche
      </h3>

      <p
        className="text-sm mb-6 max-w-md mx-auto"
        style={{ color: "#6B7280", lineHeight: 1.55 }}
      >
        {hasActiveFilters
          ? "Essayez de retirer certains filtres ou d’élargir votre recherche pour voir plus de résultats."
          : "Modifiez les termes de votre recherche ou changez la spécialité dans le menu déroulant."}
      </p>

      {hasActiveFilters && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors hover:bg-[rgba(91,78,196,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2"
          style={{
            color: "#5B4EC4",
            border: "1px solid rgba(91,78,196,0.30)",
            background: "#fff",
          }}
        >
          <RotateCcw size={14} aria-hidden="true" />
          Effacer les filtres
        </button>
      )}
    </div>
  );
}
