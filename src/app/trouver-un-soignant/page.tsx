"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { providerDirectoryApi, type PublicProvider, type ProviderNextSlot } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Shield, Heart } from "lucide-react";
import { FiltersBar, EMPTY_FILTERS, type AdvancedFilters } from "./FiltersBar";
import { ProviderCardV2 } from "./ProviderCardV2";
import { EmptyState } from "./EmptyState";
import {
  GeoFilter,
  GEO_FILTER_EMPTY,
  haversineKm,
  type GeoFilterValue,
} from "./GeoFilter";

// ─── Constants ──────────────────────────────────────────────────────────────

const SPECIALTY_OPTIONS = [
  { value: "", label: "Toutes les spécialités" },
  { value: "DIETITIAN", label: "Diététicien·ne" },
  { value: "PSYCHOLOGIST", label: "Psychologue" },
  { value: "PHYSICIAN", label: "Médecin" },
  { value: "PSYCHIATRIST", label: "Psychiatre" },
  { value: "ENDOCRINOLOGIST", label: "Endocrinologue" },
  { value: "PEDIATRICIAN", label: "Pédiatre" },
];

const SPECIALTY_LABEL: Record<string, string> = {
  DIETITIAN: "Diététicien·ne",
  PSYCHOLOGIST: "Psychologue",
  PHYSICIAN: "Médecin",
  PSYCHIATRIST: "Psychiatre",
  ENDOCRINOLOGIST: "Endocrinologue",
  PEDIATRICIAN: "Pédiatre",
};

// ─── Geo helpers ─────────────────────────────────────────────────────────────

function normalizeCity(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function providerMatchesCity(p: PublicProvider, query: string): boolean {
  const q = normalizeCity(query);
  if (!q) return true;
  const sources = [
    p.structures[0]?.city ?? "",
    p.structures[0]?.address ?? "",
    ...p.structures.map((s) => s.city ?? ""),
  ];
  return sources.some((src) => normalizeCity(src).includes(q));
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TrouverUnSoignantPage() {
  const [specialty, setSpecialty] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<AdvancedFilters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [geoFilter, setGeoFilter] = useState<GeoFilterValue>(GEO_FILTER_EMPTY);

  const { data: providers, isLoading } = useQuery({
    queryKey: ["provider-directory", specialty],
    queryFn: () =>
      providerDirectoryApi.search({
        ...(specialty ? { specialty } : {}),
        accepting: "true",
      }),
  });

  const providerIds = useMemo(
    () => (providers ?? []).map((p) => p.id),
    [providers],
  );

  const { data: nextSlots } = useQuery({
    queryKey: ["provider-next-slots", providerIds],
    queryFn: () => providerDirectoryApi.batchNextSlot(providerIds),
    enabled: providerIds.length > 0,
    staleTime: 60_000,
  });

  // Distance de l'utilisateur vers la ville recherchée (Nominatim centroïd)
  const distanceKm: number | null = useMemo(() => {
    if (!geoFilter.userPosition || !geoFilter.nominatimLoc) return null;
    return haversineKm(geoFilter.userPosition, geoFilter.nominatimLoc);
  }, [geoFilter.userPosition, geoFilter.nominatimLoc]);

  // Filtres avancés appliqués post-fetch sur les champs disponibles dans
  // PublicProvider (acceptsTele, structures, acceptsNewPatients). Les filtres
  // dont la data n'est pas dans PublicProvider (CMU/ALD/secteur/disponibilité)
  // sont UI-only V1 — voir tickets V2 dérivés pour l'enrichissement backend.
  const filtered = useMemo(() => {
    const list = providers ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((p) => {
      // Texte libre
      if (q) {
        const name = `${p.person.firstName} ${p.person.lastName}`.toLowerCase();
        const specs = p.specialties
          .map((s) => (SPECIALTY_LABEL[s] ?? s).toLowerCase())
          .join(" ");
        const city = p.structures[0]?.city?.toLowerCase() ?? "";
        if (!name.includes(q) && !specs.includes(q) && !city.includes(q)) {
          return false;
        }
      }
      // Filtre géographique — string match normalisé (fallback Nominatim)
      if (geoFilter.cityQuery.trim()) {
        if (!providerMatchesCity(p, geoFilter.cityQuery)) return false;
      }
      // Filtre modes : video → acceptsTele, in-person → structure présente
      if (filters.modes.length > 0) {
        const matchVideo = filters.modes.includes("video") && p.acceptsTele;
        const matchInPerson =
          filters.modes.includes("in-person") && p.structures.length > 0;
        const matchPhone = filters.modes.includes("phone");
        if (!matchVideo && !matchInPerson && !matchPhone) return false;
      }
      return true;
    });
  }, [providers, search, filters, geoFilter.cityQuery]);

  const hasActiveFilters =
    filters.modes.length > 0 ||
    filters.convention.length > 0 ||
    filters.acceptsCMU ||
    filters.acceptsALD ||
    filters.availability !== "any" ||
    search.trim().length > 0 ||
    specialty.length > 0 ||
    geoFilter.cityQuery.trim().length > 0;

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
      {/* Header */}
      <div style={{ background: "#FAFAF8", borderBottom: "1px solid rgba(26,26,46,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 40px" }}>
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
              style={{
                background: "rgba(91,78,196,0.07)",
                color: "#5B4EC4",
                border: "1px solid rgba(91,78,196,0.15)",
                letterSpacing: "0.08em",
              }}
            >
              ANNUAIRE
            </div>
            <h1
              className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4"
              style={{
                color: "#1A1A2E",
                fontFamily: "var(--font-jakarta)",
                lineHeight: 1.08,
              }}
            >
              Trouvez le bon soignant,
              <br className="hidden md:block" /> au bon moment.
            </h1>
            <p className="text-lg mb-8" style={{ color: "#374151" }}>
              60 000+ sources cliniques structurées. 131 parcours de soins.
            </p>
          </div>

          {/* Search bar premium */}
          <form
            role="search"
            aria-label="Recherche de soignants"
            style={{ maxWidth: 720, margin: "0 auto" }}
          >
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1" style={{ minWidth: 240 }}>
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "#6B7280" }}
                  aria-hidden="true"
                />
                <Input
                  placeholder="Nom, spécialité…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-0 rounded-full h-12 pl-11 pr-5 text-sm"
                  style={{
                    background: "#fff",
                    boxShadow: "0 1px 3px rgba(26,26,46,0.08)",
                    color: "#1A1A2E",
                  }}
                  aria-label="Rechercher par nom ou spécialité"
                />
              </div>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="h-12 px-5 rounded-full border-0 text-sm font-medium"
                style={{
                  background: "#fff",
                  boxShadow: "0 1px 3px rgba(26,26,46,0.08)",
                  color: "#374151",
                  minWidth: 200,
                }}
                aria-label="Filtrer par spécialité"
              >
                {SPECIALTY_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre géographique */}
            <div className="mt-3" style={{ maxWidth: 480 }}>
              <GeoFilter
                value={geoFilter}
                onChange={setGeoFilter}
                distanceKm={distanceKm}
              />
            </div>

            {/* Toggle filtres avancés */}
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                aria-expanded={showFilters}
                aria-controls="advanced-filters-panel"
                className="text-xs font-semibold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2 rounded-full px-3 py-1.5"
                style={{ color: "#5B4EC4" }}
              >
                {showFilters
                  ? "Masquer les filtres avancés"
                  : "Afficher les filtres avancés"}
              </button>
            </div>
          </form>

          {showFilters && (
            <div
              id="advanced-filters-panel"
              className="mt-5"
              style={{ maxWidth: 880, margin: "20px auto 0" }}
            >
              <FiltersBar
                filters={filters}
                onChange={setFilters}
                resultCount={providers ? filtered.length : null}
              />
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
        {isLoading ? (
          <div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-busy="true"
          >
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            hasActiveFilters={hasActiveFilters}
            onReset={() => {
              setFilters(EMPTY_FILTERS);
              setSearch("");
              setSpecialty("");
              setGeoFilter(GEO_FILTER_EMPTY);
            }}
          />
        ) : (
          <>
            <p
              className="text-sm font-medium mb-5"
              style={{ color: "#6B7280" }}
              aria-live="polite"
              aria-atomic="true"
            >
              {filtered.length} soignant{filtered.length !== 1 ? "s" : ""} trouvé
              {filtered.length !== 1 ? "s" : ""}
              {geoFilter.cityQuery.trim()
                ? ` à ${geoFilter.cityQuery.trim()}`
                : ""}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((provider) => (
                <ProviderCardV2
                  key={provider.id}
                  provider={provider}
                  specialtyLabel={
                    SPECIALTY_LABEL[provider.specialties[0]] ??
                    provider.specialties[0] ??
                    "Soignant"
                  }
                  distanceKm={
                    geoFilter.userPosition && geoFilter.nominatimLoc
                      ? distanceKm
                      : null
                  }
                  nextSlot={nextSlots ? (nextSlots[provider.id] ?? null) : undefined}
                />
              ))}
            </div>
          </>
        )}

        {/* Trust footer */}
        <div className="flex items-center justify-center gap-6 mt-12 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Shield size={11} /> Profils vérifiés
          </span>
          <span className="flex items-center gap-1">
            <Heart size={11} /> Coordination de soins
          </span>
        </div>
      </div>
    </div>
  );
}
