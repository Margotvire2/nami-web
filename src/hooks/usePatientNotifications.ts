"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

/**
 * Hook React Query pour marquer une notification patient comme lue.
 *
 * - Appelle PATCH /patient/notifications/:id/read (backend nami PR #61).
 * - Invalide la queryKey "patient-notifications" pour refetch immédiat
 *   (cloche header + page /notifications + badge sidebar/bottom-nav).
 * - Best-effort : si le PATCH échoue, on log mais on ne bloque pas la
 *   navigation (le user a déjà cliqué pour aller voir la cible).
 *
 * Idempotent côté backend : 200 même si déjà lue.
 */
export function useMarkNotificationAsRead() {
  const token = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!token) throw new Error("Non authentifié");
      return apiWithToken(token).patient.notifications.markRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-notifications"] });
    },
    onError: (error) => {
      // Best-effort : on log mais on ne bloque pas la nav
      console.error("[useMarkNotificationAsRead] failed", error);
    },
  });
}
