/**
 * Modèle canonique d'événement timeline Nami.
 *
 * Toute source métier (consultation, note, alerte, adressage, tâche,
 * journal patient, équipe, document, message) est projetée dans ce
 * format unique. La page timeline ne consomme QUE ce modèle.
 */

// ─── Types source ────────────────────────────────────────────────────────────

export type TimelineCategory =
  | "consultation"
  | "note"
  | "document"
  | "patient"
  | "alert"
  | "task"
  | "coordination";

export type TimelineEventType =
  | "consultation"
  | "clinical_note"
  | "document"
  | "alert"
  | "task"
  | "referral_created"
  | "referral_accepted"
  | "journal_entry"
  | "care_team_change"
  | "risk_change"
  | "care_plan_update"
  | "message"
  | "milestone"
  | "phase_change"
  | "other";

export type TimelineSource =
  | "appointment"
  | "note"
  | "document"
  | "alert_engine"
  | "task"
  | "referral"
  | "journal"
  | "care_team"
  | "message"
  | "system";

export type TimelineSeverity = "info" | "low" | "medium" | "high" | "critical";
export type TimelineStatus = "past" | "current" | "upcoming";

// ─── Modèle canonique ────────────────────────────────────────────────────────

export interface TimelineEvent {
  /** Identifiant unique (= id de l'activité source) */
  id: string;
  careCaseId: string;

  /** Type canonique normalisé */
  type: TimelineEventType;
  /** Source métier d'origine */
  source: TimelineSource;
  /** ID de l'objet source (activity id) */
  sourceId: string;

  /** Date à laquelle l'événement s'est produit */
  occurredAt: string;

  /** Titre court lisible */
  title: string;
  /** Résumé clinique (optionnel) */
  summary?: string;

  /** Acteur de l'événement */
  actor?: {
    id: string;
    name: string;
    role?: string;
  };

  /** Catégorie UI (pour filtres) */
  category: TimelineCategory;

  /** Visible en vue détail (quasi toujours true) */
  clinicallyImportant: boolean;
  /** Visible sur la frise trajectoire */
  trajectoryVisible: boolean;

  /** Sévérité / impact clinique */
  severity: TimelineSeverity;
  /** Position temporelle relative à aujourd'hui */
  status: TimelineStatus;

  /** Données métier complémentaires */
  metadata?: Record<string, unknown>;
}

// ─── Réponse timeline enrichie ───────────────────────────────────────────────

export interface TimelineSummary {
  startDate: string;
  currentPhase?: string;
  lastImportantEvent?: TimelineEvent;
  nextPlannedEvent?: TimelineEvent;
  vigilanceLevel: "low" | "medium" | "high";
  totalEvents: number;
}

export interface TimelineData {
  events: TimelineEvent[];
  summary: TimelineSummary;
}
