"use client";

/**
 * F-CROSS-GAP-Task-SECRETARIAT (audit cross-espaces §5.9).
 *
 * Hooks dédiés au rôle SECRETARY pour lister + compléter les tâches qui lui
 * sont assignées OU qu'elle a créées. Distinct du cockpit soignant
 * (TaskCard/TaskDetailSheet/TaskFilterBar) qui présuppose édition prio /
 * description / dueDate sur tasks d'un CareCase scopé — interdit pour le
 * SECRETARY V1.
 *
 * Backend (déjà accessible à SECRETARY, 0 modif) :
 *   GET   /tasks/mine?status=PENDING|IN_PROGRESS|COMPLETED|CANCELLED
 *         (exclut CANCELLED par défaut, scope multi-tenant via organizationId).
 *   PATCH /care-cases/:cid/tasks/:taskId  body { status: "COMPLETED" }.
 *
 * V1 scope produit : assignee OU createdBy uniquement. L'extension
 * "tasks déléguées par soignants liés" → ticket dérivé
 * `F-TASK-SECRETARY-SCOPE-BACKEND` (HORS V1).
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type TaskWithContext } from "@/lib/api";

// Statuts exposés à la secrétaire — pas de CANCELLED (filtré côté UI : "Toutes").
export type SecretariatTaskStatusFilter = "PENDING" | "COMPLETED" | undefined;

/**
 * Liste des tâches de la secrétaire.
 *
 * @param status - "PENDING" → à faire, "COMPLETED" → fait, undefined → toutes
 *                 (backend exclut déjà CANCELLED par défaut).
 */
export function useSecretariatTasks(status?: SecretariatTaskStatusFilter) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.user?.id ?? null);

  return useQuery<TaskWithContext[]>({
    queryKey: ["secretariat-tasks", userId, status ?? "ALL"],
    queryFn: async () => {
      if (!accessToken) return [];
      return apiWithToken(accessToken).tasksMine.list(status);
    },
    enabled: !!accessToken && !!userId,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/**
 * Marque une tâche secrétariat comme COMPLETED.
 * Invalide toutes les queries `["secretariat-tasks", userId, *]`.
 */
export function useCompleteSecretariatTask() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { careCaseId: string; taskId: string }) => {
      if (!accessToken) throw new Error("Not authenticated");
      return apiWithToken(accessToken).tasks.update(
        params.careCaseId,
        params.taskId,
        { status: "COMPLETED" },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["secretariat-tasks", userId],
      });
    },
  });
}
