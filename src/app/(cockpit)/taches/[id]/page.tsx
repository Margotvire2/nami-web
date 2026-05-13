"use client";

/**
 * /taches/[id] — page de détail autonome d'une tâche.
 *
 * Pas d'endpoint GET /tasks/:id côté backend (matrice de gel V2.1).
 * On récupère la tâche depuis le payload /tasks/mine (déjà chargé via
 * `["tasks-mine"]`) et on filtre par id. Si la tâche n'est pas dans le
 * périmètre utilisateur, on affiche un message dédié.
 */

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type TaskWithContext } from "@/lib/api";
import { ChevronLeft } from "lucide-react";
import CockpitMeshBackground from "@/components/cockpit/CockpitMeshBackground";
import { TaskDetailSheet } from "@/components/taches/TaskDetailSheet";
import { buildCancelDescription } from "@/components/taches/_utils";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);

  const id = typeof params?.id === "string" ? params.id : "";

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks-mine"],
    queryFn: () => api.tasksMine.list(),
    enabled: !!accessToken,
  });

  const task = useMemo<TaskWithContext | null>(
    () => tasks.find((t) => t.id === id) ?? null,
    [tasks, id],
  );

  const updateMutation = useMutation({
    mutationFn: ({
      careCaseId,
      taskId,
      payload,
    }: {
      careCaseId: string;
      taskId: string;
      payload: Partial<{
        title: string;
        description: string | null;
        dueDate: string | null;
        priority: string;
        status: string;
      }>;
    }) => api.tasks.update(careCaseId, taskId, payload as never),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks-mine"] });
    },
  });

  const handleUpdate = async (
    careCaseId: string,
    taskId: string,
    payload: Partial<{
      title: string;
      description: string | null;
      dueDate: string | null;
      priority: string;
    }>,
  ) => {
    await updateMutation.mutateAsync({ careCaseId, taskId, payload });
  };

  const handleComplete = async (t: TaskWithContext) => {
    await updateMutation.mutateAsync({
      careCaseId: t.careCase.id,
      taskId: t.id,
      payload: { status: "COMPLETED" },
    });
    router.push("/taches");
  };

  const handleCancel = async (
    careCaseId: string,
    taskId: string,
    reason: string,
  ) => {
    const newDescription = buildCancelDescription(
      task?.description ?? null,
      reason,
    );
    await updateMutation.mutateAsync({
      careCaseId,
      taskId,
      payload: { status: "CANCELLED", description: newDescription },
    });
    router.push("/taches");
  };

  return (
    <div className="relative min-h-screen">
      <CockpitMeshBackground />

      <main className="relative max-w-[800px] mx-auto px-6 py-8">
        <button
          type="button"
          onClick={() => router.push("/taches")}
          className="glass-soft rounded-lg px-3 py-2 text-sm font-medium text-[#1A1A2E] hover:bg-white/60 transition mb-6 inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Retour aux tâches
        </button>

        {isLoading && (
          <div className="glass-soft rounded-2xl p-12 text-center text-sm text-[#4A4A5A]">
            Chargement…
          </div>
        )}

        {!isLoading && !task && (
          <div className="glass-soft rounded-2xl p-12 text-center">
            <p className="text-sm text-[#4A4A5A]">
              Cette tâche n'existe pas ou n'est pas accessible depuis votre
              espace de coordination.
            </p>
          </div>
        )}

        {/* La sheet est rendue en overlay, mais ce mode "page" la garde ouverte
            tant qu'on est sur l'URL /taches/[id]. Quand l'utilisateur ferme,
            on retourne à /taches. */}
        <TaskDetailSheet
          task={task}
          open={!!task}
          onOpenChange={(open) => {
            if (!open) router.push("/taches");
          }}
          onUpdate={handleUpdate}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />

        {/* Footer légal */}
        <footer className="mt-10 glass-soft rounded-xl px-5 py-3 text-center text-[11px] text-[#1A1A2E]/50">
          Outil de coordination · Non dispositif médical · Conforme RGPD
        </footer>
      </main>
    </div>
  );
}
