"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiWithToken } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

/**
 * Mutation DELETE /patient/appointment-requests/:id (CC #89, PR #74).
 *
 * Retire une demande PENDING : transition vers status='WITHDRAWN_BY_PATIENT'
 * (pas de hard delete — audit légal RGPD/HDS). Sur succès, invalide toutes
 * les queries d'appointment-requests du patient pour rafraîchir le tab.
 *
 * Backend retourne 403 si l'AR n'est plus PENDING (cas race condition :
 * soignant accepte/refuse au même moment).
 */
export function useWithdrawAppointmentRequest() {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiWithToken(token!).patient.appointmentRequests.withdraw(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["patient", "appointmentRequests", user?.id],
      });
    },
  });
}
