"use client";

import { useState, useRef, useCallback } from "react";
import { MapPin, LocateFixed, X, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeoFilterValue {
  cityQuery: string;
  userPosition: { lat: number; lng: number } | null;
  nominatimLoc: { lat: number; lng: number } | null;
}

export const GEO_FILTER_EMPTY: GeoFilterValue = {
  cityQuery: "",
  userPosition: null,
  nominatimLoc: null,
};

interface GeoFilterProps {
  value: GeoFilterValue;
  onChange: (v: GeoFilterValue) => void;
  distanceKm: number | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function geocodeCity(
  query: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?q=${encodeURIComponent(query)}` +
      `&format=json&limit=1&countrycodes=fr`;
    const res = await fetch(url, {
      headers: {
        "Accept-Language": "fr",
        "User-Agent": "NamiHealth/1.0",
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!data[0]) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

// ─── Component ───────────────────────────────────────────────────────────────

export function GeoFilter({ value, onChange, distanceKm }: GeoFilterProps) {
  const [inputText, setInputText] = useState(value.cityQuery);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const nominatimTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const supportsGeolocation =
    typeof navigator !== "undefined" && "geolocation" in navigator;

  const handleInputChange = useCallback(
    (raw: string) => {
      setInputText(raw);
      setGeoError(null);

      if (nominatimTimeoutRef.current) clearTimeout(nominatimTimeoutRef.current);

      if (!raw.trim()) {
        onChange({ ...value, cityQuery: "", nominatimLoc: null });
        return;
      }

      // Fallback immédiat string-match
      onChange({ ...value, cityQuery: raw, nominatimLoc: null });

      // Tentative Nominatim avec debounce 600ms
      nominatimTimeoutRef.current = setTimeout(async () => {
        setIsGeocoding(true);
        try {
          const loc = await geocodeCity(raw.trim());
          onChange({ ...value, cityQuery: raw, nominatimLoc: loc });
        } catch {
          // STOP condition Nominatim rate-limit → string match reste actif
        } finally {
          setIsGeocoding(false);
        }
      }, 600);
    },
    [value, onChange],
  );

  const handleClear = useCallback(() => {
    setInputText("");
    setGeoError(null);
    if (nominatimTimeoutRef.current) clearTimeout(nominatimTimeoutRef.current);
    onChange(GEO_FILTER_EMPTY);
  }, [onChange]);

  const handleLocate = useCallback(() => {
    if (!supportsGeolocation) return;
    setIsLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        onChange({
          ...value,
          userPosition: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
        });
      },
      () => {
        setIsLocating(false);
        setGeoError("Localisation refusée. Entrez une ville manuellement.");
      },
      { timeout: 8000, maximumAge: 60_000 },
    );
  }, [value, onChange, supportsGeolocation]);

  const hasValue = !!inputText.trim();
  const showDistance =
    distanceKm !== null && distanceKm !== undefined && hasValue;

  return (
    <div className="flex flex-col gap-1.5" role="search" aria-label="Filtrer par localisation">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Input ville */}
        <div
          className="relative flex-1"
          style={{ minWidth: 220 }}
        >
          <MapPin
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: hasValue ? "#5B4EC4" : "#9CA3AF" }}
            aria-hidden="true"
          />
          <input
            type="text"
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Ville ou code postal"
            aria-label="Filtrer par ville ou code postal"
            autoComplete="off"
            className="w-full h-10 rounded-full text-sm pl-9 pr-8 transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2"
            style={{
              background: "#fff",
              border: hasValue
                ? "1px solid rgba(91,78,196,0.35)"
                : "1px solid rgba(26,26,46,0.12)",
              color: "#1A1A2E",
              boxShadow: "0 1px 3px rgba(26,26,46,0.06)",
            }}
          />
          {isGeocoding && (
            <Loader2
              size={12}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin"
              style={{ color: "#9CA3AF" }}
              aria-label="Recherche en cours"
            />
          )}
          {hasValue && !isGeocoding && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] rounded-full p-0.5"
              aria-label="Effacer la ville"
            >
              <X size={12} style={{ color: "#9CA3AF" }} />
            </button>
          )}
        </div>

        {/* Bouton géolocalisation */}
        {supportsGeolocation && (
          <button
            type="button"
            onClick={handleLocate}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-full text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2 disabled:opacity-50"
            style={{
              background: value.userPosition
                ? "rgba(91,78,196,0.10)"
                : "#fff",
              border: value.userPosition
                ? "1px solid rgba(91,78,196,0.25)"
                : "1px solid rgba(26,26,46,0.12)",
              color: value.userPosition ? "#5B4EC4" : "#374151",
              boxShadow: "0 1px 3px rgba(26,26,46,0.06)",
              whiteSpace: "nowrap",
            }}
            aria-label={
              isLocating
                ? "Localisation en cours…"
                : value.userPosition
                ? "Position obtenue"
                : "Utiliser ma position"
            }
          >
            {isLocating ? (
              <Loader2 size={12} className="animate-spin" aria-hidden="true" />
            ) : (
              <LocateFixed size={12} aria-hidden="true" />
            )}
            {isLocating
              ? "Localisation…"
              : value.userPosition
              ? "Ma position"
              : "Utiliser ma position"}
          </button>
        )}

        {/* Badge distance */}
        {showDistance && (
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(43,168,156,0.10)",
              color: "#0F766E",
              border: "1px solid rgba(43,168,156,0.20)",
              whiteSpace: "nowrap",
            }}
            aria-live="polite"
          >
            <MapPin size={10} aria-hidden="true" />
            {distanceKm! < 1
              ? "< 1 km"
              : `${Math.round(distanceKm!)} km`}
          </span>
        )}
      </div>

      {/* Erreur géoloc */}
      {geoError && (
        <p
          role="alert"
          className="text-xs"
          style={{ color: "#D94F4F", paddingLeft: 2 }}
        >
          {geoError}
        </p>
      )}
    </div>
  );
}
