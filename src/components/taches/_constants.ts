/**
 * Mappings UI pour la refonte /taches — Liquid Glass × Nami v1.0.
 *
 * Règle d'or : SOLID obligatoire pour priorité/statut (donnée clinique sacrée).
 * Le glass est réservé à l'ambiance (cards, filter bar, sheet, modal).
 *
 * Source de vérité backend (Prisma) :
 * - TaskStatus  : PENDING | IN_PROGRESS | COMPLETED | CANCELLED
 * - Priority    : LOW | MEDIUM | HIGH | URGENT  (côté Prisma)
 * - TaskType    : 13 valeurs (non exposées ici, hors scope V2.1)
 */

type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// ─── 4 statuts distincts → label affiché ─────────────────────────────────────

export const STATUS_LABEL: Record<TaskStatus, string> = {
  PENDING: "À faire",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

// ─── Catégorie visuelle (fond + tri) ─────────────────────────────────────────

export type StatusCategory = "active" | "pending" | "terminal";

export const STATUS_CATEGORY: Record<TaskStatus, StatusCategory> = {
  PENDING: "pending",
  IN_PROGRESS: "active",
  COMPLETED: "terminal",
  CANCELLED: "terminal",
};

export const CATEGORY_META: Record<
  StatusCategory,
  { bgClass: string; textClass: string; ringClass: string }
> = {
  active: {
    bgClass: "bg-[#E6F4F1]",
    textClass: "text-[#1a8a7e]",
    ringClass: "ring-1 ring-[#1a8a7e]/20",
  },
  pending: {
    bgClass: "bg-[#FBF1DD]",
    textClass: "text-[#B07820]",
    ringClass: "ring-1 ring-[#B07820]/20",
  },
  terminal: {
    bgClass: "bg-[#F3F4F6]",
    textClass: "text-[#6B7280]",
    ringClass: "ring-1 ring-[#6B7280]/20",
  },
};

// ─── 4 priorités → label + couleur SOLID ─────────────────────────────────────
//
// URGENT  : rouge avec pulse-dot (équivalent EMERGENCY du pattern adressages)
// HIGH    : orange (urgence soutenue)
// MEDIUM  : violet Nami (routine)
// LOW     : gris (informatif)

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  URGENT: "Urgent",
  HIGH: "Haute",
  MEDIUM: "Moyenne",
  LOW: "Basse",
};

export const PRIORITY_META: Record<
  TaskPriority,
  { bgClass: string; textClass: string; ringClass: string; withDot: boolean }
> = {
  URGENT: {
    bgClass: "bg-[#FCE9E9]",
    textClass: "text-[#D14545]",
    ringClass: "ring-1 ring-[#D14545]/20",
    withDot: true,
  },
  HIGH: {
    bgClass: "bg-[#FBEEE7]",
    textClass: "text-[#E07B5C]",
    ringClass: "ring-1 ring-[#E07B5C]/20",
    withDot: false,
  },
  MEDIUM: {
    bgClass: "bg-[#EFEDF8]",
    textClass: "text-[#5B4EC4]",
    ringClass: "ring-1 ring-[#5B4EC4]/20",
    withDot: false,
  },
  LOW: {
    bgClass: "bg-[#F3F4F6]",
    textClass: "text-[#6B7280]",
    ringClass: "ring-1 ring-[#6B7280]/20",
    withDot: false,
  },
};

// Tri priorité (URGENT en haut)
export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

// ─── Filtres "Tous / Mes tâches / Mes équipes" (Q7) ──────────────────────────
//
// `all`  = pas de filtre (toutes les tâches accessibles via /tasks/mine)
// `mine` = filtrées client-side sur assignedTo.id === me.personId
// `team` = !mine (assignées à un autre membre de l'équipe ou non assignées)

export type TaskFilterValue = "all" | "mine" | "team";

export const TASK_FILTERS: Array<{ value: TaskFilterValue; label: string }> = [
  { value: "all", label: "Toutes" },
  { value: "mine", label: "Mes tâches" },
  { value: "team", label: "Mes équipes" },
];
