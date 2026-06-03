"use client";

import { useQuery } from "@tanstack/react-query";
import { apiWithToken, type PatientRcpSummary } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

/**
 * Historique des RCP (concertations) CLOSED d'un parcours du patient.
 *
 * F-CROSS-GAP-RCP-PATIENT (CC #5). Backend GET /patient/care-cases/:careCaseId/rcps,
 * ownership check côté backend (404 anti-énumération si careCase d'un autre
 * patient). Tri closedAt desc.
 *
 * `enabled` ne tire que si careCaseId fourni (le composant
 * PatientRcpHistory ne s'affiche que sur le parcours sélectionné).
 */
export function usePatientRcps(careCaseId: string | null | undefined) {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  return useQuery<{ items: PatientRcpSummary[] }>({
    queryKey: ["patient", "rcps", user?.id, careCaseId],
    queryFn: () => apiWithToken(token!).patient.careCases.rcps(careCaseId!),
    enabled: !!token && !!user?.id && !!careCaseId,
    staleTime: 60_000,
  });
}
