"use client";

import { useQuery } from "@tanstack/react-query";
import { secretaryApi, type SecretaryNotificationFeed } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

/**
 * Hook React Query pour le feed personnel de notifications secrétaire.
 *
 * - Pattern miroir de usePatientNotifications (PR #43 web + PR #59 backend),
 *   adapté à la shape `{ items, counts: { unread, total } }` exposée par
 *   GET /secretary/notifications/feed (PR #173 backend).
 * - Polling 60s + staleTime 30s + refetchOnWindowFocus (defaults React Query).
 * - QueryKey inclut user.id → auto-refetch sur changement de compte.
 * - Graceful degradation : si endpoint 404 (env legacy), retourne feed vide
 *   pour que la cloche reste muette plutôt que de crasher le layout.
 *
 * Hors scope V1 (à ajouter quand backend l'expose) :
 *   - markRead par notification (PATCH /secretary/notifications/:id/read)
 *   - filtrage par section (all / unread)
 */
export function useSecretaryNotifications(options?: { limit?: number }) {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  return useQuery<SecretaryNotificationFeed>({
    queryKey: ["secretary-notifications", user?.id, options?.limit],
    queryFn: async () => {
      if (!token) return { items: [], counts: { unread: 0, total: 0 } };
      try {
        return await secretaryApi(token).notifications.feed(options);
      } catch (err: unknown) {
        if (
          err &&
          typeof err === "object" &&
          "status" in err &&
          (err as { status: number }).status === 404
        ) {
          return { items: [], counts: { unread: 0, total: 0 } };
        }
        throw err;
      }
    },
    enabled: !!token && !!user?.id,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });
}
