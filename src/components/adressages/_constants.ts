/**
 * Mappings UI pour la refonte /adressages — Liquid Glass × Nami v1.0.
 *
 * Règle d'or : SOLID obligatoire (jamais glass) pour priorité / statut /
 * consentement (donnée clinique sacrée, MDR + AI Act Art. 50).
 *
 * Les 12 statuts conservent chacun leur label distinct. La catégorie
 * (active/pending/terminal) sert UNIQUEMENT à la couleur de fond et au
 * tri visuel — elle ne masque jamais le statut réel.
 */

import type { ReferralStatus, ReferralPriority } from "@/lib/api";

// ─── 12 statuts distincts → label affiché ────────────────────────────────────

export const STATUS_LABEL: Record<ReferralStatus, string> = {
  DRAFT: "Brouillon — pas encore envoyé",
  SENT: "Envoyé",
  RECEIVED: "Reçu",
  UNDER_REVIEW: "En cours d'analyse",
  ACCEPTED: "Accepté",
  DECLINED: "Refusé",
  PATIENT_CONTACTED: "Patient contacté",
  APPOINTMENT_INVITED: "RDV proposé",
  APPOINTMENT_BOOKED: "RDV programmé",
  FIRST_VISIT_COMPLETED: "Première visite faite",
  EXPIRED: "Expiré",
  CANCELLED: "Annulé",
};

// ─── Catégorie visuelle (couleur fond + tri, jamais masquage statut) ─────────

export type StatusCategory = "active" | "pending" | "terminal";

export const STATUS_CATEGORY: Record<ReferralStatus, StatusCategory> = {
  DRAFT: "pending",
  SENT: "pending",
  RECEIVED: "pending",
  UNDER_REVIEW: "pending",
  ACCEPTED: "active",
  PATIENT_CONTACTED: "active",
  APPOINTMENT_INVITED: "active",
  APPOINTMENT_BOOKED: "active",
  DECLINED: "terminal",
  CANCELLED: "terminal",
  EXPIRED: "terminal",
  FIRST_VISIT_COMPLETED: "terminal",
};

// ─── Tab "Terminés" splitté en aboutis / non aboutis ─────────────────────────

export type TerminalOutcome = "aboutis" | "non_aboutis" | null;

export const TERMINAL_OUTCOME: Record<ReferralStatus, TerminalOutcome> = {
  DRAFT: null,
  SENT: null,
  RECEIVED: null,
  UNDER_REVIEW: null,
  ACCEPTED: null,
  PATIENT_CONTACTED: null,
  APPOINTMENT_INVITED: null,
  APPOINTMENT_BOOKED: null,
  FIRST_VISIT_COMPLETED: "aboutis",
  DECLINED: "non_aboutis",
  EXPIRED: "non_aboutis",
  CANCELLED: "non_aboutis",
};

// ─── 3 priorités → couleurs SOLID sacrées (cohérence MDR) ────────────────────

export interface PriorityMeta {
  label: string;
  bgClass: string;
  textClass: string;
  ringClass: string;
}

export const PRIORITY_META: Record<ReferralPriority, PriorityMeta> = {
  EMERGENCY: {
    label: "Urgence",
    bgClass: "bg-[#FCE9E9]",
    textClass: "text-[#D14545]",
    ringClass: "ring-1 ring-[#D14545]/20",
  },
  URGENT: {
    label: "Urgent",
    bgClass: "bg-[#FBEEE7]",
    textClass: "text-[#E07B5C]",
    ringClass: "ring-1 ring-[#E07B5C]/20",
  },
  ROUTINE: {
    label: "Routine",
    bgClass: "bg-[#EFEDF8]",
    textClass: "text-[#5B4EC4]",
    ringClass: "ring-1 ring-[#5B4EC4]/20",
  },
};

// ─── Catégories statut → couleur fond SOLID ──────────────────────────────────

export interface CategoryMeta {
  bgClass: string;
  textClass: string;
  ringClass: string;
}

export const CATEGORY_META: Record<StatusCategory, CategoryMeta> = {
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

// ─── Tri par priorité ────────────────────────────────────────────────────────

export const PRIORITY_ORDER: Record<ReferralPriority, number> = {
  EMERGENCY: 0,
  URGENT: 1,
  ROUTINE: 2,
};

// ─── Filtres chips de la barre filtres ──────────────────────────────────────

export type FilterValue = "all" | "todo" | "in_progress" | "done";

export const FILTER_OPTIONS: Array<{ value: FilterValue; label: string }> = [
  { value: "all", label: "Tous" },
  { value: "todo", label: "À traiter" },
  { value: "in_progress", label: "En cours" },
  { value: "done", label: "Terminés" },
];
