"use client";

import { useMemo } from "react";
import type { PatientTask } from "@/lib/api";
import { useCompletePatientTask, usePatientTasks } from "@/hooks/usePatientTasks";

interface Props {
  /** Filtre côté UI : si fourni, n'affiche que les tasks de ce CareCase. */
  careCaseId?: string;
  /** Override pour Storybook/tests — bypass le hook usePatientTasks. */
  tasksOverride?: PatientTask[];
}

const PRIORITY_LABEL: Record<PatientTask["priority"], string> = {
  URGENT: "Prioritaire",
  HIGH: "Important",
  MEDIUM: "Normal",
  LOW: "Quand vous pouvez",
};

const PRIORITY_COLOR: Record<PatientTask["priority"], string> = {
  URGENT: "#DC2626",
  HIGH: "#D97706",
  MEDIUM: "#5B4EC4",
  LOW: "#6B7280",
};

function formatDueDate(iso: string | null): string | null {
  if (!iso) return null;
  const due = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (dueDay.getTime() - today.getTime()) / 86_400_000,
  );
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Demain";
  if (diffDays === -1) return "Hier";
  if (diffDays < 0) return `Il y a ${Math.abs(diffDays)} jours`;
  if (diffDays < 7) return `Dans ${diffDays} jours`;
  return due.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function PatientTasksSection({ careCaseId, tasksOverride }: Props) {
  const query = usePatientTasks();
  const complete = useCompletePatientTask();

  const tasks = tasksOverride ?? query.data ?? [];

  const todoTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS")
        .filter((t) =>
          careCaseId ? t.careCase?.id === careCaseId : true,
        )
        .sort((a, b) => {
          // URGENT/HIGH d'abord, puis dueDate asc, puis createdAt asc
          const prioOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 } as const;
          const p = prioOrder[a.priority] - prioOrder[b.priority];
          if (p !== 0) return p;
          if (a.dueDate && b.dueDate)
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          if (a.dueDate) return -1;
          if (b.dueDate) return 1;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }),
    [tasks, careCaseId],
  );

  if (!tasksOverride && query.isLoading) {
    return (
      <section
        aria-label="Mes tâches"
        style={{
          marginTop: 32,
          marginBottom: 32,
          padding: "16px 20px",
          borderRadius: 16,
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(26,26,46,0.06)",
        }}
      >
        <p
          role="status"
          aria-live="polite"
          style={{ color: "#6B7280", fontSize: 13, margin: 0 }}
        >
          Chargement de vos tâches…
        </p>
      </section>
    );
  }

  if (todoTasks.length === 0) {
    // Pas de bruit visuel si rien à faire — on n'affiche rien.
    return null;
  }

  return (
    <section
      aria-label="Mes tâches"
      style={{
        marginTop: 32,
        marginBottom: 32,
        padding: "20px 20px 16px",
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(26,26,46,0.06)",
        boxShadow: "0 1px 2px rgba(26,26,46,0.04)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            color: "#1A1A2E",
            letterSpacing: -0.2,
          }}
        >
          Mes tâches
        </h2>
        <span
          style={{
            fontSize: 12,
            color: "#6B7280",
            fontWeight: 500,
          }}
        >
          {todoTasks.length} à faire
        </span>
      </header>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {todoTasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onComplete={() => {
              if (!task.careCase?.id) return;
              complete.mutate({
                careCaseId: task.careCase.id,
                taskId: task.id,
              });
            }}
            isCompleting={
              complete.isPending && complete.variables?.taskId === task.id
            }
          />
        ))}
      </ul>
    </section>
  );
}

interface RowProps {
  task: PatientTask;
  onComplete: () => void;
  isCompleting: boolean;
}

function TaskRow({ task, onComplete, isCompleting }: RowProps) {
  const dueLabel = formatDueDate(task.dueDate);
  const priorityColor = PRIORITY_COLOR[task.priority];
  const canComplete = !!task.careCase?.id;

  return (
    <li
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "10px 12px",
        borderRadius: 10,
        backgroundColor: "#FAFAF8",
        border: "1px solid rgba(26,26,46,0.04)",
      }}
    >
      <button
        type="button"
        onClick={onComplete}
        disabled={!canComplete || isCompleting}
        aria-label={`Marquer "${task.title}" comme fait`}
        style={{
          flexShrink: 0,
          width: 22,
          height: 22,
          borderRadius: 11,
          border: `2px solid ${priorityColor}`,
          backgroundColor: "transparent",
          cursor: canComplete && !isCompleting ? "pointer" : "not-allowed",
          padding: 0,
          marginTop: 2,
          opacity: isCompleting ? 0.5 : 1,
          transition: "background-color 120ms ease",
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#1A1A2E",
              lineHeight: 1.35,
            }}
          >
            {task.title}
          </span>
          {task.priority === "URGENT" || task.priority === "HIGH" ? (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.4,
                color: priorityColor,
                padding: "2px 6px",
                borderRadius: 4,
                backgroundColor: `${priorityColor}14`,
              }}
            >
              {PRIORITY_LABEL[task.priority]}
            </span>
          ) : null}
        </div>
        {task.description ? (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              color: "#374151",
              lineHeight: 1.4,
            }}
          >
            {task.description}
          </p>
        ) : null}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 6,
            fontSize: 12,
            color: "#6B7280",
            flexWrap: "wrap",
          }}
        >
          {dueLabel ? <span>📅 {dueLabel}</span> : null}
          {task.careCase?.caseTitle ? (
            <span>{task.careCase.caseTitle}</span>
          ) : null}
        </div>
      </div>
    </li>
  );
}
