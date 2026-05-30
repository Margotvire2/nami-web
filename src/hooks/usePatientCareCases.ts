"use client";

import { useQuery } from "@tanstack/react-query";
import { apiWithToken, type PatientCareCaseSummary } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

/**
 * Liste des CareCase ACTIVE du patient connecté (CC #SOIGNANTS-V2).
 *
 * Source de vérité pour le groupage /mes-soignants : on récupère d'abord
 * les parcours, puis pour chacun on appelle /care-team?careCaseId= en
 * parallèle via useQueries (cf. usePatientCareTeamByCareCases).
 *
 * Tri backend : startDate desc (parcours le plus récent en tête).
 */
export function usePatientCareCases() {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  return useQuery<PatientCareCaseSummary[]>({
    queryKey: ["patient", "careCases", user?.id],
    queryFn: () => apiWithToken(token!).patient.careCases.list(),
    enabled: !!token && !!user?.id,
    staleTime: 30_000,
  });
}
