"use client";

import { useQueries, type UseQueryResult } from "@tanstack/react-query";
import { apiWithToken, type PatientAuthorizedProvider } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

/**
 * Récupère la care team de chaque CareCase en PARALLÈLE (useQueries),
 * pas en cascade. Pour N parcours → N requêtes simultanées vers
 * GET /patient/care-team?careCaseId=.
 *
 * Pourquoi useQueries plutôt que N useQuery hardcodés : le nombre de
 * parcours est dynamique. Pourquoi pas un seul fetch global puis groupage
 * client : l'endpoint actuel déduplique par providerId tous CareCases
 * confondus — on perdrait l'info d'appartenance.
 */
export function usePatientCareTeamByCareCases(careCaseIds: string[]) {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  return useQueries({
    queries: careCaseIds.map((careCaseId) => ({
      queryKey: ["patient", "careTeam", user?.id, careCaseId],
      queryFn: () =>
        apiWithToken(token!).patient.careTeam.list({ careCaseId }),
      enabled: !!token && !!user?.id,
      staleTime: 30_000,
    })),
  }) as UseQueryResult<PatientAuthorizedProvider[], Error>[];
}
