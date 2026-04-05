/**
 * Sélecteurs Nami — fonctions pures qui lisent le store
 *
 * Chaque sélecteur = une question métier.
 * Ils ne stockent rien, ils projettent.
 * Testables unitairement (entrée = state du store, sortie = données).
 */

import type { Appointment, Alert, Task } from "../../domain/types";
import type { PatientDashboardView } from "../../domain/types";
import { useNamiStore } from "../index";

type StoreState = ReturnType<typeof useNamiStore.getState>;

// ═══════════════════════════════════════════════════════════════════════════════
// APPOINTMENTS
// ═══════════════════════════════════════════════════════════════════════════════

/** Tous les RDV d'un praticien pour une semaine donnée */
export function getAppointmentsForPractitionerWeek(state: StoreState, practitionerId: string, weekStart: Date): Appointment[] {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 5); // lun-ven

  return Object.values(state.appointments)
    .filter((a) => a.practitionerId === practitionerId && new Date(a.startAt) >= weekStart && new Date(a.startAt) < weekEnd)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

/** Les RDV du jour pour le dashboard */
export function getTodayAppointments(state: StoreState, practitionerId: string): Appointment[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return Object.values(state.appointments)
    .filter((a) => a.practitionerId === practitionerId && new Date(a.startAt) >= today && new Date(a.startAt) < tomorrow && a.status !== "cancelled")
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

/** Tous les RDV d'un parcours de soin */
export function getAppointmentsByCarePathway(state: StoreState, carePathwayId: string): Appointment[] {
  return Object.values(state.appointments)
    .filter((a) => a.carePathwayId === carePathwayId)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

/** Prochain RDV d'un parcours */
export function getNextAppointment(state: StoreState, carePathwayId: string): Appointment | null {
  const now = new Date();
  return Object.values(state.appointments)
    .filter((a) => a.carePathwayId === carePathwayId && new Date(a.startAt) > now && a.status !== "cancelled")
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0] ?? null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ALERTS & TASKS
// ═══════════════════════════════════════════════════════════════════════════════

/** Alertes actives d'un parcours */
export function getActiveAlerts(state: StoreState, carePathwayId: string): Alert[] {
  return Object.values(state.alerts)
    .filter((a) => a.carePathwayId === carePathwayId && a.status === "open")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** Tâches en attente d'un parcours (contexte polymorphe) */
export function getPendingTasks(state: StoreState, carePathwayId: string): Task[] {
  return Object.values(state.tasks)
    .filter((t) => {
      const cpId = t.context.type === "standalone" ? null : t.context.carePathwayId;
      return cpId === carePathwayId && (t.status === "pending" || t.status === "in_progress");
    })
    .sort((a, b) => {
      const prio: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
      return (prio[a.priority] ?? 9) - (prio[b.priority] ?? 9);
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARE PATHWAY DASHBOARD (vue agrégée pour la fiche patient)
// ═══════════════════════════════════════════════════════════════════════════════

/** Vue complète d'un parcours — tout ce dont la fiche patient a besoin */
export function getCarePathwayDashboard(state: StoreState, carePathwayId: string): PatientDashboardView | null {
  const pathway = state.carePathways[carePathwayId];
  if (!pathway) return null;

  const patient = state.patients[pathway.patientId];
  if (!patient) return null;

  const lead = state.practitioners[pathway.leadPractitionerId];

  // Équipe
  const team = Object.values(state.careTeams).find((t) => t.carePathwayId === carePathwayId);
  const members = team
    ? state.careTeamMembers
        .filter((m) => m.careTeamId === team.id)
        .map((m) => {
          const p = state.practitioners[m.practitionerId];
          return {
            id: m.practitionerId,
            firstName: p?.firstName ?? "",
            lastName: p?.lastName ?? "",
            specialty: p?.specialty ?? "autre",
            roleInTeam: m.roleInTeam,
            status: m.status,
          };
        })
    : [];

  // Timeline events depuis les RDV
  const apts = getAppointmentsByCarePathway(state, carePathwayId);
  const timelineEvents = apts.map((a) => {
    const prac = state.practitioners[a.practitionerId];
    const isPast = new Date(a.startAt) < new Date();
    return {
      id: a.id,
      date: a.startAt,
      type: isPast ? ("consultation" as const) : ("planned" as const),
      title: isPast ? a.type === "premiere" ? "1ère consultation" : "Consultation" : "RDV planifié",
      practitionerName: prac ? `${prac.firstName[0]}. ${prac.lastName}` : "Inconnu",
      summary: a.reason,
      isPast,
    };
  });

  // Alertes + tâches
  const activeAlerts = getActiveAlerts(state, carePathwayId).map((a) => ({
    id: a.id, severity: a.severity, title: a.title, createdAt: a.createdAt,
  }));

  const pendingTasks = getPendingTasks(state, carePathwayId).map((t) => ({
    id: t.id, title: t.title, priority: t.priority, dueDate: t.dueDate,
  }));

  // Prochain RDV
  const nextApt = getNextAppointment(state, carePathwayId);
  const nextAppointment = nextApt ? {
    id: nextApt.id,
    startAt: nextApt.startAt,
    mode: nextApt.mode,
    reason: nextApt.reason,
    practitionerName: (() => { const p = state.practitioners[nextApt.practitionerId]; return p ? `Dr ${p.lastName}` : ""; })(),
  } : null;

  // AI Summary
  const aiSummary = Object.values(state.aiSummaries).find((s) => s.carePathwayId === carePathwayId)?.overview ?? null;

  return {
    patient,
    carePathway: pathway,
    lead: lead ? { id: lead.id, firstName: lead.firstName, lastName: lead.lastName, specialty: lead.specialty } : { id: "", firstName: "", lastName: "", specialty: "autre" },
    teamMembers: members,
    timelineEvents,
    activeAlerts,
    pendingTasks,
    nextAppointment,
    aiSummary,
  };
}
