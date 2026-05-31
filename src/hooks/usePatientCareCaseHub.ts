"use client";

import { useQuery } from "@tanstack/react-query";
import { apiWithToken, type PatientCareCaseHub } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

/**
 * Hub agrégé d'un parcours patient (CC #PARCOURS-HUB-CARECASE-ID).
 *
 * Backend : GET /patient/care-case-hub/:careCaseId — agrège en 1 call
 * pathway + providers + RDV + observations + documents + messages scoped
 * au CareCase. Ownership check + délégation VIEW_MEDICAL_HISTORY backend.
 *
 * Source backend : nami/src/services/patientCareCaseHub.service.ts (PR #99).
 */
export function usePatientCareCaseHub(
  careCaseId: string | undefined,
  params?: { onBehalfOf?: string },
) {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  return useQuery<PatientCareCaseHub>({
    queryKey: [
      "patient",
      "careCaseHub",
      user?.id,
      careCaseId,
      params?.onBehalfOf ?? null,
    ],
    queryFn: () =>
      apiWithToken(token!).patient.careCaseHub.get(careCaseId!, params),
    enabled: !!token && !!user?.id && !!careCaseId,
    staleTime: 30_000,
    retry: (failureCount, error: unknown) => {
      // Pas de retry sur 404 (hub introuvable) ni 403 (délégation refusée).
      const status = (error as { status?: number })?.status;
      if (status === 404 || status === 403) return false;
      return failureCount < 2;
    },
  });
}
