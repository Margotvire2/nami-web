"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiWithToken } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

/**
 * Mutation DELETE /patient/care-team/:providerId (CC #91).
 *
 * Révoque l'accès du soignant à TOUS les CareCases actifs du patient.
 * Sur succès, invalide les queries care-team et care-cases pour rafraîchir
 * l'UI groupée — un soignant retiré disparaît de toutes les sections
 * où il apparaissait.
 *
 * Rate limit backend : 5 / patient / 24h (réponse 429 → message générique).
 */
export function useRevokePatientCareTeamMember() {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      providerId,
      reason,
    }: {
      providerId: string;
      reason?: string;
    }) => apiWithToken(token!).patient.careTeam.revoke(providerId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["patient", "careTeam", user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["patient", "careCases", user?.id],
      });
    },
  });
}
