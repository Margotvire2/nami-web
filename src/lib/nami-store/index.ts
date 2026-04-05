/**
 * Nami Store — source de vérité unique pour les données métier
 *
 * Règles :
 * - Toutes les entités sont indexées par ID (Record<string, Entity>)
 * - Les composants lisent via des sélecteurs, jamais en accédant au store directement
 * - Les mocks ne vivent que dans initialData.ts
 * - Ce store n'est PAS persisté (pas de localStorage)
 */

import { create } from "zustand";
import type {
  Patient, Practitioner, Establishment, CarePathway,
  CareTeam, CareTeamMember, Appointment, Consultation,
  Referral, ClinicalNote, Alert, Task, MedicalDocument,
  Thread, Message, AISummary,
} from "../domain/types";

// ═══════════════════════════════════════════════════════════════════════════════
// STORE SHAPE
// ═══════════════════════════════════════════════════════════════════════════════

interface NamiStore {
  // ── Entities (indexed by ID) ──
  patients: Record<string, Patient>;
  practitioners: Record<string, Practitioner>;
  establishments: Record<string, Establishment>;
  carePathways: Record<string, CarePathway>;
  careTeams: Record<string, CareTeam>;
  careTeamMembers: CareTeamMember[];
  appointments: Record<string, Appointment>;
  consultations: Record<string, Consultation>;
  referrals: Record<string, Referral>;
  clinicalNotes: Record<string, ClinicalNote>;
  alerts: Record<string, Alert>;
  tasks: Record<string, Task>;
  documents: Record<string, MedicalDocument>;
  threads: Record<string, Thread>;
  messages: Record<string, Message>;
  aiSummaries: Record<string, AISummary>;

  // ── Actions ──
  addAppointment: (apt: Appointment) => void;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, patch: Partial<Alert>) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  addReferral: (ref: Referral) => void;
  updateReferral: (id: string, patch: Partial<Referral>) => void;
  addMessage: (msg: Message) => void;

  // ── Bulk init (called once at app start) ──
  initializeStore: (data: Partial<Omit<NamiStore, "initializeStore" | "addAppointment" | "updateAppointment" | "addAlert" | "updateAlert" | "addTask" | "updateTask" | "addReferral" | "updateReferral" | "addMessage">>) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE STORE
// ═══════════════════════════════════════════════════════════════════════════════

export const useNamiStore = create<NamiStore>((set) => ({
  // Initial empty state
  patients: {},
  practitioners: {},
  establishments: {},
  carePathways: {},
  careTeams: {},
  careTeamMembers: [],
  appointments: {},
  consultations: {},
  referrals: {},
  clinicalNotes: {},
  alerts: {},
  tasks: {},
  documents: {},
  threads: {},
  messages: {},
  aiSummaries: {},

  // ── Actions ──
  addAppointment: (apt) => set((s) => ({ appointments: { ...s.appointments, [apt.id]: apt } })),
  updateAppointment: (id, patch) => set((s) => ({
    appointments: { ...s.appointments, [id]: { ...s.appointments[id], ...patch } },
  })),

  addAlert: (alert) => set((s) => ({ alerts: { ...s.alerts, [alert.id]: alert } })),
  updateAlert: (id, patch) => set((s) => ({
    alerts: { ...s.alerts, [id]: { ...s.alerts[id], ...patch } },
  })),

  addTask: (task) => set((s) => ({ tasks: { ...s.tasks, [task.id]: task } })),
  updateTask: (id, patch) => set((s) => ({
    tasks: { ...s.tasks, [id]: { ...s.tasks[id], ...patch } },
  })),

  addReferral: (ref) => set((s) => ({ referrals: { ...s.referrals, [ref.id]: ref } })),
  updateReferral: (id, patch) => set((s) => ({
    referrals: { ...s.referrals, [id]: { ...s.referrals[id], ...patch } },
  })),

  addMessage: (msg) => set((s) => ({ messages: { ...s.messages, [msg.id]: msg } })),

  // ── Bulk init ──
  initializeStore: (data) => set((s) => ({ ...s, ...data })),
}));
