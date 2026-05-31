"use client";

import { useQuery } from "@tanstack/react-query";
import { apiWithToken, type PatientIndicator } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import type { PeriodKey } from "@/app/(patient)/suivi/mock-data";

const PERIOD_DAYS_MAP: Record<PeriodKey, 7 | 30 | 90 | 180 | 365> = {
  "7d": 7,
  "30d": 30,
  "3m": 90,
  "6m": 180,
  "1y": 365,
};

/**
 * Indicateurs /suivi du patient connecté (CC #95 backend).
 *
 * Backend renvoie déjà filtré sur periodDays — on n'a pas besoin de re-filtrer
 * côté client. IndicatorCard fait un sous-filtre PeriodKey pour le graph.
 *
 * V2-SUIVI-INDICATEURS-CARECASE-SCOPING : option `careCaseId` pour ne remonter
 * que les Observations rattachées à un parcours donné. Le backend filtre côté
 * Prisma (Observation.careCaseId). La queryKey embarque careCaseId pour
 * isoler les caches par parcours.
 */
export function usePatientObservations(
  period: PeriodKey,
  careCaseId?: string,
) {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const periodDays = PERIOD_DAYS_MAP[period];

  return useQuery<PatientIndicator[]>({
    queryKey: ["patient", "observations", user?.id, periodDays, careCaseId ?? null],
    queryFn: () =>
      apiWithToken(token!).patient.observations.list({ periodDays, careCaseId }),
    enabled: !!token && !!user?.id,
    staleTime: 60_000,
  });
}
