"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiWithToken,
  type NotificationPreferenceCategory,
  type NotificationPreferenceChannel,
  type NotificationPreferencesMatrix,
} from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

const QUERY_KEY = ["patient", "notification-preferences"] as const;
const DEBOUNCE_MS = 500;

type ToggleVars = {
  category: NotificationPreferenceCategory;
  channel: NotificationPreferenceChannel;
  enabled: boolean;
};

/**
 * Préférences notifications patient (CC #90 + CC #93).
 *
 * - Query : GET /patient/notification-preferences (matrice complète).
 * - Mutation : PATCH /patient/notification-preferences (toggle 1 cellule).
 *   - Optimistic update : la matrice locale est mise à jour AVANT la requête
 *     pour UX réactive (toggle visuel immédiat).
 *   - Rollback sur erreur : on restaure le snapshot précédent + toast.
 *   - Debounce 500ms PER CELL : si l'utilisateur clique 3 fois rapidement
 *     sur la même cellule, on n'envoie qu'un seul PATCH avec l'état final.
 *     Les cellules distinctes ne se concurrencent pas (clé = category+channel).
 */
export function usePatientNotificationPreferences() {
  const token = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();

  const query = useQuery<NotificationPreferencesMatrix>({
    queryKey: [...QUERY_KEY],
    queryFn: () => apiWithToken(token!).patient.notificationPreferences.get(),
    enabled: !!token,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: (vars: ToggleVars) =>
      apiWithToken(token!).patient.notificationPreferences.update(vars),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: [...QUERY_KEY] });
      const previous = qc.getQueryData<NotificationPreferencesMatrix>([
        ...QUERY_KEY,
      ]);
      if (previous) {
        const next: NotificationPreferencesMatrix = {
          ...previous,
          [vars.category]: {
            ...previous[vars.category],
            [vars.channel]: vars.enabled,
          },
        };
        qc.setQueryData([...QUERY_KEY], next);
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData([...QUERY_KEY], context.previous);
      }
      toast.error("Préférence non enregistrée");
    },
  });

  // Per-cell debounce : 1 timer par (category, channel). Évite que toggle
  // rapide sur la même cellule envoie N requêtes. Les autres cellules ne sont
  // pas bloquées (timers indépendants).
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    // Cleanup au unmount : annule tous les timers en attente.
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const toggle = useCallback(
    (vars: ToggleVars) => {
      // Optimistic update immédiat (UX réactive) — applique le toggle local
      // avant le debounce pour que l'UI ne lag pas.
      const previous = qc.getQueryData<NotificationPreferencesMatrix>([
        ...QUERY_KEY,
      ]);
      if (previous) {
        qc.setQueryData([...QUERY_KEY], {
          ...previous,
          [vars.category]: {
            ...previous[vars.category],
            [vars.channel]: vars.enabled,
          },
        });
      }

      const key = `${vars.category}_${vars.channel}`;
      const existing = timersRef.current.get(key);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        timersRef.current.delete(key);
        mutation.mutate(vars);
      }, DEBOUNCE_MS);
      timersRef.current.set(key, timer);
    },
    [mutation, qc],
  );

  return {
    matrix: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    toggle,
  };
}
