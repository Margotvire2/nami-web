/**
 * Mapper Activity → TimelineEvent
 *
 * Transforme les activités brutes du backend en événements canoniques.
 * C'est ici que vivent les règles métier de classification :
 * - quel type d'événement
 * - quel niveau de sévérité
 * - visible sur la trajectoire ou pas
 * - cliniquement important ou pas
 *
 * Pour ajouter un nouveau type d'activité backend :
 * 1. Ajouter la règle de mapping dans ACTIVITY_TYPE_MAP
 * 2. Si besoin, ajouter une entrée dans le registre (registry.ts)
 * 3. C'est tout. Les vues s'adaptent automatiquement.
 */

import type { Activity } from "../api";
import type {
  TimelineEvent,
  TimelineEventType,
  TimelineSource,
  TimelineCategory,
  TimelineSeverity,
  TimelineData,
  TimelineSummary,
} from "./model";
import { getRegistryEntry } from "./registry";

// ─── Mapping activityType backend → TimelineEventType ────────────────────────

interface TypeMapping {
  type: TimelineEventType;
  source: TimelineSource;
  /** Surcharge de trajectoryVisible (sinon on prend le registre) */
  trajectoryVisible?: boolean;
  /** Surcharge de clinicallyImportant */
  clinicallyImportant?: boolean;
}

/**
 * Table de correspondance entre les activityType du backend
 * et les types canoniques de la timeline.
 *
 * Clé = activityType (majuscule, tel que renvoyé par l'API).
 */
const ACTIVITY_TYPE_MAP: Record<string, TypeMapping> = {
  // Consultations & rendez-vous
  APPOINTMENT_CREATED:     { type: "consultation",      source: "appointment" },
  APPOINTMENT_COMPLETED:   { type: "consultation",      source: "appointment" },
  APPOINTMENT_CANCELLED:   { type: "consultation",      source: "appointment", trajectoryVisible: false },

  // Notes cliniques
  NOTE_ADDED:              { type: "clinical_note",     source: "note" },

  // Documents
  DOCUMENT_UPLOADED:       { type: "document",          source: "document" },

  // Alertes
  ALERT_TRIGGERED:         { type: "alert",             source: "alert_engine" },
  PATIENT_INACTIVE:        { type: "alert",             source: "alert_engine" },

  // Tâches
  TASK_COMPLETED:          { type: "task",              source: "task", trajectoryVisible: false },

  // Adressages
  REFERRAL_CREATED:        { type: "referral_created",  source: "referral" },
  REFERRAL_ACCEPTED:       { type: "referral_accepted", source: "referral" },

  // Journal patient
  PATIENT_JOURNAL_ENTRY:   { type: "journal_entry",     source: "journal" },
  MEAL_LOGGED:             { type: "journal_entry",     source: "journal", trajectoryVisible: false },
  SYMPTOM_LOGGED:          { type: "journal_entry",     source: "journal" },
  EMOTION_LOGGED:          { type: "journal_entry",     source: "journal", trajectoryVisible: false },

  // Parcours de soin
  CARE_PLAN_UPDATED:       { type: "care_plan_update",  source: "system" },
  RISK_LEVEL_CHANGED:      { type: "risk_change",       source: "system" },
  TEAM_MEMBER_ADDED:       { type: "care_team_change",  source: "care_team" },

  // Messages
  MESSAGE_SENT:            { type: "message",           source: "message", trajectoryVisible: false },
};

// ─── Mapper unitaire ─────────────────────────────────────────────────────────

function mapActivityToEvent(activity: Activity, careCaseId: string): TimelineEvent {
  const actType = (activity.activityType ?? "").toUpperCase();

  // Résoudre le mapping
  const mapping = ACTIVITY_TYPE_MAP[actType] ?? resolveUnknownType(actType, activity.source);

  // Récupérer les defaults du registre
  const registry = getRegistryEntry(mapping.type);

  // Déterminer le statut temporel
  const now = new Date();
  const occurredDate = new Date(activity.occurredAt);
  const status = occurredDate > now ? "upcoming" as const
    : isToday(occurredDate) ? "current" as const
    : "past" as const;

  // Déterminer la sévérité
  const severity = deriveSeverity(actType, activity);

  return {
    id: activity.id,
    careCaseId,
    type: mapping.type,
    source: mapping.source,
    sourceId: activity.id,
    occurredAt: activity.occurredAt,
    title: activity.title,
    summary: activity.summary ?? undefined,
    actor: {
      id: activity.person.id,
      name: `${activity.person.firstName} ${activity.person.lastName}`,
      role: activity.person.roleType,
    },
    category: registry.category,
    clinicallyImportant: mapping.clinicallyImportant ?? registry.clinicallyImportant,
    trajectoryVisible: mapping.trajectoryVisible ?? registry.trajectoryVisible,
    severity,
    status,
  };
}

// ─── Mapper batch ────────────────────────────────────────────────────────────

export function mapActivitiesToTimeline(
  activities: Activity[],
  careCaseId: string,
  careCase: {
    startDate: string;
    riskLevel: string;
    careStage?: string | null;
    nextStepSummary?: string | null;
  },
): TimelineData {
  // Mapper toutes les activités
  const events = activities
    .map((a) => mapActivityToEvent(a, careCaseId))
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  // Construire le résumé
  const trajectoryEvents = events.filter((e) => e.trajectoryVisible);
  const lastImportant = trajectoryEvents.find((e) => e.status === "past");
  const nextPlanned = [...events]
    .reverse()
    .find((e) => e.status === "upcoming");

  // Start date = earliest between care case start and oldest event
  const earliestEvent = events.length > 0 ? events[events.length - 1].occurredAt : careCase.startDate;
  const effectiveStartDate = new Date(earliestEvent) < new Date(careCase.startDate) ? earliestEvent : careCase.startDate;

  const summary: TimelineSummary = {
    startDate: effectiveStartDate,
    currentPhase: careCase.careStage ?? undefined,
    lastImportantEvent: lastImportant,
    nextPlannedEvent: nextPlanned,
    vigilanceLevel: riskToVigilance(careCase.riskLevel),
    totalEvents: events.length,
  };

  return { events, summary };
}

// ─── Projections ─────────────────────────────────────────────────────────────

/** Événements pour la vue détail (filtrés par catégorie) */
export function filterByCategory(
  events: TimelineEvent[],
  categoryKey: string,
): TimelineEvent[] {
  if (categoryKey === "tout") return events;

  const categoryMap: Record<string, TimelineCategory[]> = {
    consultation: ["consultation"],
    note: ["note"],
    document: ["document"],
    patient: ["patient"],
    alerte: ["alert"],
    tache: ["task"],
    coordination: ["coordination"],
  };

  const categories = categoryMap[categoryKey];
  if (!categories) return events;

  return events.filter((e) => categories.includes(e.category));
}

/** Événements pour la frise trajectoire */
export function filterForTrajectory(events: TimelineEvent[]): TimelineEvent[] {
  return events.filter((e) => e.trajectoryVisible);
}

// ─── Helpers internes ────────────────────────────────────────────────────────

function resolveUnknownType(actType: string, source: string): TypeMapping {
  // Fallback heuristique pour les types non mappés
  if (actType.includes("CONSULT") || actType.includes("APPOINTMENT"))
    return { type: "consultation", source: "appointment" };
  if (actType.includes("NOTE") || actType.includes("CLINICAL"))
    return { type: "clinical_note", source: "note" };
  if (actType.includes("ALERT"))
    return { type: "alert", source: "alert_engine" };
  if (actType.includes("TASK"))
    return { type: "task", source: "task" };
  if (actType.includes("REFERRAL"))
    return { type: "referral_created", source: "referral" };
  if (actType.includes("DOCUMENT"))
    return { type: "document", source: "document" };
  if (source === "PATIENT")
    return { type: "journal_entry", source: "journal" };

  return { type: "other", source: "system" };
}

function deriveSeverity(actType: string, activity: Activity): TimelineSeverity {
  if (actType.includes("ALERT") || actType.includes("RISK_LEVEL") || actType.includes("INACTIVE"))
    return "high";
  if (actType.includes("REFERRAL") || actType.includes("CARE_PLAN") || actType.includes("TEAM_MEMBER"))
    return "medium";
  return "low";
}

function riskToVigilance(riskLevel: string): "low" | "medium" | "high" {
  if (riskLevel === "CRITICAL" || riskLevel === "HIGH") return "high";
  if (riskLevel === "MEDIUM") return "medium";
  return "low";
}

function isToday(date: Date): boolean {
  const now = new Date();
  return date.getDate() === now.getDate()
    && date.getMonth() === now.getMonth()
    && date.getFullYear() === now.getFullYear();
}
