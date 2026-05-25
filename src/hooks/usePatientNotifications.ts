"use client";

import { useQuery } from "@tanstack/react-query";
import { apiWithToken } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

/**
 * Hook React Query pour le feed de notifications patient.
 *
 * - Polling 60s (refetchInterval) + refetchOnWindowFocus (default React Query)
 * - Query key inclut user.id (auto-refetch sur changement de compte)
 * - Graceful degradation : si endpoint 404 (PR #59 backend pas encore mergée),
 *   retourne unreadCount: 0 sans throw → cloche reste à 0 sans crash
 *
 * Hors scope V1 (cf. tickets dérivés) :
 *   - markAsRead : F-NOTIF-PATIENT-READ-ENDPOINT
 *   - switch profil délégué (onBehalfOf) : à ajouter quand le backend l'expose
 */
export function usePatientNotifications(options?: {
  limit?: number;
  section?: "all" | "unread";
}) {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["patient-notifications", user?.id, options?.limit, options?.section],
    queryFn: async () => {
      if (!token) return { items: [], unreadCount: 0 };
      try {
        return await apiWithToken(token).patient.notifications.feed(options);
      } catch (err: unknown) {
        // Graceful : si 404 (endpoint pas encore mergé), retourne vide
        if (
          err &&
          typeof err === "object" &&
          "status" in err &&
          (err as { status: number }).status === 404
        ) {
          return { items: [], unreadCount: 0 };
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
