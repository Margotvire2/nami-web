"use client";

import { useQuery } from "@tanstack/react-query";
import { apiWithToken, type PatientPathwaySummary } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

/**
 * Parcours guidés du patient connecté — un summary par CareCase ACTIVE
 * (CC #PATHWAY-FRONTEND).
 *
 * Backend : GET /patient/pathway, retourne PatientPathwaySummary[] avec
 * phases groupées + steps statués depuis PathwayNode (cron quotidien
 * pathway_status_update). Tri startDate desc.
 */
export function usePatientPathway() {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  return useQuery<PatientPathwaySummary[]>({
    queryKey: ["patient", "pathway", user?.id],
    queryFn: () => apiWithToken(token!).patient.pathway.list(),
    enabled: !!token && !!user?.id,
    staleTime: 30_000,
  });
}
