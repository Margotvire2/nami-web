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
 * Alias canonique aligné sur le nom de l'enum backend Prisma.
 * Préfère ce nom pour les nouveaux call-sites.
 */
export type AppointmentStatus = AppointmentStatusCore;

/**
 * Statuts "annulés" toutes variantes confondues (legacy + F-G4).
 * À utiliser pour filtrer les RDV upcoming / actifs côté UI.
 */
export const CANCELLED_LIKE_STATUSES: AppointmentStatus[] = [
  "CANCELLED",
  "CANCELLED_BY_PATIENT",
  "CANCELLED_BY_PROVIDER",
  "CANCELLED_BY_SECRETARY",
  "CANCELLED_BY_SYSTEM",
];

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

/**
 * STATUS_CFG — Configuration visuelle pour les 12 statuts F-G4.
 * Pattern aligné sur AdressageStepper (12 ReferralStatus).
 *
 * - label : libellé patient-friendly affiché dans le badge
 * - badgeClass : classes Tailwind pour le badge (bg + text + border)
 * - dotColor : classe Tailwind pour la pastille colorée
 * - isPast : true si RDV terminé (impacte tri / section "Passés")
 * - canCancel : true si le patient peut annuler depuis l'UI
 *
 * Introduit par PR Espace Patient frontend (démo Région IDF 28 mai 2026).
 */
export const STATUS_CFG: Record<
  AppointmentStatus,
  {
    label: string;
    badgeClass: string;
    dotColor: string;
    isPast: boolean;
    canCancel: boolean;
  }
> = {
  PENDING: {
    label: "À confirmer",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-400",
    isPast: false,
    canCancel: true,
  },
  CONFIRMED: {
    label: "Confirmé",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-500",
    isPast: false,
    canCancel: true,
  },
  PATIENT_ARRIVED: {
    label: "Patient arrivé",
    badgeClass: "bg-violet-50 text-violet-700 border-violet-200",
    dotColor: "bg-violet-500",
    isPast: false,
    canCancel: false,
  },
  IN_PROGRESS: {
    label: "En cours",
    badgeClass: "bg-violet-100 text-violet-800 border-violet-300",
    dotColor: "bg-violet-600 animate-pulse",
    isPast: false,
    canCancel: false,
  },
  COMPLETED: {
    label: "Terminé",
    badgeClass: "bg-slate-50 text-slate-600 border-slate-200",
    dotColor: "bg-slate-400",
    isPast: true,
    canCancel: false,
  },
  RESCHEDULED: {
    label: "Reporté",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    dotColor: "bg-blue-400",
    isPast: true,
    canCancel: false,
  },
  NO_SHOW: {
    label: "Non honoré",
    badgeClass: "bg-slate-50 text-slate-500 border-slate-200",
    dotColor: "bg-slate-300",
    isPast: true,
    canCancel: false,
  },
  CANCELLED: {
    label: "Annulé",
    badgeClass: "bg-stone-50 text-stone-600 border-stone-200",
    dotColor: "bg-stone-400",
    isPast: true,
    canCancel: false,
  },
  CANCELLED_BY_PATIENT: {
    label: "Annulé par vous",
    badgeClass: "bg-stone-50 text-stone-600 border-stone-200",
    dotColor: "bg-stone-400",
    isPast: true,
    canCancel: false,
  },
  CANCELLED_BY_PROVIDER: {
    label: "Annulé par le soignant",
    badgeClass: "bg-stone-50 text-stone-600 border-stone-200",
    dotColor: "bg-stone-400",
    isPast: true,
    canCancel: false,
  },
  CANCELLED_BY_SECRETARY: {
    label: "Annulé par le secrétariat",
    badgeClass: "bg-stone-50 text-stone-600 border-stone-200",
    dotColor: "bg-stone-400",
    isPast: true,
    canCancel: false,
  },
  CANCELLED_BY_SYSTEM: {
    label: "Annulé automatiquement",
    badgeClass: "bg-stone-50 text-stone-600 border-stone-200",
    dotColor: "bg-stone-400",
    isPast: true,
    canCancel: false,
  },
};

/**
 * Tabs UI possibles sur la page /rendez-vous V2.
 *
 * 'pending' est réservé aux AppointmentRequest (statuts SUBMITTED/PROPOSED côté
 * backend) qui ne sont pas confondus avec les Appointment confirmés. La V2.1
 * affiche un EmptyState statique pour ce tab (lien vers /rendez-vous/demandes)
 * tant que le endpoint GET /patient/appointment-requests n'est pas câblé ici.
 */
export type AppointmentTab = "upcoming" | "pending" | "past" | "cancelled";

/**
 * Classe un Appointment dans le tab UI correspondant.
 *
 * Règles :
 * - CANCELLED + CANCELLED_BY_* (5 variantes) + NO_SHOW → "cancelled"
 * - statuts STATUS_CFG.isPast === true (COMPLETED, RESCHEDULED) → "past"
 * - sinon → "upcoming"
 *
 * Le tab "pending" n'est jamais retourné ici car il concerne uniquement les
 * AppointmentRequest, pas les Appointment.
 */
export function computeTab(
  appt: { status: string },
): Exclude<AppointmentTab, "pending"> {
  if (isCancelledLike(appt.status) || appt.status === "NO_SHOW") {
    return "cancelled";
  }
  const cfg = STATUS_CFG[appt.status as AppointmentStatus];
  return cfg?.isPast ? "past" : "upcoming";
}
