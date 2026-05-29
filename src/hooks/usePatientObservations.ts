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
 * Backend renvoie déjà filtré sur periodDays — on n'a pas besoin de re-filtrer
 * côté client. IndicatorCard fait un sous-filtre PeriodKey pour le graph.
 */
export function usePatientObservations(period: PeriodKey) {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const periodDays = PERIOD_DAYS_MAP[period];

  return useQuery<PatientIndicator[]>({
    queryKey: ["patient", "observations", user?.id, periodDays],
    queryFn: () => apiWithToken(token!).patient.observations.list({ periodDays }),
    enabled: !!token && !!user?.id,
    staleTime: 60_000,
  });
}
