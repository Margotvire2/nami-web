"use client";

import { useState } from "react";
import { MOCK_INDICATORS, type PeriodKey } from "./mock-data";
import { SuiviHero } from "./SuiviHero";
import { IndicatorsGrid } from "./IndicatorsGrid";
import { SuiviEmptyState } from "./SuiviEmptyState";

export function SuiviPageClient() {
  const [period, setPeriod] = useState<PeriodKey>("3m");

  const indicators = MOCK_INDICATORS;
  // Dernière mesure tout indicateur confondu
  const latestMeasurementDate = indicators.reduce<string | null>((acc, ind) => {
    if (!acc) return ind.latestDate;
    return new Date(ind.latestDate) > new Date(acc) ? ind.latestDate : acc;
  }, null);

  return (
    <main
      aria-label="Mon suivi de santé"
      style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 0 96px" }}
    >
      <SuiviHero
        indicatorsCount={indicators.length}
        latestMeasurementDate={latestMeasurementDate}
        period={period}
        onPeriodChange={setPeriod}
      />
      {indicators.length === 0 ? (
        <SuiviEmptyState />
      ) : (
        <IndicatorsGrid indicators={indicators} period={period} />
      )}
    </main>
  );
}
