"use client";

/**
 * F-CROSS-GAP-Task-SECRETARIAT (audit cross-espaces §5.9).
 *
 * Liste minimaliste des tâches de la secrétaire (assignee OU createdBy).
 * Wording MDR : "tâche" — JAMAIS "intervention". Le composant n'expose
 * volontairement aucun PHI clinique étendu : titre + nom patient + échéance.
 *
 * Distinct du cockpit soignant (TaskCard/TaskDetailSheet/TaskFilterBar) : la
 * secrétaire NE peut PAS éditer prio/description/dueDate — un seul geste :
 * "Marquer fait".
 */

import { useState, useMemo } from "react";
import { ClipboardList, CheckCircle2, Loader2 } from "lucide-react";
import { format, parseISO, isPast, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { TaskWithContext } from "@/lib/api";
import {
  useSecretariatTasks,
  useCompleteSecretariatTask,
  type SecretariatTaskStatusFilter,
} from "@/hooks/useSecretariatTasks";

type FilterValue = "PENDING" | "COMPLETED" | "ALL";

const FILTERS: { value: FilterValue; label: string; apiStatus: SecretariatTaskStatusFilter }[] = [
  { value: "PENDING",   label: "À faire", apiStatus: "PENDING" },
  { value: "COMPLETED", label: "Fait",    apiStatus: "COMPLETED" },
  { value: "ALL",       label: "Toutes",  apiStatus: undefined },
];

function formatDueDate(due: string | null): { label: string; tone: "overdue" | "today" | "future" | "none" } {
  if (!due) return { label: "Sans échéance", tone: "none" };
  try {
    const d = parseISO(due);
    if (isToday(d)) return { label: "Aujourd'hui", tone: "today" };
    if (isPast(d))  return { label: `En retard — ${format(d, "d MMM", { locale: fr })}`, tone: "overdue" };
    return { label: format(d, "d MMM yyyy", { locale: fr }), tone: "future" };
  } catch {
    return { label: "Sans échéance", tone: "none" };
  }
}

export function SecretariatTasksSection() {
  const [filter, setFilter] = useState<FilterValue>("PENDING");

  const apiStatus = useMemo(
    () => FILTERS.find((f) => f.value === filter)?.apiStatus,
    [filter],
  );

  const { data: tasks, isLoading, isError } = useSecretariatTasks(apiStatus);
  const completeMutation = useCompleteSecretariatTask();

  const handleComplete = (careCaseId: string, taskId: string) => {
    completeMutation.mutate({ careCaseId, taskId });
  };

  return (
    <section
      data-testid="secretariat-tasks-section"
      className="bg-white border border-[#E8ECF4] rounded-xl overflow-hidden"
    >
      {/* Filtres */}
      <div className="flex items-center gap-1 px-4 py-3 border-b border-[#E8ECF4] bg-[#F5F3EF]">
        {FILTERS.map((f) => {
          const isActive = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={isActive}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors",
                isActive
                  ? "bg-[#EEEDFB] text-[#5B4EC4]"
                  : "text-[#374151] hover:bg-white hover:text-[#1A1A2E]",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Contenu */}
      <div className="divide-y divide-[#E8ECF4]">
        {isLoading ? (
          <div className="px-4 py-10 flex items-center justify-center text-[12px] text-[#6B7280]">
            <Loader2 size={14} className="animate-spin mr-2" />
            Chargement des tâches…
          </div>
        ) : isError ? (
          <div className="px-4 py-10 text-center text-[12px] text-[#DC2626]">
            Impossible de charger les tâches. Réessayer plus tard.
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="px-4 py-12 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-[#EEEDFB] flex items-center justify-center mb-3">
              <ClipboardList size={18} className="text-[#5B4EC4]" />
            </div>
            <p className="text-[13px] font-semibold text-[#1A1A2E]">Aucune tâche assignée</p>
            <p className="text-[11px] text-[#6B7280] mt-1">
              Les tâches que vous prenez en charge apparaîtront ici.
            </p>
          </div>
        ) : (
          tasks.map((t: TaskWithContext) => {
            const due = formatDueDate(t.dueDate);
            const isDone = t.status === "COMPLETED";
            const patientName = t.careCase?.patient
              ? `${t.careCase.patient.firstName} ${t.careCase.patient.lastName}`
              : "—";
            return (
              <article
                key={t.id}
                data-testid="secretariat-task-row"
                className="px-4 py-3 flex items-start gap-3 hover:bg-[#F5F3EF]"
              >
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-[13px] font-semibold truncate",
                    isDone ? "text-[#6B7280] line-through" : "text-[#1A1A2E]",
                  )}>
                    {t.title}
                  </p>
                  <p className="text-[11px] text-[#374151] mt-0.5 truncate">
                    {patientName}
                  </p>
                  <p
                    className={cn(
                      "text-[10px] mt-1 font-medium",
                      due.tone === "overdue" && "text-[#DC2626]",
                      due.tone === "today" && "text-[#5B4EC4]",
                      due.tone === "future" && "text-[#6B7280]",
                      due.tone === "none" && "text-[#9CA3AF]",
                    )}
                  >
                    {due.label}
                  </p>
                </div>

                {!isDone ? (
                  <button
                    type="button"
                    onClick={() => handleComplete(t.careCase.id, t.id)}
                    disabled={completeMutation.isPending}
                    className={cn(
                      "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold",
                      "bg-[#5B4EC4] text-white hover:bg-[#4A3FB0]",
                      "disabled:opacity-60 disabled:cursor-not-allowed transition-colors",
                    )}
                  >
                    <CheckCircle2 size={12} />
                    Marquer fait
                  </button>
                ) : (
                  <span
                    className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#EEEDFB] text-[#5B4EC4]"
                    aria-label="Tâche terminée"
                  >
                    <CheckCircle2 size={12} />
                    Fait
                  </span>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
