"use client";

import { useState } from "react";
import { type PeriodKey } from "./mock-data";
import { SuiviHero } from "./SuiviHero";
import { IndicatorsGrid } from "./IndicatorsGrid";
import { SuiviEmptyState } from "./SuiviEmptyState";
import { usePatientObservations } from "@/hooks/usePatientObservations";

export function SuiviPageClient() {
  const [period, setPeriod] = useState<PeriodKey>("3m");
  const { data: indicators, isLoading, error } = usePatientObservations(period);

  const list = indicators ?? [];
  const latestMeasurementDate = list.reduce<string | null>((acc, ind) => {
    if (!acc) return ind.latestDate;
    return new Date(ind.latestDate) > new Date(acc) ? ind.latestDate : acc;
  }, null);

  return (
    <main
      aria-label="Mon suivi"
      style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 0 96px" }}
    >
      <SuiviHero
        indicatorsCount={list.length}
        latestMeasurementDate={latestMeasurementDate}
        period={period}
        onPeriodChange={setPeriod}
      />
      {isLoading ? (
        <p
          role="status"
          aria-live="polite"
          style={{ textAlign: "center", padding: "48px 0", color: "#6B7280", fontSize: 14 }}
        >
          Chargement de vos indicateurs…
        </p>
      ) : error ? (
        <p
          role="alert"
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "#6B7280",
            fontSize: 14,
          }}
        >
          Impossible de charger vos indicateurs pour le moment. Réessayez plus tard.
        </p>
      ) : list.length === 0 ? (
        <SuiviEmptyState />
      ) : (
        <IndicatorsGrid indicators={list} period={period} />
      )}

      {/* Footer MDR obligatoire — Nami n'est pas un dispositif médical */}
      <p
        style={{
          marginTop: 48,
          fontSize: 12,
          color: "#9CA3AF",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        Nami n&apos;est pas un dispositif médical. Pour interpréter ces données,
        parlez-en à votre médecin.
      </p>
    </main>
  );
}
