/**
 * Registre central des adressages Nami.
 * Source de vérité unique pour labels, couleurs, actions possibles par statut.
 */

import type { ReferralStatus, ReferralPriority } from "../api";

// ─── Statut → metadata ──────────────────────────────────────────────────────

export interface ReferralStatusMeta {
  label: string;
  color: string;
  badgeClass: string;
  /** Indique si c'est un statut "en cours" (pas terminé) */
  isActive: boolean;
  /** Indique un blocage potentiel */
  isBlocked: boolean;
  /** Ordre pour le tri visuel */
  order: number;
}

export const REFERRAL_STATUS: Record<ReferralStatus, ReferralStatusMeta> = {
  DRAFT:                  { label: "Brouillon",           color: "slate",   badgeClass: "bg-muted text-muted-foreground border-border",                                          isActive: true,  isBlocked: false, order: 0 },
  SENT:                   { label: "Envoyé",              color: "blue",    badgeClass: "bg-severity-info-bg text-severity-info-foreground border-severity-info-border",          isActive: true,  isBlocked: false, order: 1 },
  RECEIVED:               { label: "Reçu",                color: "blue",    badgeClass: "bg-severity-info-bg text-severity-info-foreground border-severity-info-border",          isActive: true,  isBlocked: false, order: 2 },
  UNDER_REVIEW:           { label: "En cours d'examen",   color: "amber",   badgeClass: "bg-severity-warning-bg text-severity-warning-foreground border-severity-warning-border", isActive: true,  isBlocked: false, order: 3 },
  ACCEPTED:               { label: "Accepté",             color: "green",   badgeClass: "bg-severity-success-bg text-severity-success-foreground border-severity-success-border", isActive: true,  isBlocked: false, order: 4 },
  DECLINED:               { label: "Refusé",              color: "red",     badgeClass: "bg-severity-critical-bg text-severity-critical-foreground border-severity-critical-border", isActive: false, isBlocked: true,  order: 10 },
  PATIENT_CONTACTED:      { label: "Patient contacté",    color: "emerald", badgeClass: "bg-severity-success-bg text-severity-success-foreground border-severity-success-border", isActive: true,  isBlocked: false, order: 5 },
  APPOINTMENT_INVITED:    { label: "RDV proposé",         color: "emerald", badgeClass: "bg-severity-success-bg text-severity-success-foreground border-severity-success-border", isActive: true,  isBlocked: false, order: 6 },
  APPOINTMENT_BOOKED:     { label: "RDV pris",            color: "emerald", badgeClass: "bg-severity-success-bg text-severity-success-foreground border-severity-success-border", isActive: true,  isBlocked: false, order: 7 },
  FIRST_VISIT_COMPLETED:  { label: "1re consultation OK", color: "green",   badgeClass: "bg-severity-success-bg text-severity-success-foreground border-severity-success-border", isActive: false, isBlocked: false, order: 8 },
  EXPIRED:                { label: "Expiré",              color: "red",     badgeClass: "bg-severity-high-bg text-severity-high-foreground border-severity-high-border",          isActive: false, isBlocked: true,  order: 11 },
  CANCELLED:              { label: "Annulé",              color: "slate",   badgeClass: "bg-muted text-muted-foreground border-border",                                          isActive: false, isBlocked: false, order: 12 },
};

// ─── Priorité → metadata ────────────────────────────────────────────────────

export interface ReferralPriorityMeta {
  label: string;
  badgeClass: string;
}

export const REFERRAL_PRIORITY: Record<ReferralPriority, ReferralPriorityMeta> = {
  ROUTINE:   { label: "Routine",   badgeClass: "bg-muted text-muted-foreground" },
  URGENT:    { label: "Urgent",    badgeClass: "bg-severity-high-bg text-severity-high-foreground border-severity-high-border" },
  EMERGENCY: { label: "Urgence",   badgeClass: "bg-severity-critical-bg text-severity-critical-foreground border-severity-critical-border" },
};

// ─── Actions possibles par statut (côté envoyeur) ────────────────────────────

export type ReferralAction =
  | "cancel"
  | "patient_contacted"
  | "appointment_invited"
  | "appointment_booked"
  | "first_visit_completed";

export function getSenderActions(status: ReferralStatus): { action: ReferralAction; label: string; targetStatus: string }[] {
  switch (status) {
    case "ACCEPTED":
      return [
        { action: "patient_contacted", label: "Patient contacté", targetStatus: "PATIENT_CONTACTED" },
        { action: "cancel", label: "Annuler", targetStatus: "CANCELLED" },
      ];
    case "PATIENT_CONTACTED":
      return [
        { action: "appointment_invited", label: "RDV proposé", targetStatus: "APPOINTMENT_INVITED" },
      ];
    case "APPOINTMENT_INVITED":
      return [
        { action: "appointment_booked", label: "RDV pris", targetStatus: "APPOINTMENT_BOOKED" },
      ];
    case "APPOINTMENT_BOOKED":
      return [
        { action: "first_visit_completed", label: "1re consultation faite", targetStatus: "FIRST_VISIT_COMPLETED" },
      ];
    case "SENT":
    case "RECEIVED":
    case "UNDER_REVIEW":
      return [
        { action: "cancel", label: "Annuler", targetStatus: "CANCELLED" },
      ];
    default:
      return [];
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getStatusMeta(status: ReferralStatus): ReferralStatusMeta {
  return REFERRAL_STATUS[status] ?? REFERRAL_STATUS.SENT;
}

export function getPriorityMeta(priority: ReferralPriority): ReferralPriorityMeta {
  return REFERRAL_PRIORITY[priority] ?? REFERRAL_PRIORITY.ROUTINE;
}
