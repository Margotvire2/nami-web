"use client";

import { useId } from "react";
import { Search, X } from "lucide-react";

/**
 * Valeurs canoniques de l'enum DocumentType côté backend Prisma.
 * Source : prisma/schema.prisma (enum DocumentType).
 *
 * Bug fix CC #69 : la page utilisait un enum local divergent
 * (BILAN_BIO/COURRIER/ORDONNANCE/COMPTE_RENDU/AUTRE) qui ne matchait
 * jamais les valeurs renvoyées par /patient/documents → filter cassé.
 */
export type DocumentTypeKey =
  | "BIOLOGICAL_REPORT"
  | "PRESCRIPTION"
  | "CONSULTATION_REPORT"
  | "HOSPITAL_REPORT"
  | "LETTER"
  | "IMAGING"
  | "OTHER"
  | "IMPEDANCE_REPORT"
  | "DXA_REPORT"
  | "ECG_REPORT"
  | "TRANSCRIPTION";

export interface DocumentTypeMeta {
  icon: string;
  label: string;
  color: string;
  bg: string;
}

export const DOC_TYPES: Record<DocumentTypeKey, DocumentTypeMeta> = {
  BIOLOGICAL_REPORT:   { icon: "🩸", label: "Bilan biologique",  color: "#2563EB", bg: "#EFF6FF" },
  PRESCRIPTION:        { icon: "💊", label: "Ordonnance",        color: "#059669", bg: "#ECFDF5" },
  CONSULTATION_REPORT: { icon: "📋", label: "Compte-rendu",      color: "#D97706", bg: "#FFFBEB" },
  HOSPITAL_REPORT:     { icon: "🏥", label: "Compte-rendu hospitalier", color: "#9333EA", bg: "#FAF5FF" },
  LETTER:              { icon: "✉️", label: "Courrier",          color: "#6B7280", bg: "#F9FAFB" },
  IMAGING:             { icon: "🩻", label: "Imagerie",          color: "#0EA5E9", bg: "#F0F9FF" },
  IMPEDANCE_REPORT:    { icon: "⚖️", label: "Bilan d'impédancemétrie", color: "#7C3AED", bg: "#F5F3FF" },
  DXA_REPORT:          { icon: "🦴", label: "Densitométrie osseuse",   color: "#7C3AED", bg: "#F5F3FF" },
  ECG_REPORT:          { icon: "❤️", label: "ECG",                color: "#DC2626", bg: "#FEF2F2" },
  TRANSCRIPTION:       { icon: "🎙️", label: "Transcription",     color: "#0F766E", bg: "#F0FDFA" },
  OTHER:               { icon: "📄", label: "Autre",             color: "#7C3AED", bg: "#F5F3FF" },
};

/**
 * Filtres affichés dans la barre. "ALL" = pas de filtrage par type.
 * On expose un sous-ensemble lisible — les types spécialisés (ECG/DXA/etc.)
 * tombent dans le filter "Autre" pour rester lisible côté patient (l'icône
 * et le label détaillé restent affichés sur chaque card).
 */
export type FilterKey = "ALL" | DocumentTypeKey;

export const FILTER_ORDER: FilterKey[] = [
  "ALL",
  "BIOLOGICAL_REPORT",
  "PRESCRIPTION",
  "CONSULTATION_REPORT",
  "IMAGING",
  "LETTER",
  "OTHER",
];

export const FILTER_LABELS: Record<FilterKey, string> = {
  ALL: "Tous",
  BIOLOGICAL_REPORT: "Bilans",
  PRESCRIPTION: "Ordonnances",
  CONSULTATION_REPORT: "Comptes-rendus",
  IMAGING: "Imagerie",
  LETTER: "Courriers",
  OTHER: "Autres",
  // Types spécialisés non exposés en filtre principal — remappés en "Autres".
  HOSPITAL_REPORT: "Comptes-rendus",
  IMPEDANCE_REPORT: "Autres",
  DXA_REPORT: "Autres",
  ECG_REPORT: "Autres",
  TRANSCRIPTION: "Autres",
};

/**
 * Mappe une valeur Prisma sur la clé de filtre exposée à l'UI.
 * Les types spécialisés (ECG/DXA/IMPEDANCE/TRANSCRIPTION) tombent dans
 * "OTHER" pour ne pas surcharger les pills. HOSPITAL_REPORT est groupé
 * avec CONSULTATION_REPORT.
 */
export function bucketize(docType: string): FilterKey {
  switch (docType) {
    case "BIOLOGICAL_REPORT":
    case "PRESCRIPTION":
    case "CONSULTATION_REPORT":
    case "IMAGING":
    case "LETTER":
      return docType;
    case "HOSPITAL_REPORT":
      return "CONSULTATION_REPORT";
    case "OTHER":
    case "IMPEDANCE_REPORT":
    case "DXA_REPORT":
    case "ECG_REPORT":
    case "TRANSCRIPTION":
      return "OTHER";
    default:
      return "OTHER";
  }
}

interface DocumentsFiltersProps {
  filter: FilterKey;
  onFilterChange: (next: FilterKey) => void;
  search: string;
  onSearchChange: (next: string) => void;
  counts: Record<FilterKey, number>;
  totalAll: number;
}

const C = {
  primary: "#5B4EC4",
  primaryLight: "rgba(91,78,196,0.08)",
  text: "#1A1A2E",
  textSoft: "#6B7280",
  border: "rgba(26,26,46,0.08)",
  card: "#FFFFFF",
};

export function DocumentsFilters({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  counts,
  totalAll,
}: DocumentsFiltersProps) {
  const searchId = useId();
  const legendId = useId();

  return (
    <form
      role="search"
      aria-labelledby={legendId}
      style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 12 }}
    >
      <span id={legendId} className="sr-only">
        Filtrer mes documents
      </span>

      {/* Search bar */}
      <div style={{ position: "relative" }}>
        <label htmlFor={searchId} className="sr-only">
          Rechercher un document par nom
        </label>
        <Search
          size={14}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: C.textSoft,
          }}
        />
        <input
          id={searchId}
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher un document…"
          autoComplete="off"
          style={{
            width: "100%",
            height: 38,
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 999,
            padding: "0 32px 0 36px",
            fontSize: 13,
            color: C.text,
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Effacer la recherche"
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              width: 22,
              height: 22,
              borderRadius: 999,
              border: "none",
              background: "rgba(26,26,46,0.06)",
              color: C.textSoft,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={12} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Pills type */}
      <fieldset
        style={{
          border: 0,
          padding: 0,
          margin: 0,
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        <legend className="sr-only">Filtrer par type de document</legend>
        {FILTER_ORDER.map((key) => {
          const active = filter === key;
          const count = key === "ALL" ? totalAll : counts[key] ?? 0;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onFilterChange(key)}
              aria-pressed={active}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                border: `1px solid ${active ? C.primary : C.border}`,
                background: active ? C.primaryLight : C.card,
                color: active ? C.primary : C.textSoft,
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "background 120ms ease, border-color 120ms ease",
              }}
            >
              {FILTER_LABELS[key]}
              <span
                style={{
                  fontSize: 11,
                  padding: "1px 6px",
                  borderRadius: 999,
                  background: active ? "rgba(91,78,196,0.16)" : "rgba(26,26,46,0.04)",
                  color: active ? C.primary : C.textSoft,
                  fontWeight: 600,
                  minWidth: 18,
                  textAlign: "center",
                }}
                aria-label={`${count} document${count !== 1 ? "s" : ""}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </fieldset>
    </form>
  );
}
