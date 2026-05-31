"use client";

import { Loader2 } from "lucide-react";
import { HubLinkButton } from "@/components/patient/HubLinkButton";
import { IndicatorsGrid } from "../IndicatorsGrid";
import { usePatientObservations } from "@/hooks/usePatientObservations";
import type { PatientCareCaseSummary } from "@/lib/api";
import type { PeriodKey } from "../mock-data";

interface SuiviCareCaseSectionProps {
  careCase: PatientCareCaseSummary;
  period: PeriodKey;
}

/**
 * Section /suivi scopée par CareCase (V2-SUIVI-INDICATEURS-CARECASE-SCOPING).
 *
 * Charge les indicateurs filtrés sur `careCase.id` via le hook
 * `usePatientObservations(period, careCaseId)`, et réutilise le composant
 * `IndicatorsGrid` existant (catégorisation PR #126 préservée :
 * anthropométrie / composition / signes vitaux / biologie / scores / autres).
 *
 * Header : titre du parcours + `HubLinkButton` (ancre #suivi) pour ramener au
 * hub /parcours/[careCaseId], pattern cohérent avec /mes-soignants (PR #112)
 * /mes-bilans, /mes-documents.
 *
 * Wording MDR-safe : on parle uniquement de "parcours" (libellé administratif).
 * Aucun vocabulaire clinique côté patient.
 */
export function SuiviCareCaseSection({
  careCase,
  period,
}: SuiviCareCaseSectionProps) {
  const { data: indicators, isLoading, error } = usePatientObservations(
    period,
    careCase.id,
  );

  const list = indicators ?? [];
  const headerId = `suivi-care-case-${careCase.id}-title`;
  // patientFacingTitle absent du shape `PatientCareCaseSummary` actuel,
  // fallback identique à UploadTargetingModal.
  const title = careCase.caseTitle || "Mon parcours de coordination";

  return (
    <section aria-labelledby={headerId} style={{ marginBottom: 32 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <h2
          id={headerId}
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#1A1A2E",
            margin: 0,
            fontFamily: "var(--font-jakarta)",
          }}
        >
          {title}
        </h2>
        <div style={{ flexShrink: 0 }}>
          <HubLinkButton
            careCaseId={careCase.id}
            careCaseLabel={title}
            sectionAnchor="suivi"
          />
        </div>
      </div>

      {isLoading ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#6B7280",
            fontSize: 14,
            padding: "16px 0",
            fontFamily: "var(--font-jakarta)",
          }}
        >
          <Loader2
            size={16}
            strokeWidth={2}
            aria-hidden="true"
            style={{ animation: "spin 1s linear infinite" }}
          />
          Chargement des indicateurs de ce parcours…
        </div>
      ) : error ? (
        <p
          role="alert"
          style={{
            color: "#DC2626",
            fontSize: 14,
            background: "rgba(220,38,38,0.05)",
            border: "1px solid rgba(220,38,38,0.18)",
            borderRadius: 12,
            padding: 16,
            margin: 0,
            fontFamily: "var(--font-jakarta)",
          }}
        >
          Impossible de charger les indicateurs de ce parcours pour le moment.
          Réessayez plus tard.
        </p>
      ) : list.length === 0 ? (
        <p
          style={{
            fontSize: 13,
            color: "#6B7280",
            background: "#FFFFFF",
            border: "1px solid rgba(26,26,46,0.08)",
            borderRadius: 12,
            padding: 20,
            margin: 0,
            fontFamily: "var(--font-jakarta)",
          }}
        >
          Aucun indicateur enregistré dans ce parcours pour le moment.
        </p>
      ) : (
        <IndicatorsGrid indicators={list} period={period} />
      )}
    </section>
  );
}
