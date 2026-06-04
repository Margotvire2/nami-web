"use client";

import { capture } from "./analytics";

// Events Nami — liste exhaustive des events trackés
// Nommage : snake_case, verbe_nom
//
// F-WEB-COOKIE-BANNER-GDPR-V1 : toutes les captures passent par
// `analytics.capture` qui no-op tant que l'utilisateur n'a pas accordé
// le consent analytics (Art.82 LCEN / CNIL).

export const track = {
  // Auth
  login: (props: { method?: string } = {}) =>
    capture("login", props),

  signup: (props: { roleType?: string } = {}) =>
    capture("signup", props),

  onboardingCompleted: (props: { roleType?: string } = {}) =>
    capture("onboarding_completed", props),

  logout: () =>
    capture("logout"),

  // Patients
  patientOpened: (props: { patientId: string; source?: string }) =>
    capture("patient_opened", props),

  patientCreated: (props: { method: "manual" | "doctolib_import" | "csv" }) =>
    capture("patient_created", props),

  // IA
  summaryGenerated: (props: { patientId: string; duration_ms?: number }) =>
    capture("summary_generated", props),

  summaryError: (props: { patientId: string; error?: string }) =>
    capture("summary_error", props),

  // Biologie
  bioImported: (props: { patientId: string; source?: string; metric_count?: number }) =>
    capture("bio_imported", props),

  // Notes
  noteCreated: (props: { patientId: string; noteType?: string }) =>
    capture("note_created", props),

  // Invitations
  invitationSent: (props: { invitedRole?: string; careCaseId?: string }) =>
    capture("invitation_sent", props),

  invitationAccepted: (props: { token?: string }) =>
    capture("invitation_accepted", props),

  // Facturation
  invoiceCreated: (props: { amount?: number; acteCount?: number }) =>
    capture("invoice_created", props),

  invoicePdfDownloaded: (props: { invoiceId: string }) =>
    capture("invoice_pdf_downloaded", props),

  // Documents
  documentUploaded: (props: { patientId: string; documentType?: string }) =>
    capture("document_uploaded", props),

  documentAnalyzed: (props: { patientId: string; documentId: string }) =>
    capture("document_analyzed", props),
};
