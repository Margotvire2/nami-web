"use client";

import type { OrgType } from "@/hooks/useSubmitApplication";
import { requiresFiness } from "@/hooks/useSubmitApplication";

interface OrgTypeOption {
  value: OrgType;
  label: string;
  description: string;
}

// Sous-ensemble exposé sur le formulaire public.
// `INTERNAL` reste réservé aux structures créées par l'équipe Nami (pas de
// self-signup). Les 13 autres types couvrent les use-cases observés.
export const ORG_TYPE_OPTIONS: ReadonlyArray<OrgTypeOption> = [
  {
    value: "CPTS",
    label: "CPTS",
    description: "Communauté professionnelle territoriale de santé",
  },
  {
    value: "MSP",
    label: "MSP",
    description: "Maison de santé pluri-professionnelle",
  },
  {
    value: "NETWORK",
    label: "Réseau de santé",
    description: "Réseau ville-hôpital, parcours coordonnés",
  },
  {
    value: "FEDERATION",
    label: "Fédération",
    description: "Fédération régionale ou nationale de soignants",
  },
  {
    value: "HOSPITAL",
    label: "Hôpital",
    description: "Établissement hospitalier (FINESS requis)",
  },
  {
    value: "HOSPITAL_SERVICE",
    label: "Service hospitalier",
    description: "Service rattaché à un hôpital (FINESS requis)",
  },
  {
    value: "CLINIC",
    label: "Clinique",
    description: "Clinique privée ou ESPIC (FINESS requis)",
  },
  {
    value: "HEALTH_CENTER",
    label: "Centre de santé",
    description: "Centre municipal, mutualiste ou associatif (FINESS requis)",
  },
  {
    value: "PRIVATE_PRACTICE",
    label: "Cabinet libéral",
    description: "Cabinet individuel ou de groupe",
  },
  {
    value: "PROFESSIONAL_GROUP",
    label: "Groupement professionnel",
    description: "Société d'exercice ou groupement de professionnels",
  },
  {
    value: "ASSOCIATION",
    label: "Association",
    description: "Association de patients, de soignants, ou loi 1901",
  },
  {
    value: "INSTITUTIONNEL",
    label: "Institution",
    description: "ARS, GRADeS, organisme de tutelle",
  },
  {
    value: "ACCELERATEUR",
    label: "Accélérateur",
    description: "Incubateur, accélérateur, structure d'accompagnement",
  },
];

interface OrgTypeSelectorProps {
  value: OrgType | null;
  onChange: (next: OrgType) => void;
}

export function OrgTypeSelector({ value, onChange }: OrgTypeSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Type d'organisation"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 12,
      }}
    >
      {ORG_TYPE_OPTIONS.map((opt) => {
        const selected = value === opt.value;
        const needsFiness = requiresFiness(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            data-testid={`org-type-${opt.value}`}
            style={{
              textAlign: "left",
              padding: 16,
              borderRadius: 12,
              border: selected
                ? "2px solid #5B4EC4"
                : "1px solid rgba(26,26,46,0.08)",
              background: selected ? "#F2F0FB" : "#FFFFFF",
              cursor: "pointer",
              transition: "all 160ms ease",
              fontFamily: "inherit",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <strong style={{ fontSize: 15, color: "#1A1A2E" }}>
                {opt.label}
              </strong>
              {needsFiness ? (
                <span
                  style={{
                    fontSize: 10,
                    padding: "2px 6px",
                    borderRadius: 6,
                    background: "#FEF3C7",
                    color: "#92400E",
                    letterSpacing: 0.4,
                  }}
                >
                  FINESS
                </span>
              ) : null}
            </div>
            <span style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.4 }}>
              {opt.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
