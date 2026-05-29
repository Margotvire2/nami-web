"use client";

import { useQuery } from "@tanstack/react-query";
import { apiWithToken, type PatientBilan } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

/**
 * Liste des bilans biologiques uploadés par le patient (filtrés côté client
 * sur documentType=BIOLOGICAL_REPORT). Triés date desc côté backend.
 *
 * Les champs analysisStatus/observationsCount sont optionnels (CC #79 backend
 * peut ne pas être déployé) → BilanStatusBadge fallback "Bilan reçu".
 */
export function usePatientBilans() {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  return useQuery<PatientBilan[]>({
    queryKey: ["patient", "bilans", user?.id],
    queryFn: () => apiWithToken(token!).patient.bilans.list(),
    enabled: !!token && !!user?.id,
    staleTime: 30_000,
  });
}
