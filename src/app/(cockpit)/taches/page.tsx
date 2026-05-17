"use client";

/**
 * /taches — refonte Vague 2.1 (Liquid Glass × Nami v1.0).
 *
 * Pattern inspiré de la refonte /adressages PR #7. 4 sections temporelles
 * (En retard pulse-dot · Aujourd'hui · À venir · Terminées collapsed),
 * filtre simple `Toutes / Mes tâches / Mes équipes`, sheet de détail
 * glass-strong avec édition inline.
 *
 * Création de tâche : INTERDITE depuis /taches (Q1). Le bouton renvoie vers
 * /patients (création depuis la fiche patient, où le careCase context existe).
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type TaskWithContext } from "@/lib/api";
import { Plus } from "lucide-react";
import CockpitMeshBackground from "@/components/cockpit/CockpitMeshBackground";
import { TaskCard } from "@/components/taches/TaskCard";
import { TaskDetailSheet } from "@/components/taches/TaskDetailSheet";
import { TaskFilterBar } from "@/components/taches/TaskFilterBar";
import { OverdueSection } from "@/components/taches/OverdueSection";
import { TaskPeriodSection } from "@/components/taches/TaskPeriodSection";
import {
  applyOwnershipFilter,
  buildCancelDescription,
  groupTasksByPeriod,
} from "@/components/taches/_utils";
import {
  PRIORITY_ORDER,
  type TaskFilterValue,
} from "@/components/taches/_constants";

export default function TachesPage() {
  const { accessToken, user } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const queryClient = useQueryClient();
  const myPersonId = user?.personId;

  const [filter, setFilter] = useState<TaskFilterValue>("mine");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<TaskWithContext | null>(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks-mine"],
    queryFn: () => api.tasksMine.list(),
    enabled: !!accessToken,
  });

  // B3 fix : optimistic update — mutation backend ~5,5s en prod, UI réactive instantanément
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
    }) =>
      api.tasks.update(
        careCaseId,
        taskId,
        // Le type Partial<Task> est plus restrictif côté api.ts mais le
        // backend accepte ces champs ; on s'aligne sur la signature exposée.
        payload as never,
      ),
    onMutate: async ({ taskId, payload }) => {
      // Annule les refetches en cours pour éviter l'écrasement de notre update optimiste
      await queryClient.cancelQueries({ queryKey: ["tasks-mine"] });
      // Snapshot pour rollback en cas d'erreur
      const previous = queryClient.getQueryData<TaskWithContext[]>([
        "tasks-mine",
      ]);
      // Application optimiste : merge payload dans la task ciblée
      queryClient.setQueryData<TaskWithContext[]>(
        ["tasks-mine"],
        (old) =>
          old?.map((t) =>
            t.id === taskId ? ({ ...t, ...payload } as TaskWithContext) : t,
          ) ?? old,
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Rollback en cas d'erreur backend
      if (context?.previous) {
        queryClient.setQueryData(["tasks-mine"], context.previous);
      }
    },
    onSettled: () => {
      // Resync avec la vérité backend dans tous les cas
      queryClient.invalidateQueries({ queryKey: ["tasks-mine"] });
      queryClient.invalidateQueries({ queryKey: ["task"] });
    },
  });

  /* ── Pipeline filter / search / sort / group ─────────────────────────── */

  const ownershipFiltered = useMemo(
    () => applyOwnershipFilter(tasks, filter, myPersonId),
    [tasks, filter, myPersonId],
  );

  const searched = useMemo(() => {
    if (!search.trim()) return ownershipFiltered;
    const q = search.trim().toLowerCase();
    return ownershipFiltered.filter((t) => {
      const haystack = [
        t.title,
        t.description,
        t.careCase?.patient?.firstName,
        t.careCase?.patient?.lastName,
        t.careCase?.caseTitle,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [ownershipFiltered, search]);

  const sorted = useMemo(() => {
    return [...searched].sort((a, b) => {
      const pa =
        PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] ?? 99;
      const pb =
        PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] ?? 99;
      if (pa !== pb) return pa - pb;
      if (a.dueDate && b.dueDate)
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
  }, [searched]);

  const groups = useMemo(() => groupTasksByPeriod(sorted), [sorted]);

  /* ── Counts par filtre (pour le compteur des chips) ──────────────────── */

  const counts = useMemo(() => {
    return {
      all: tasks.length,
      mine: myPersonId
        ? tasks.filter((t) => t.assignedTo?.id === myPersonId).length
        : 0,
      team: myPersonId
        ? tasks.filter((t) => t.assignedTo?.id !== myPersonId).length
        : tasks.length,
    };
  }, [tasks, myPersonId]);

  /* ── Handlers ────────────────────────────────────────────────────────── */

  const handleComplete = (task: TaskWithContext) =>
    updateMutation.mutateAsync({
      careCaseId: task.careCase.id,
      taskId: task.id,
      payload: { status: "COMPLETED" },
    });

  const handleCancel = async (
    careCaseId: string,
    taskId: string,
    reason: string,
  ) => {
    const original = tasks.find((t) => t.id === taskId);
    const newDescription = buildCancelDescription(
      original?.description ?? null,
      reason,
    );
    await updateMutation.mutateAsync({
      careCaseId,
      taskId,
      payload: { status: "CANCELLED", description: newDescription },
    });
  };

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

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <div className="relative min-h-screen">
      <CockpitMeshBackground />

      <main className="relative max-w-[1100px] mx-auto px-6 lg:px-9 py-7">
        {/* Header */}
        <header className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1A1A2E]">
              Tâches
            </h1>
            <p className="text-sm text-[#4A4A5A] mt-1">
              Vos actions à réaliser dans les parcours de coordination
            </p>
          </div>
          {/* Q1 : pas de création depuis /taches, lien vers /patients */}
          <Link
            href="/patients"
            className="glass-soft rounded-lg px-4 py-2 text-sm font-medium text-[#5B4EC4] hover:bg-white/60 transition inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40"
          >
            <Plus className="size-4" aria-hidden />
            Nouvelle tâche (depuis un patient)
          </Link>
        </header>

        {/* Filtres */}
        <div className="mb-6">
          <TaskFilterBar
            filter={filter}
            onFilterChange={setFilter}
            searchValue={search}
            onSearchChange={setSearch}
            counts={counts}
          />
        </div>

        {/* Sections */}
        {!isLoading && (
          <>
            <OverdueSection count={groups.overdue.length}>
              {groups.overdue.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={setSelected}
                  onComplete={handleComplete}
                />
              ))}
            </OverdueSection>

            <TaskPeriodSection title="Aujourd'hui" count={groups.today.length}>
              {groups.today.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={setSelected}
                  onComplete={handleComplete}
                />
              ))}
            </TaskPeriodSection>

            <TaskPeriodSection
              title="À venir"
              count={groups.upcoming.length}
            >
              {groups.upcoming.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={setSelected}
                  onComplete={handleComplete}
                />
              ))}
            </TaskPeriodSection>

            <TaskPeriodSection
              title="Terminées"
              count={groups.completed.length}
              defaultCollapsed
            >
              {groups.completed.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={setSelected}
                />
              ))}
            </TaskPeriodSection>

            {sorted.length === 0 && (
              <div className="glass-soft rounded-2xl p-12 text-center">
                <p className="text-sm text-[#4A4A5A]">
                  {search.trim()
                    ? "Aucune tâche ne correspond à votre recherche."
                    : "Aucune tâche à afficher."}
                </p>
                <p className="text-xs text-[#8A8A96] mt-1">
                  Pour créer une nouvelle tâche, ouvrez la fiche d'un patient.
                </p>
              </div>
            )}
          </>
        )}

        {/* Footer légal */}
        <footer className="mt-10 glass-soft rounded-xl px-5 py-3 text-center text-[11px] text-[#1A1A2E]/50">
          Outil de coordination · Non dispositif médical · Conforme RGPD
        </footer>
      </main>

      <TaskDetailSheet
        task={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onUpdate={handleUpdate}
        onComplete={async (t) => {
          await handleComplete(t);
          setSelected(null);
        }}
        onCancel={handleCancel}
      />
    </div>
  );
}
