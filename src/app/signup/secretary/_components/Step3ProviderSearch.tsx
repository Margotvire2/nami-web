"use client";

// F-SECRETAIRE-SIGNUP-FLOW-V1 — Step 3 : sélection des soignants à rattacher.
//
// Recherche live debounced (300 ms) sur /providers/search-light.
// Multi-select avec cards (nom + profession + ville). Min 1 / max 20 sélectionnés
// pour autoriser le passage à l'étape suivante.

import { useState } from "react";
import { Check, Search, X } from "lucide-react";
import { useProviderSearchLight } from "@/hooks/useSecretariatLinks";
import type { ProviderSearchLightResult } from "@/lib/api";

export interface Step3Values {
  selectedProviders: ProviderSearchLightResult[];
}

const MAX_PROVIDERS = 20;

function providerKey(p: ProviderSearchLightResult): string {
  return p.id;
}

export function Step3ProviderSearch({
  values,
  onChange,
}: {
  values:   Step3Values;
  onChange: (next: Step3Values) => void;
}) {
  const [query, setQuery] = useState("");
  const { providers, isLoading } = useProviderSearchLight(query);

  function toggleProvider(p: ProviderSearchLightResult) {
    const exists = values.selectedProviders.some((x) => x.id === p.id);
    if (exists) {
      onChange({
        selectedProviders: values.selectedProviders.filter((x) => x.id !== p.id),
      });
      return;
    }
    if (values.selectedProviders.length >= MAX_PROVIDERS) return;
    onChange({ selectedProviders: [...values.selectedProviders, p] });
  }

  function removeProvider(id: string) {
    onChange({
      selectedProviders: values.selectedProviders.filter((x) => x.id !== id),
    });
  }

  const selectedIds = new Set(values.selectedProviders.map(providerKey));

  return (
    <section className="space-y-4">
      <h2
        className="text-xl font-extrabold"
        style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
      >
        Quels soignants gérez-vous ?
      </h2>
      <p className="text-sm" style={{ color: "#6B7280" }}>
        Recherchez et sélectionnez les soignants pour qui vous souhaitez vous
        rattacher. Chacun recevra une demande à valider par email.
      </p>

      {/* Recherche */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "#94A3B8" }}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nom, prénom ou ville (min. 2 caractères)"
          aria-label="Rechercher un soignant"
          className="w-full rounded-xl border-0 pl-10 pr-4 py-3 text-sm outline-none focus-visible:ring-2"
          style={{ background: "#F5F3EF", color: "#1A1A2E" }}
        />
      </div>

      {/* Sélection courante */}
      {values.selectedProviders.length > 0 && (
        <div
          className="rounded-xl p-3"
          style={{ background: "#EEEDFB", border: "1px solid #5B4EC4" }}
        >
          <p
            className="text-xs font-semibold mb-2"
            style={{ color: "#5B4EC4", fontFamily: "var(--font-inter)" }}
          >
            {values.selectedProviders.length} soignant
            {values.selectedProviders.length > 1 ? "s" : ""} sélectionné
            {values.selectedProviders.length > 1 ? "s" : ""}
            {" "}
            ({MAX_PROVIDERS - values.selectedProviders.length} restant
            {MAX_PROVIDERS - values.selectedProviders.length > 1 ? "s" : ""})
          </p>
          <ul className="flex flex-wrap gap-1.5" data-testid="selected-providers">
            {values.selectedProviders.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => removeProvider(p.id)}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(91,78,196,0.2)",
                    color: "#1A1A2E",
                  }}
                  aria-label={`Retirer ${p.firstName} ${p.lastName}`}
                >
                  {p.firstName} {p.lastName}
                  <X size={12} style={{ color: "#94A3B8" }} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Résultats */}
      <div className="space-y-2" role="listbox" aria-label="Résultats de recherche">
        {isLoading && (
          <p className="text-xs text-center py-4" style={{ color: "#6B7280" }}>
            Recherche…
          </p>
        )}

        {!isLoading && query.trim().length >= 2 && providers.length === 0 && (
          <p
            className="text-xs text-center py-6 rounded-xl"
            style={{ color: "#6B7280", background: "#F5F3EF" }}
          >
            Aucun soignant trouvé. Vérifiez l&apos;orthographe ou élargissez votre recherche.
          </p>
        )}

        {providers.map((p) => {
          const selected = selectedIds.has(p.id);
          const disabled = !selected && values.selectedProviders.length >= MAX_PROVIDERS;
          return (
            <button
              key={p.id}
              type="button"
              role="option"
              aria-selected={selected}
              disabled={disabled}
              onClick={() => toggleProvider(p)}
              data-testid={`provider-card-${p.id}`}
              className="w-full text-left rounded-xl p-3 border transition-all hover:scale-[1.005] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderColor: selected ? "#5B4EC4" : "rgba(26,26,46,0.1)",
                background:  selected ? "rgba(91,78,196,0.06)" : "#fff",
                boxShadow:   selected ? "0 0 0 2px rgba(91,78,196,0.15)" : "none",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div
                    className="text-sm font-semibold mb-0.5"
                    style={{ color: selected ? "#5B4EC4" : "#1A1A2E" }}
                  >
                    {p.firstName} {p.lastName}
                  </div>
                  <div className="text-xs" style={{ color: "#6B7280" }}>
                    {[
                      p.profession ?? null,
                      p.specialtyView ?? null,
                      p.city ?? null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Soignant"}
                  </div>
                </div>
                {selected && (
                  <div
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: "#5B4EC4" }}
                  >
                    <Check size={14} color="#fff" />
                  </div>
                )}
              </div>
            </button>
          );
        })}

        {query.trim().length < 2 && providers.length === 0 && (
          <p
            className="text-xs text-center py-6 rounded-xl"
            style={{ color: "#6B7280", background: "#F5F3EF" }}
          >
            Tapez au moins 2 caractères pour rechercher.
          </p>
        )}
      </div>
    </section>
  );
}

export function step3Valid(v: Step3Values): boolean {
  return v.selectedProviders.length >= 1 && v.selectedProviders.length <= MAX_PROVIDERS;
}
