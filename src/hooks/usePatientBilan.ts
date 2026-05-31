"use client";

import { useQuery } from "@tanstack/react-query";
import { apiWithToken, type PatientBilan } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

/**
 * Bilan biologique unique du patient connecté.
 *
 * V1 dégradé : le backend nami n'expose pas encore GET /patient/documents/:id.
 * On réutilise la même queryKey + queryFn que usePatientBilans() pour partager
 * le cache TanStack Query (un seul fetch /patient/documents pour toute la
 * navigation /mes-bilans ↔ /mes-bilans/[id]), et on filtre par id côté client
 * via `select`. Quand le backend exposera GET /:id, migrer vers
 * `apiWithToken(token!).patient.bilans.get(id)` + queryKey dédiée.
 *
 * Renvoie `data: undefined` quand la liste est chargée mais qu'aucun bilan ne
 * matche l'id (page client → notFound UI).
 */
export function usePatientBilan(id: string) {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  return useQuery<PatientBilan[], Error, PatientBilan | undefined>({
    queryKey: ["patient", "bilans", user?.id],
    queryFn: () => apiWithToken(token!).patient.bilans.list(),
    enabled: !!token && !!user?.id && !!id,
    staleTime: 30_000,
    select: (bilans) => bilans.find((b) => b.id === id),
  });
}
