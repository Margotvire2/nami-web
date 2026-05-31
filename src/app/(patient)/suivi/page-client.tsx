"use client";

import { useState } from "react";
import { type PeriodKey } from "./mock-data";
import { SuiviHero } from "./SuiviHero";
import { SuiviEmptyState } from "./SuiviEmptyState";
import { SuiviCareCaseSection } from "./_components/SuiviCareCaseSection";
import { usePatientCareCases } from "@/hooks/usePatientCareCases";
import { usePatientObservations } from "@/hooks/usePatientObservations";

/**
 * /suivi V2 — vue groupée par CareCase (V2-SUIVI-INDICATEURS-CARECASE-SCOPING).
 *
 * Cohérence multi-parcours : chaque CareCase ACTIVE expose ses propres
 * indicateurs filtrés côté backend (Observation.careCaseId), avec un
 * HubLinkButton pour ramener au hub /parcours/[careCaseId]#suivi.
 *
 * Le composant `IndicatorsGrid` existant est réutilisé tel quel — la
 * catégorisation par type d'observation (anthropométrie / composition /
 * signes vitaux / biologie / scores / autres, PR #126) est préservée à
 * l'intérieur de chaque section CareCase.
 *
 * Vue globale (toutes Observations confondues) : le SuiviHero compte les
 * indicateurs cross-CareCase via une requête séparée non scopée — utilisée
 * uniquement pour la statistique de tête et la détection empty global.
 */
export function SuiviPageClient() {
  const [period, setPeriod] = useState<PeriodKey>("3m");

  // Vue globale (non scopée) — sert au hero et au fallback empty state.
  const globalIndicators = usePatientObservations(period);
  const careCasesQuery = usePatientCareCases();

  const globalList = globalIndicators.data ?? [];
  const careCases = careCasesQuery.data ?? [];
  const latestMeasurementDate = globalList.reduce<string | null>((acc, ind) => {
    if (!acc) return ind.latestDate;
    return new Date(ind.latestDate) > new Date(acc) ? ind.latestDate : acc;
  }, null);

  const isLoadingGlobal = globalIndicators.isLoading || careCasesQuery.isLoading;
  const errorGlobal = globalIndicators.error ?? careCasesQuery.error;

  return (
    <main
      aria-label="Mon suivi"
      style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 0 96px" }}
    >
      <SuiviHero
        indicatorsCount={globalList.length}
        latestMeasurementDate={latestMeasurementDate}
        period={period}
        onPeriodChange={setPeriod}
      />
      {isLoadingGlobal ? (
        <p
          role="status"
          aria-live="polite"
          style={{ textAlign: "center", padding: "48px 0", color: "#6B7280", fontSize: 14 }}
        >
          Chargement de vos indicateurs…
        </p>
      ) : errorGlobal ? (
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
      ) : careCases.length === 0 || globalList.length === 0 ? (
        <SuiviEmptyState />
      ) : (
        <div>
          {careCases.map((cc) => (
            <SuiviCareCaseSection key={cc.id} careCase={cc} period={period} />
          ))}
        </div>
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
