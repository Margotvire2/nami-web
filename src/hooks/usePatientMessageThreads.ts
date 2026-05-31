"use client";

import { useQuery } from "@tanstack/react-query";
import { apiWithToken, type PatientMessageThread } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

/**
 * Liste des threads patient (channels CARECASE + DM 1:1) — CC #MES-MESSAGES-CHANNELS-DM.
 *
 * Backend (PR #94) : 1 thread par CareCase ACTIVE + 1 thread DM par soignant
 * unique de tous les CareCase (dedupe). Tri global : dernier message le plus
 * récent en tête, puis par totalCount desc, puis par title asc.
 *
 * staleTime 30 s — UX type messagerie : on rafraîchit régulièrement sans
 * spammer le réseau. Pas de polling agressif (le mobile/web peut reload
 * manuellement et la prochaine PR notifs push gérera le temps réel).
 */
export function usePatientMessageThreads(opts?: { onBehalfOf?: string }) {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  return useQuery<PatientMessageThread[]>({
    queryKey: ["patient", "messages", "threads", user?.id, opts?.onBehalfOf ?? null],
    queryFn: () => apiWithToken(token!).patient.messages.threads({ onBehalfOf: opts?.onBehalfOf }),
    enabled: !!token && !!user?.id,
    staleTime: 30_000,
  });
}
