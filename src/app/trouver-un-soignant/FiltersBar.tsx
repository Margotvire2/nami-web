"use client";

import { useId } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export type ConsultationModeFilter = "in-person" | "video" | "phone";
export type ConventionFilter = "SECTOR_1" | "SECTOR_2" | "SECTOR_3";
export type AvailabilityFilter = "this-week" | "this-month" | "any";

export interface AdvancedFilters {
  modes: ConsultationModeFilter[];
  convention: ConventionFilter[];
  acceptsCMU: boolean;
  acceptsALD: boolean;
  availability: AvailabilityFilter;
}

export const EMPTY_FILTERS: AdvancedFilters = {
  modes: [],
  convention: [],
  acceptsCMU: false,
  acceptsALD: false,
  availability: "any",
};

interface FiltersBarProps {
  filters: AdvancedFilters;
  onChange: (next: AdvancedFilters) => void;
  resultCount: number | null;
}

const MODE_LABELS: Record<ConsultationModeFilter, string> = {
  "in-person": "Présentiel",
  video: "Téléconsultation",
  phone: "Téléphone",
};

const CONVENTION_LABELS: Record<ConventionFilter, string> = {
  SECTOR_1: "Secteur 1",
  SECTOR_2: "Secteur 2",
  SECTOR_3: "Non conventionné",
};

const AVAILABILITY_OPTIONS: Array<{ value: AvailabilityFilter; label: string }> = [
  { value: "any", label: "Indifférente" },
  { value: "this-week", label: "Cette semaine" },
  { value: "this-month", label: "Ce mois-ci" },
];

export function FiltersBar({ filters, onChange, resultCount }: FiltersBarProps) {
  const titleId = useId();

  function toggleMode(m: ConsultationModeFilter) {
    onChange({
      ...filters,
      modes: filters.modes.includes(m)
        ? filters.modes.filter((x) => x !== m)
        : [...filters.modes, m],
    });
  }
  function toggleConvention(c: ConventionFilter) {
    onChange({
      ...filters,
      convention: filters.convention.includes(c)
        ? filters.convention.filter((x) => x !== c)
        : [...filters.convention, c],
    });
  }

  const activeCount =
    filters.modes.length +
    filters.convention.length +
    (filters.acceptsCMU ? 1 : 0) +
    (filters.acceptsALD ? 1 : 0) +
    (filters.availability !== "any" ? 1 : 0);

  function reset() {
    onChange(EMPTY_FILTERS);
  }

  return (
    <form
      role="search"
      aria-labelledby={titleId}
      className="rounded-2xl p-5 md:p-6"
      style={{
        background: "#fff",
        border: "1px solid rgba(26,26,46,0.06)",
        boxShadow: "0 1px 3px rgba(26,26,46,0.03)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2
          id={titleId}
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide"
          style={{ color: "#1A1A2E", letterSpacing: "0.06em" }}
        >
          <SlidersHorizontal size={14} aria-hidden="true" />
          Filtres avancés
        </h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2 rounded-full px-2 py-1"
            style={{ color: "#5B4EC4" }}
          >
            <X size={12} aria-hidden="true" />
            Effacer ({activeCount})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Modes de consultation */}
        <fieldset className="flex flex-col gap-2">
          <legend
            className="text-xs font-semibold mb-1.5"
            style={{ color: "#374151" }}
          >
            Type de rendez-vous
          </legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(MODE_LABELS) as ConsultationModeFilter[]).map((m) => {
              const active = filters.modes.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleMode(m)}
                  aria-pressed={active}
                  className="text-xs px-3 py-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2"
                  style={
                    active
                      ? {
                          background: "#5B4EC4",
                          color: "#fff",
                          border: "1px solid #5B4EC4",
                        }
                      : {
                          background: "#fff",
                          color: "#374151",
                          border: "1px solid rgba(26,26,46,0.12)",
                        }
                  }
                >
                  {MODE_LABELS[m]}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Convention */}
        <fieldset className="flex flex-col gap-2">
          <legend
            className="text-xs font-semibold mb-1.5"
            style={{ color: "#374151" }}
          >
            Convention
          </legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CONVENTION_LABELS) as ConventionFilter[]).map((c) => {
              const active = filters.convention.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleConvention(c)}
                  aria-pressed={active}
                  className="text-xs px-3 py-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2"
                  style={
                    active
                      ? {
                          background: "#5B4EC4",
                          color: "#fff",
                          border: "1px solid #5B4EC4",
                        }
                      : {
                          background: "#fff",
                          color: "#374151",
                          border: "1px solid rgba(26,26,46,0.12)",
                        }
                  }
                >
                  {CONVENTION_LABELS[c]}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Prises en charge */}
        <fieldset className="flex flex-col gap-2">
          <legend
            className="text-xs font-semibold mb-1.5"
            style={{ color: "#374151" }}
          >
            Prises en charge
          </legend>
          <div className="flex flex-col gap-2">
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filters.acceptsCMU}
                onChange={(e) =>
                  onChange({ ...filters, acceptsCMU: e.target.checked })
                }
                className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)]"
                style={{ accentColor: "#5B4EC4" }}
              />
              <span style={{ color: "#374151" }}>Accepte la CMU</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filters.acceptsALD}
                onChange={(e) =>
                  onChange({ ...filters, acceptsALD: e.target.checked })
                }
                className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)]"
                style={{ accentColor: "#5B4EC4" }}
              />
              <span style={{ color: "#374151" }}>Prise en charge ALD</span>
            </label>
          </div>
        </fieldset>

        {/* Disponibilité */}
        <fieldset className="flex flex-col gap-2">
          <legend
            className="text-xs font-semibold mb-1.5"
            style={{ color: "#374151" }}
          >
            Disponibilité indicative
          </legend>
          <div className="flex flex-wrap gap-2">
            {AVAILABILITY_OPTIONS.map((opt) => {
              const active = filters.availability === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    onChange({ ...filters, availability: opt.value })
                  }
                  aria-pressed={active}
                  className="text-xs px-3 py-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2"
                  style={
                    active
                      ? {
                          background: "#5B4EC4",
                          color: "#fff",
                          border: "1px solid #5B4EC4",
                        }
                      : {
                          background: "#fff",
                          color: "#374151",
                          border: "1px solid rgba(26,26,46,0.12)",
                        }
                  }
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      {/* Compteur résultats live */}
      {resultCount !== null && (
        <p
          aria-live="polite"
          aria-atomic="true"
          className="mt-5 text-xs font-medium"
          style={{ color: "#6B7280" }}
        >
          {resultCount} soignant{resultCount > 1 ? "s" : ""} correspond
          {resultCount > 1 ? "ent" : ""} à vos critères.
        </p>
      )}
    </form>
  );
}
