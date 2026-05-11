/**
 * useNotificationFeed — hook React Query pour la cloche notifications cockpit.
 *
 * Stack Nami : TanStack Query v5 + Zustand (cf. CLAUDE.md). Pas de SWR.
 * Polling 60s, revalidation au focus de l'onglet.
 *
 * Vocabulaire MDR-safe : champ de tri = `priority`.
 */

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken } from "@/lib/api";
import type { NotificationFeed } from "@/lib/api";

const EMPTY_FEED: NotificationFeed = {
  todo: [],
  activity: [],
  counts: { todo: 0, activity: 0 },
};

export function useNotificationFeed(params?: { limit?: number; section?: "todo" | "activity" | "all" }) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);

  const query = useQuery<NotificationFeed>({
    queryKey: ["notifications", "feed", params ?? null],
    queryFn: () => api.notifications.feed(params),
    enabled: !!accessToken,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });

  return {
    data: query.data ?? EMPTY_FEED,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
