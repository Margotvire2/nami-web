/**
 * Nami Domain Model — Source de vérité unique
 *
 * Règles :
 * - Les IDs sont des branded types (pas de string générique)
 * - Les dates sont des ISO 8601 strings
 * - Les références = ID uniquement, jamais l'objet complet
 * - Les champs optionnels sont justifiés
 * - Ce fichier ne sait pas qu'il sera affiché dans React
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. BRANDED IDS — empêchent de mélanger PatientId et PractitionerId
// ═══════════════════════════════════════════════════════════════════════════════

// IDs — type aliases for documentation. In production, use branded types.
export type PatientId = string;
export type PractitionerId = string;
export type EstablishmentId = string;
export type CarePathwayId = string;
export type CareTeamId = string;
export type AppointmentId = string;
export type ConsultationId = string;
export type ReferralId = string;
export type NoteId = string;
export type AlertId = string;
export type TaskId = string;
export type DocumentId = string;
export type ThreadId = string;
export type MessageId = string;
export type JournalEntryId = string;
export type AISummaryId = string;

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ENUMS
// ═══════════════════════════════════════════════════════════════════════════════

export type CriticalityLevel = "stable" | "surveillance" | "critique";

export type CarePathwayStatus = "active" | "paused" | "closed" | "archived";

export type CarePathwayPhase = "evaluation" | "coordination" | "stabilisation" | "suivi";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

export type AppointmentMode = "in_person" | "video" | "phone";

export type ConsultationType = "premiere" | "suivi" | "bilan" | "urgence" | "teleconsultation";

export type AlertSeverity = "info" | "warning" | "high" | "critical";

export type AlertStatus = "open" | "acknowledged" | "resolved" | "dismissed";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

export type ReferralStatus = "draft" | "sent" | "received" | "under_review" | "accepted" | "declined" | "rdv_planned" | "rdv_confirmed" | "first_consult_done" | "expired" | "cancelled";

export type ReferralMode = "direct" | "pool";

export type ReferralPriority = "routine" | "urgent" | "emergency";

export type NoteType = "consultation" | "coordination" | "summary" | "general";

export type DocumentType = "biological_report" | "prescription" | "consultation_report" | "hospital_report" | "letter" | "imaging" | "other";

export type JournalEntryType = "meal" | "emotion" | "symptom" | "note" | "physical_activity";

export type CareTeamMemberStatus = "active" | "invited" | "external" | "declined";

export type EstablishmentType = "hospital" | "clinic" | "cabinet" | "cpts" | "network";

export type PractitionerSpecialty =
  | "medecin_generaliste" | "psychiatre" | "psychologue" | "dieteticien"
  | "endocrinologue" | "pediatre" | "cardiologue" | "kinesitherapeute"
  | "infirmier" | "orthophoniste" | "autre";

// ═══════════════════════════════════════════════════════════════════════════════
// 3. ENTITÉS DE BASE
// ═══════════════════════════════════════════════════════════════════════════════

export interface Patient {
  id: PatientId;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO 8601
  email: string;
  phone: string;
  createdAt: string;
  /** Photo URL — optionnel car pas toujours disponible */
  photoUrl?: string;
}

export interface Practitioner {
  id: PractitionerId;
  firstName: string;
  lastName: string;
  specialty: PractitionerSpecialty;
  /** RPPS — optionnel car les non-médecins n'en ont pas */
  rpps?: string;
  email: string;
  phone: string;
  /** Photo URL */
  photoUrl?: string;
}

export interface Establishment {
  id: EstablishmentId;
  name: string;
  type: EstablishmentType;
  address: string;
  city: string;
  postalCode: string;
}

export interface PractitionerAffiliation {
  practitionerId: PractitionerId;
  establishmentId: EstablishmentId;
  /** Rôle dans l'établissement — optionnel car peut être juste "exerce ici" */
  role?: string;
  isActive: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. PARCOURS DE SOIN (le pivot central)
// ═══════════════════════════════════════════════════════════════════════════════

export interface CarePathway {
  id: CarePathwayId;
  patientId: PatientId;
  title: string;
  pathologyType: string; // "TCA", "Obésité", "Psychiatrie", etc.
  status: CarePathwayStatus;
  phase: CarePathwayPhase;
  criticalityLevel: CriticalityLevel;
  leadPractitionerId: PractitionerId;
  /** Motif d'entrée dans le suivi */
  entryReason: string;
  /** Qui a adressé le patient — optionnel car prise de RDV directe possible */
  referredBy?: string;
  /** Prochaine étape résumée — optionnel car pas toujours définie */
  nextStepSummary?: string;
  startDate: string;
  /** Date de clôture — null si actif */
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. ÉQUIPE DE SOIN
// ═══════════════════════════════════════════════════════════════════════════════

export interface CareTeam {
  id: CareTeamId;
  carePathwayId: CarePathwayId;
  createdAt: string;
}

export interface CareTeamMember {
  careTeamId: CareTeamId;
  practitionerId: PractitionerId;
  roleInTeam: string; // "Coordinateur", "Psychologue TCA", "Diététicienne"
  status: CareTeamMemberStatus;
  isPrimary: boolean;
  joinedAt: string;
  /** Qui a invité ce membre — optionnel pour le premier membre */
  invitedBy?: PractitionerId;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. AGENDA
// ═══════════════════════════════════════════════════════════════════════════════

export interface Appointment {
  id: AppointmentId;
  carePathwayId: CarePathwayId;
  patientId: PatientId;
  practitionerId: PractitionerId;
  /** Établissement — optionnel pour les téléconsultations */
  establishmentId?: EstablishmentId;
  type: ConsultationType;
  mode: AppointmentMode;
  status: AppointmentStatus;
  startAt: string;
  endAt: string;
  /** Motif court */
  reason: string;
  /** ID de l'adressage source — optionnel */
  referralId?: ReferralId;
  /** Notes internes du praticien — optionnel */
  internalNotes?: string;
  createdAt: string;
}

export interface Consultation {
  id: ConsultationId;
  appointmentId: AppointmentId;
  carePathwayId: CarePathwayId;
  practitionerId: PractitionerId;
  /** Observations cliniques rédigées post-consultation */
  observations: string;
  /** Décisions prises */
  decisions: string;
  /** Résumé IA court — optionnel, généré automatiquement */
  aiSummary?: string;
  completedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. ADRESSAGE
// ═══════════════════════════════════════════════════════════════════════════════

export interface Referral {
  id: ReferralId;
  carePathwayId: CarePathwayId;
  senderPractitionerId: PractitionerId;
  /** Praticien cible — optionnel en mode POOL */
  targetPractitionerId?: PractitionerId;
  mode: ReferralMode;
  status: ReferralStatus;
  priority: ReferralPriority;
  clinicalReason: string;
  /** Note d'urgence — optionnel */
  urgencyNote?: string;
  /** Spécialité recherchée — optionnel si cible directe */
  preferredSpecialty?: string;
  /** Date RDV souhaitée — optionnel */
  desiredAppointmentDate?: string;
  /** ID du RDV résultant — optionnel, créé après acceptation */
  resultingAppointmentId?: AppointmentId;
  /** Généré par IA — indique si le motif a été pré-rempli */
  aiGenerated: boolean;
  /** Note de réponse du destinataire — optionnel */
  responseNote?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. CONTENUS CLINIQUES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ClinicalNote {
  id: NoteId;
  carePathwayId: CarePathwayId;
  authorPractitionerId: PractitionerId;
  type: NoteType;
  /** Titre court — optionnel pour les notes rapides */
  title?: string;
  body: string;
  createdAt: string;
}

export interface Alert {
  id: AlertId;
  carePathwayId: CarePathwayId;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  /** Description détaillée — optionnel pour les alertes auto-générées simples */
  description?: string;
  /** Source de déclenchement (ex: "cron:detectInactivity", "manual") */
  triggerSource: string;
  createdAt: string;
  /** Date de résolution — null si ouverte */
  resolvedAt?: string;
}

export interface Task {
  id: TaskId;
  carePathwayId: CarePathwayId;
  title: string;
  /** Description détaillée — optionnel */
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  /** Assigné à — optionnel car une tâche peut ne pas être assignée */
  assigneePractitionerId?: PractitionerId;
  /** Date d'échéance — optionnel */
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

export interface MedicalDocument {
  id: DocumentId;
  carePathwayId: CarePathwayId;
  type: DocumentType;
  title: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  /** Uploadé par — le praticien qui a ajouté le document */
  uploadedByPractitionerId: PractitionerId;
  /** Résumé IA du contenu — optionnel, généré automatiquement */
  aiSummary?: string;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. COMMUNICATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface Thread {
  id: ThreadId;
  carePathwayId: CarePathwayId;
  createdAt: string;
}

export interface Message {
  id: MessageId;
  threadId: ThreadId;
  senderPractitionerId: PractitionerId;
  body: string;
  /** Message parent pour le threading — optionnel */
  parentMessageId?: MessageId;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. JOURNAL PATIENT
// ═══════════════════════════════════════════════════════════════════════════════

export interface JournalEntry {
  id: JournalEntryId;
  carePathwayId: CarePathwayId;
  patientId: PatientId;
  entryType: JournalEntryType;
  /** Payload structuré selon le type (repas, émotion, etc.) */
  payload: Record<string, unknown>;
  occurredAt: string;
  /** Partagé avec l'équipe — le patient contrôle la visibilité */
  sharedWithTeam: boolean;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 11. INTELLIGENCE ARTIFICIELLE
// ═══════════════════════════════════════════════════════════════════════════════

export interface AISummary {
  id: AISummaryId;
  carePathwayId: CarePathwayId;
  /** Le résumé structuré en sections */
  overview: string;
  recentEvolution: string;
  careTeamAssessment: string;
  keyFindings: string[];
  recommendations: string[];
  riskAssessment: string;
  /** Nombre de gaps détectés à la génération */
  gapsDetected: number;
  generatedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 12. VIEW MODELS — projections en lecture seule pour l'UI
//     Ce ne sont PAS des entités. Ce sont des agrégations pré-calculées.
// ═══════════════════════════════════════════════════════════════════════════════

/** Ce que la fiche patient consomme */
export interface PatientDashboardView {
  patient: Patient;
  carePathway: CarePathway;
  lead: { id: string; firstName: string; lastName: string; specialty: PractitionerSpecialty };
  teamMembers: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: PractitionerSpecialty;
    roleInTeam: string;
    status: CareTeamMemberStatus;
  }[];
  /** Timeline agrégée — tous les événements triés chronologiquement */
  timelineEvents: {
    id: string;
    date: string;
    type: "consultation" | "note" | "referral" | "alert" | "team_change" | "planned";
    title: string;
    practitionerName: string;
    summary: string;
    isPast: boolean;
  }[];
  activeAlerts: { id: string; severity: AlertSeverity; title: string; createdAt: string }[];
  pendingTasks: { id: string; title: string; priority: TaskPriority; dueDate?: string }[];
  nextAppointment: { id: string; startAt: string; mode: AppointmentMode; reason: string; practitionerName: string } | null;
  aiSummary: string | null;
}

/** Ce que le dashboard du praticien consomme */
export interface PractitionerDashboardView {
  todayAppointments: {
    id: string; startAt: string; endAt: string;
    type: ConsultationType; mode: AppointmentMode; status: AppointmentStatus;
    reason: string; patientName: string; patientInitials: string;
  }[];
  pendingReferrals: number;
  actionItems: {
    id: string;
    type: "referral" | "task" | "alert" | "contact";
    title: string;
    subtitle: string;
    href: string;
  }[];
  recentMessages: {
    senderName: string;
    senderInitials: string;
    message: string;
    patientTag: string;
    timeAgo: string;
  }[];
}
