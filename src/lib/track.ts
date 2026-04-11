"use client";

import { posthog } from "./posthog";

// Events Nami — liste exhaustive des events trackés
// Nommage : snake_case, verbe_nom

export const track = {
  // Auth
  login: (props: { method?: string } = {}) =>
    posthog.capture("login", props),

  signup: (props: { roleType?: string } = {}) =>
    posthog.capture("signup", props),

  onboardingCompleted: (props: { roleType?: string } = {}) =>
    posthog.capture("onboarding_completed", props),

  logout: () =>
    posthog.capture("logout"),

  // Patients
  patientOpened: (props: { patientId: string; source?: string }) =>
    posthog.capture("patient_opened", props),

  patientCreated: (props: { method: "manual" | "doctolib_import" | "csv" }) =>
    posthog.capture("patient_created", props),

  // IA
  summaryGenerated: (props: { patientId: string; duration_ms?: number }) =>
    posthog.capture("summary_generated", props),

  summaryError: (props: { patientId: string; error?: string }) =>
    posthog.capture("summary_error", props),

  // Biologie
  bioImported: (props: { patientId: string; source?: string; metric_count?: number }) =>
    posthog.capture("bio_imported", props),

  // Notes
  noteCreated: (props: { patientId: string; noteType?: string }) =>
    posthog.capture("note_created", props),

  // Invitations
  invitationSent: (props: { invitedRole?: string; careCaseId?: string }) =>
    posthog.capture("invitation_sent", props),

  invitationAccepted: (props: { token?: string }) =>
    posthog.capture("invitation_accepted", props),

  // Facturation
  invoiceCreated: (props: { amount?: number; acteCount?: number }) =>
    posthog.capture("invoice_created", props),

  invoicePdfDownloaded: (props: { invoiceId: string }) =>
    posthog.capture("invoice_pdf_downloaded", props),

  // Documents
  documentUploaded: (props: { patientId: string; documentType?: string }) =>
    posthog.capture("document_uploaded", props),

  documentAnalyzed: (props: { patientId: string; documentId: string }) =>
    posthog.capture("document_analyzed", props),
};
