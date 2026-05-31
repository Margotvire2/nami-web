"use client";

import { useQuery } from "@tanstack/react-query";
import { apiWithToken, type PatientAppointmentRequest } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

/**
 * Liste des AppointmentRequest visibles par le patient connecté (CC #89, PR #74).
 *
 * Filtre `status` par défaut côté backend = "pending". Pour le tab « En attente »
 * de /rendez-vous V2, on requête explicitement status='pending' — les autres
 * statuts terminaux apparaissent ailleurs (ACCEPTED → tab À venir comme RDV
 * confirmé, DECLINED / WITHDRAWN_BY_PATIENT : pas de surface dédiée V1).
 *
 * `onBehalfOf` : switch contexte délégation (parent qui consulte les demandes
 * d'un enfant). Backend exige une délégation BOOK_APPOINTMENTS active.
 */
export function usePatientAppointmentRequests(params?: {
  status?: "pending" | "accepted" | "declined" | "withdrawn" | "all";
  onBehalfOf?: string;
}) {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  return useQuery<PatientAppointmentRequest[]>({
    queryKey: [
      "patient",
      "appointmentRequests",
      user?.id,
      params?.status ?? "pending",
      params?.onBehalfOf ?? null,
    ],
    queryFn: () =>
      apiWithToken(token!).patient.appointmentRequests.list(params),
    enabled: !!token && !!user?.id,
    staleTime: 30_000,
  });
}
