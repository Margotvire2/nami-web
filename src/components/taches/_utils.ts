/**
 * Helpers locaux refonte /taches — calcul des périodes temporelles
 * (overdue / today / upcoming / completed) + filtres + formatages FR.
 *
 * Aucun import depuis api.ts au-delà du type `TaskWithContext` (lecture seule).
 */

import type { TaskWithContext } from "@/lib/api";

export type TaskPeriod = "overdue" | "today" | "upcoming" | "completed";

/** Tâche en retard : dueDate passée et status PENDING ou IN_PROGRESS. */
export function isOverdue(task: TaskWithContext): boolean {
  if (!task.dueDate) return false;
  if (task.status === "COMPLETED" || task.status === "CANCELLED") return false;
  const due = new Date(task.dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due.getTime() < now.getTime();
}

/** Tâche due aujourd'hui (jour calendaire local). */
export function isToday(task: TaskWithContext): boolean {
  if (!task.dueDate) return false;
  const due = new Date(task.dueDate);
  const now = new Date();
  return (
    due.getFullYear() === now.getFullYear() &&
    due.getMonth() === now.getMonth() &&
    due.getDate() === now.getDate()
  );
}

/** Tâche due entre demain et dimanche prochain (cette semaine, hors today). */
export function isThisWeek(task: TaskWithContext): boolean {
  if (!task.dueDate) return false;
  if (isToday(task) || isOverdue(task)) return false;
  const due = new Date(task.dueDate);
  const now = new Date();
  const endOfWeek = new Date(now);
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  endOfWeek.setDate(now.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);
  return due.getTime() > now.getTime() && due.getTime() <= endOfWeek.getTime();
}

export function getTaskPeriod(task: TaskWithContext): TaskPeriod {
  if (task.status === "COMPLETED" || task.status === "CANCELLED")
    return "completed";
  if (isOverdue(task)) return "overdue";
  if (isToday(task)) return "today";
  return "upcoming";
}

export function groupTasksByPeriod(
  tasks: TaskWithContext[],
): Record<TaskPeriod, TaskWithContext[]> {
  const groups: Record<TaskPeriod, TaskWithContext[]> = {
    overdue: [],
    today: [],
    upcoming: [],
    completed: [],
  };
  for (const task of tasks) {
    groups[getTaskPeriod(task)].push(task);
  }
  return groups;
}

/** Nom patient sous forme "Prénom Nom" (cohérence MDR / accessibilité). */
export function patientLabel(task: TaskWithContext): string {
  const p = task.careCase?.patient;
  if (!p) return "";
  return `${p.firstName} ${p.lastName}`.trim();
}

/** Date relative FR ("aujourd'hui", "demain", "il y a 3 jours", "12 nov."). */
export function relativeDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return "demain";
  if (diffDays === -1) return "hier";
  if (diffDays > 1 && diffDays <= 7) return `dans ${diffDays} jours`;
  if (diffDays < -1 && diffDays >= -7) return `il y a ${Math.abs(diffDays)} jours`;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

/** Date complète FR ("12 novembre 2026"). */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Filtre "Mes tâches" : assignée explicitement à `me`.
 * Filtre "Mes équipes" : pas assignée à `me` (autre membre ou personne).
 */
export function applyOwnershipFilter(
  tasks: TaskWithContext[],
  filter: "all" | "mine" | "team",
  myPersonId: string | undefined,
): TaskWithContext[] {
  if (filter === "all" || !myPersonId) return tasks;
  if (filter === "mine") {
    return tasks.filter((t) => t.assignedTo?.id === myPersonId);
  }
  // team
  return tasks.filter((t) => t.assignedTo?.id !== myPersonId);
}

/**
 * Annotation MDR du soft-cancel : suffixe ajouté à la description quand la
 * tâche est CANCELLED (le modèle Prisma Task n'a pas de champ `cancelReason`,
 * et la matrice de gel V2.1 interdit toute migration backend).
 *
 * Pattern : "<description existante>\n\n[Annulée le 13/05/2026 — <motif>]"
 *
 * Trade-off documenté dans le commit body. Pour V2.2+, prévoir un champ dédié
 * `cancelReason String?` + audit log entry.
 */
export function buildCancelDescription(
  currentDescription: string | null,
  reason: string,
): string {
  const stamp = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const suffix = `[Annulée le ${stamp} — ${reason.trim()}]`;
  if (!currentDescription || currentDescription.trim().length === 0) {
    return suffix;
  }
  return `${currentDescription.trim()}\n\n${suffix}`;
}
