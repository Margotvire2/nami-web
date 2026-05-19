/**
 * Helpers pour AppointmentStatus — F-AGENDA-STATUS-UNION-EXTEND.
 *
 * Centralise la logique des "familles de statuts" pour éviter les checks
 * runtime éparpillés et les oublis quand de nouveaux statuts sont ajoutés
 * (cf. F3 G4 partie 1/2 PR #25 nami qui a ajouté 6 statuts au cycle de vie :
 * RESCHEDULED, IN_PROGRESS, CANCELLED_BY_PATIENT, CANCELLED_BY_PROVIDER,
 * CANCELLED_BY_SECRETARY, CANCELLED_BY_SYSTEM).
 *
 * Mirror de l'enum backend `public.AppointmentStatus` Prisma.
 */

export type AppointmentStatusCore =
  | "PENDING"
  | "CONFIRMED"
  | "RESCHEDULED"
  | "IN_PROGRESS"
  | "PATIENT_ARRIVED"
  | "COMPLETED"
  | "CANCELLED" // legacy, conservé pour backward compat
  | "CANCELLED_BY_PATIENT"
  | "CANCELLED_BY_PROVIDER"
  | "CANCELLED_BY_SECRETARY"
  | "CANCELLED_BY_SYSTEM"
  | "NO_SHOW";

/**
 * Retourne true si le RDV est annulé (toutes variantes).
 * Couvre le CANCELLED legacy + les 4 CANCELLED_BY_* F-G4.
 */
export function isCancelledLike(status: string): boolean {
  return (
    status === "CANCELLED" ||
    status === "CANCELLED_BY_PATIENT" ||
    status === "CANCELLED_BY_PROVIDER" ||
    status === "CANCELLED_BY_SECRETARY" ||
    status === "CANCELLED_BY_SYSTEM"
  );
}

/**
 * Retourne true si le RDV est "actif" (peut encore évoluer).
 * Inverse de isFinalStatus.
 */
export function isActiveStatus(status: string): boolean {
  return (
    status === "PENDING" ||
    status === "CONFIRMED" ||
    status === "PATIENT_ARRIVED" ||
    status === "IN_PROGRESS"
  );
}

/**
 * Retourne true si le RDV est dans un état terminal (cycle de vie fini).
 * RESCHEDULED inclus car l'ancien RDV reste fixe et le nouveau est créé séparément
 * via Appointment.rescheduledFromId.
 */
export function isFinalStatus(status: string): boolean {
  return (
    status === "COMPLETED" ||
    isCancelledLike(status) ||
    status === "NO_SHOW" ||
    status === "RESCHEDULED"
  );
}
