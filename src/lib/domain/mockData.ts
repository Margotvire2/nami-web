/**
 * Nami Mock Database — données cohérentes qui respectent le modèle de domaine
 *
 * Tous les IDs se correspondent entre les entités.
 * Exporté comme un objet unique `mockDB` indexé par type d'entité.
 * Les view models sont pré-calculés en bas du fichier.
 */

import type {
  Patient, Practitioner, Establishment, PractitionerAffiliation,
  CarePathway, CareTeam, CareTeamMember,
  Appointment, Consultation, Referral,
  ClinicalNote, Alert, Task, MedicalDocument,
  Thread, Message, JournalEntry, AISummary,
  PatientId, PractitionerId, EstablishmentId, CarePathwayId,
  CareTeamId, AppointmentId, ConsultationId, ReferralId,
  NoteId, AlertId, TaskId, DocumentId, ThreadId, MessageId,
  JournalEntryId, AISummaryId,
  PatientDashboardView, PractitionerDashboardView,
} from "./types";

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER — cast string to branded ID
// ═══════════════════════════════════════════════════════════════════════════════

function id<T extends string>(value: string): T { return value as T; }

// ═══════════════════════════════════════════════════════════════════════════════
// 1. ÉTABLISSEMENTS
// ═══════════════════════════════════════════════════════════════════════════════

const establishments: Record<string, Establishment> = {
  "est-1": {
    id: id<EstablishmentId>("est-1"),
    name: "Cabinet Paris 11e",
    type: "cabinet",
    address: "42 rue de la Roquette",
    city: "Paris",
    postalCode: "75011",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. PRATICIENS
// ═══════════════════════════════════════════════════════════════════════════════

const practitioners: Record<string, Practitioner> = {
  "pra-1": {
    id: id<PractitionerId>("pra-1"),
    firstName: "Amélie",
    lastName: "Suela",
    specialty: "medecin_generaliste",
    rpps: "12345678901",
    email: "dr.suela@nami-demo.fr",
    phone: "06 11 22 33 44",
  },
  "pra-2": {
    id: id<PractitionerId>("pra-2"),
    firstName: "Émilie",
    lastName: "Renard",
    specialty: "psychologue",
    email: "emilie.renard.psy@nami-demo.fr",
    phone: "06 55 66 77 88",
  },
  "pra-3": {
    id: id<PractitionerId>("pra-3"),
    firstName: "Margot",
    lastName: "Vire",
    specialty: "dieteticien",
    email: "margot.vire.diet@nami-demo.fr",
    phone: "06 99 88 77 66",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. AFFILIATIONS
// ═══════════════════════════════════════════════════════════════════════════════

const affiliations: PractitionerAffiliation[] = [
  { practitionerId: id("pra-1"), establishmentId: id("est-1"), role: "Médecin coordinateur", isActive: true },
  { practitionerId: id("pra-2"), establishmentId: id("est-1"), isActive: true },
  { practitionerId: id("pra-3"), establishmentId: id("est-1"), isActive: true },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 4. PATIENT
// ═══════════════════════════════════════════════════════════════════════════════

const patients: Record<string, Patient> = {
  "pat-1": {
    id: id<PatientId>("pat-1"),
    firstName: "Théo",
    lastName: "Dufresne",
    dateOfBirth: "1997-03-12",
    email: "theo.d@email.com",
    phone: "06 12 34 56 78",
    createdAt: "2025-03-23T09:00:00Z",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. PARCOURS DE SOIN
// ═══════════════════════════════════════════════════════════════════════════════

const carePathways: Record<string, CarePathway> = {
  "cpw-1": {
    id: id<CarePathwayId>("cpw-1"),
    patientId: id("pat-1"),
    title: "Suivi TCA — Orthorexie sévère",
    pathologyType: "TCA",
    status: "active",
    phase: "evaluation",
    criticalityLevel: "critique",
    leadPractitionerId: id("pra-1"),
    entryReason: "Orthorexie sévère avec restriction alimentaire progressive. IMC 17.8. Perte de 8 kg en 4 mois.",
    referredBy: "Dr Martin — Médecin du sport",
    nextStepSummary: "Consultation endocrinologue urgente + bilan sanguin complet",
    startDate: "2025-03-23",
    createdAt: "2025-03-23T09:00:00Z",
    updatedAt: "2025-04-05T10:00:00Z",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. ÉQUIPE
// ═══════════════════════════════════════════════════════════════════════════════

const careTeams: Record<string, CareTeam> = {
  "ctm-1": { id: id<CareTeamId>("ctm-1"), carePathwayId: id("cpw-1"), createdAt: "2025-03-23T09:00:00Z" },
};

const careTeamMembers: CareTeamMember[] = [
  { careTeamId: id("ctm-1"), practitionerId: id("pra-1"), roleInTeam: "Médecin coordinateur", status: "active", isPrimary: true, joinedAt: "2025-03-23T09:00:00Z" },
  { careTeamId: id("ctm-1"), practitionerId: id("pra-2"), roleInTeam: "Psychologue TCA", status: "active", isPrimary: false, joinedAt: "2025-03-28T10:00:00Z", invitedBy: id("pra-1") },
  { careTeamId: id("ctm-1"), practitionerId: id("pra-3"), roleInTeam: "Diététicienne", status: "invited", isPrimary: false, joinedAt: "2025-04-04T14:00:00Z", invitedBy: id("pra-1") },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 7. RENDEZ-VOUS
// ═══════════════════════════════════════════════════════════════════════════════

const appointments: Record<string, Appointment> = {
  "apt-1": { id: id<AppointmentId>("apt-1"), carePathwayId: id("cpw-1"), patientId: id("pat-1"), practitionerId: id("pra-1"), establishmentId: id("est-1"), type: "premiere", mode: "in_person", status: "completed", startAt: "2025-03-23T09:00:00Z", endAt: "2025-03-23T09:45:00Z", reason: "1ère consultation — adressé par médecin du sport", createdAt: "2025-03-20T10:00:00Z" },
  "apt-2": { id: id<AppointmentId>("apt-2"), carePathwayId: id("cpw-1"), patientId: id("pat-1"), practitionerId: id("pra-2"), establishmentId: id("est-1"), type: "premiere", mode: "in_person", status: "completed", startAt: "2025-04-04T14:00:00Z", endAt: "2025-04-04T14:45:00Z", reason: "Séance psy initiale", createdAt: "2025-03-28T10:00:00Z" },
  "apt-3": { id: id<AppointmentId>("apt-3"), carePathwayId: id("cpw-1"), patientId: id("pat-1"), practitionerId: id("pra-3"), establishmentId: id("est-1"), type: "premiere", mode: "in_person", status: "completed", startAt: "2025-04-07T10:00:00Z", endAt: "2025-04-07T10:45:00Z", reason: "1er bilan nutritionnel", createdAt: "2025-04-04T14:00:00Z" },
  "apt-4": { id: id<AppointmentId>("apt-4"), carePathwayId: id("cpw-1"), patientId: id("pat-1"), practitionerId: id("pra-1"), establishmentId: id("est-1"), type: "suivi", mode: "in_person", status: "confirmed", startAt: "2025-04-12T14:00:00Z", endAt: "2025-04-12T14:45:00Z", reason: "Suivi médical — contrôle poids et constantes", createdAt: "2025-04-07T10:00:00Z" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 8. CONSULTATIONS (contenu clinique des RDV passés)
// ═══════════════════════════════════════════════════════════════════════════════

const consultations: Record<string, Consultation> = {
  "con-1": { id: id<ConsultationId>("con-1"), appointmentId: id("apt-1"), carePathwayId: id("cpw-1"), practitionerId: id("pra-1"), observations: "Tableau préoccupant : restriction alimentaire sévère centrée sur la 'pureté' des aliments. IMC 17.8. Hyperactivité physique (2h/jour). Déni de la gravité.", decisions: "Bilan bio urgent. Orientation psy et diét. Suivi hebdomadaire.", completedAt: "2025-03-23T09:45:00Z" },
  "con-2": { id: id<ConsultationId>("con-2"), appointmentId: id("apt-2"), carePathwayId: id("cpw-1"), practitionerId: id("pra-2"), observations: "Déni persistant. 'Je fais juste attention à ma santé.' Alliance thérapeutique fragile.", decisions: "Approche motivationnelle. Prochaine séance dans 10 jours.", completedAt: "2025-04-04T14:45:00Z" },
  "con-3": { id: id<ConsultationId>("con-3"), appointmentId: id("apt-3"), carePathwayId: id("cpw-1"), practitionerId: id("pra-3"), observations: "Restriction sévère : élimine glucides, produits laitiers, viande rouge. Apports estimés < 800 kcal/j.", decisions: "Réintroduction progressive. Commencer par le petit-déjeuner.", completedAt: "2025-04-07T10:45:00Z" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 9. ADRESSAGE
// ═══════════════════════════════════════════════════════════════════════════════

const referrals: Record<string, Referral> = {
  "ref-1": {
    id: id<ReferralId>("ref-1"), carePathwayId: id("cpw-1"), senderPractitionerId: id("pra-1"), targetPractitionerId: id("pra-2"),
    mode: "direct", status: "first_consult_done", priority: "urgent",
    clinicalReason: "Prise en charge psychologique TCA en urgence. Déni actif, besoin d'approche motivationnelle.",
    aiGenerated: false, responseNote: "Prise en charge acceptée. Premier RDV fixé.", respondedAt: "2025-03-29T10:00:00Z",
    resultingAppointmentId: id("apt-2"), createdAt: "2025-03-28T10:00:00Z", updatedAt: "2025-04-04T15:00:00Z",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 10. ALERTES
// ═══════════════════════════════════════════════════════════════════════════════

const alerts: Record<string, Alert> = {
  "alt-1": { id: id<AlertId>("alt-1"), carePathwayId: id("cpw-1"), severity: "high", status: "open", title: "Famille injoignable depuis 10 jours", description: "Les deux parents n'ont pas répondu aux appels ni aux messages.", triggerSource: "manual", createdAt: "2025-04-03T10:00:00Z" },
  "alt-2": { id: id<AlertId>("alt-2"), carePathwayId: id("cpw-1"), severity: "high", status: "open", title: "Bilan biologique urgent non réalisé", description: "Le bilan prescrit il y a 12 jours n'a pas été effectué.", triggerSource: "cron:detectOverdueTasks", createdAt: "2025-04-04T08:00:00Z" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 11. TÂCHES
// ═══════════════════════════════════════════════════════════════════════════════

const tasks: Record<string, Task> = {
  "tsk-1": { id: id<TaskId>("tsk-1"), carePathwayId: id("cpw-1"), title: "Bilan biologique complet URGENT", description: "NFS, iono, hépatique, thyroïde, B12, D, ferritine", priority: "urgent", status: "pending", assigneePractitionerId: id("pra-1"), dueDate: "2025-04-08", createdAt: "2025-03-23T10:00:00Z" },
  "tsk-2": { id: id<TaskId>("tsk-2"), carePathwayId: id("cpw-1"), title: "Contacter les parents", description: "Entretien de cadrage familial", priority: "high", status: "pending", assigneePractitionerId: id("pra-1"), dueDate: "2025-04-10", createdAt: "2025-04-01T10:00:00Z" },
  "tsk-3": { id: id<TaskId>("tsk-3"), carePathwayId: id("cpw-1"), title: "Consultation endocrinologue", description: "Adresser pour bilan hormonal complet", priority: "high", status: "pending", dueDate: "2025-04-12", createdAt: "2025-04-01T10:00:00Z" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 12. NOTES, DOCUMENTS, MESSAGES, JOURNAL, AI SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

const clinicalNotes: Record<string, ClinicalNote> = {
  "not-1": { id: id<NoteId>("not-1"), carePathwayId: id("cpw-1"), authorPractitionerId: id("pra-1"), type: "coordination", title: "Point d'équipe urgent", body: "Consensus : situation critique. Théo minimise. Les parents ne mesurent pas la gravité. Décision : consultation endoc en urgence + bilan bio.", createdAt: "2025-04-01T10:00:00Z" },
};

const documents: Record<string, MedicalDocument> = {};
const threads: Record<string, Thread> = {};
const messages: Record<string, Message> = {};
const journalEntries: Record<string, JournalEntry> = {};

const aiSummaries: Record<string, AISummary> = {
  "ais-1": {
    id: id<AISummaryId>("ais-1"), carePathwayId: id("cpw-1"),
    overview: "Théo Dufresne, 19 ans, étudiant STAPS, présente une orthorexie sévère en évolution rapide. IMC actuel à 17.8 avec perte de 8 kg en 4 mois.",
    recentEvolution: "Restriction alimentaire progressive. Hyperactivité physique non contrôlée. Déni actif.",
    careTeamAssessment: "Équipe incomplète : psychiatre manquant. Coordination fragilisée.",
    keyFindings: ["IMC 17.8 — seuil d'alerte dépassé", "Déni massif", "Famille injoignable", "Bilan bio urgent non réalisé"],
    recommendations: ["Bilan biologique complet en urgence", "Consultation endocrinologue sous 7 jours", "Entretien motivationnel structuré"],
    riskAssessment: "Risque CRITIQUE. Restriction + hyperactivité + déni + absence soutien familial.",
    gapsDetected: 3,
    generatedAt: "2025-04-04T16:00:00Z",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT — base de données mock unifiée
// ═══════════════════════════════════════════════════════════════════════════════

export const mockDB = {
  establishments,
  practitioners,
  affiliations,
  patients,
  carePathways,
  careTeams,
  careTeamMembers,
  appointments,
  consultations,
  referrals,
  clinicalNotes,
  alerts,
  tasks,
  documents,
  threads,
  messages,
  journalEntries,
  aiSummaries,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW MODELS PRÉ-CALCULÉS
// ═══════════════════════════════════════════════════════════════════════════════

export const patientDashboardView: PatientDashboardView = {
  patient: patients["pat-1"],
  carePathway: carePathways["cpw-1"],
  lead: { id: "pra-1", firstName: "Amélie", lastName: "Suela", specialty: "medecin_generaliste" },
  teamMembers: [
    { id: "pra-1", firstName: "Amélie", lastName: "Suela", specialty: "medecin_generaliste", roleInTeam: "Médecin coordinateur", status: "active" },
    { id: "pra-2", firstName: "Émilie", lastName: "Renard", specialty: "psychologue", roleInTeam: "Psychologue TCA", status: "active" },
    { id: "pra-3", firstName: "Margot", lastName: "Vire", specialty: "dieteticien", roleInTeam: "Diététicienne", status: "invited" },
  ],
  timelineEvents: [
    { id: "te-1", date: "2025-03-23", type: "consultation", title: "1ère consultation", practitionerName: "Dr Suela", summary: "Adressé par médecin du sport. IMC 17.8.", isPast: true },
    { id: "te-2", date: "2025-04-01", type: "note", title: "Point équipe", practitionerName: "Équipe", summary: "Consensus : situation critique.", isPast: true },
    { id: "te-3", date: "2025-04-04", type: "consultation", title: "Consultation", practitionerName: "É. Renard", summary: "Déni persistant. Approche motivationnelle.", isPast: true },
    { id: "te-4", date: "2025-04-07", type: "consultation", title: "Consultation", practitionerName: "M. Vire", summary: "1er bilan nutritionnel. < 800 kcal/j.", isPast: true },
    { id: "te-5", date: "2025-04-12", type: "planned", title: "RDV planifié", practitionerName: "Dr Suela", summary: "Suivi — contrôle poids", isPast: false },
    { id: "te-6", date: "2025-04-15", type: "planned", title: "RDV planifié", practitionerName: "É. Renard", summary: "Séance psy de suivi", isPast: false },
  ],
  activeAlerts: [
    { id: "alt-1", severity: "high", title: "Famille injoignable depuis 10 jours", createdAt: "2025-04-03T10:00:00Z" },
    { id: "alt-2", severity: "high", title: "Bilan biologique urgent non réalisé", createdAt: "2025-04-04T08:00:00Z" },
  ],
  pendingTasks: [
    { id: "tsk-1", title: "Bilan biologique complet URGENT", priority: "urgent", dueDate: "2025-04-08" },
    { id: "tsk-2", title: "Contacter les parents", priority: "high", dueDate: "2025-04-10" },
    { id: "tsk-3", title: "Consultation endocrinologue", priority: "high", dueDate: "2025-04-12" },
  ],
  nextAppointment: { id: "apt-4", startAt: "2025-04-12T14:00:00Z", mode: "in_person", reason: "Suivi médical — contrôle poids et constantes", practitionerName: "Dr Suela" },
  aiSummary: aiSummaries["ais-1"].overview,
};

export const practitionerDashboardView: PractitionerDashboardView = {
  todayAppointments: [
    { id: "apt-mock-1", startAt: "2025-04-05T09:00:00Z", endAt: "2025-04-05T09:45:00Z", type: "suivi", mode: "in_person", status: "confirmed", reason: "Bilan mensuel", patientName: "Margot Vire", patientInitials: "MV" },
    { id: "apt-mock-2", startAt: "2025-04-05T10:30:00Z", endAt: "2025-04-05T11:00:00Z", type: "suivi", mode: "in_person", status: "confirmed", reason: "Suivi boulimie", patientName: "Lucas Bernier", patientInitials: "LB" },
    { id: "apt-mock-3", startAt: "2025-04-05T14:00:00Z", endAt: "2025-04-05T14:45:00Z", type: "suivi", mode: "in_person", status: "confirmed", reason: "Bilan TCA", patientName: "Théo Dufresne", patientInitials: "TD" },
  ],
  pendingReferrals: 3,
  actionItems: [
    { id: "ai-1", type: "referral", title: "3 adressages sans réponse", subtitle: "Le plus ancien : il y a 4 jours", href: "/adressages" },
    { id: "ai-2", type: "contact", title: "Emma Rousseau", subtitle: "Aucun contact depuis 3 semaines", href: "/patients" },
    { id: "ai-3", type: "task", title: "Résultats labo · Théo Dufresne", subtitle: "Reçus hier, non consultés", href: "/documents" },
  ],
  recentMessages: [
    { senderName: "Dr Benali", senderInitials: "KB", message: "Pouvez-vous prendre Emma Rousseau en urgence ?", patientTag: "Emma Rousseau", timeAgo: "il y a 3h" },
    { senderName: "Margot Vire", senderInitials: "MV", message: "Bonne nouvelle pour Lucas — il cuisine à nouveau", patientTag: "Lucas Bernier", timeAgo: "il y a 2h" },
  ],
};
