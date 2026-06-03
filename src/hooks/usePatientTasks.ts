"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiWithToken, type PatientTask } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

/**
 * Tâches du patient connecté (F-CROSS-GAP-Task-PATIENT).
 *
 * Backend : GET /tasks/mine → tasks où assignee OU createdBy = personId du
 * patient. Multi-CareCase, groupage côté UI via task.careCase.id.
 *
 * Statut par défaut : exclut CANCELLED côté backend. On filtre côté UI selon
 * besoin (PENDING + IN_PROGRESS = "à faire", COMPLETED = "terminées").
 */
export function usePatientTasks() {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  return useQuery<PatientTask[]>({
    queryKey: ["patient", "tasks", user?.id],
    queryFn: () => apiWithToken(token!).patient.tasks.list(),
    enabled: !!token && !!user?.id,
    staleTime: 30_000,
  });
}

export function useCompletePatientTask() {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ careCaseId, taskId }: { careCaseId: string; taskId: string }) =>
      apiWithToken(token!).patient.tasks.complete(careCaseId, taskId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["patient", "tasks", user?.id] });
      void qc.invalidateQueries({ queryKey: ["patient", "pathway", user?.id] });
    },
  });
}
