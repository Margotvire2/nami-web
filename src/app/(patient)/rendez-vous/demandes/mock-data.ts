// Mock V1 — interface locale (sera remplacée par API réelle GET /patient/appointment-requests V2).
// Pas d'import du type AppointmentRequest backend (volontaire : pas de couplage prématuré).

export type AppointmentRequestStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface MockAppointmentRequest {
  id: string;
  providerFirstName: string;
  providerLastName: string;
  providerSpecialty: string;
  providerSlug: string;
  motif: string | null;
  requestedDate: string | null; // ISO YYYY-MM-DD
  locationType: "IN_PERSON" | "VIDEO";
  status: AppointmentRequestStatus;
  createdAt: string; // ISO datetime
  acceptedAt: string | null;
  declinedAt: string | null;
  declineReason: string | null;
}

// 4 demandes illustratives — neutres pathologies (MDR-safe).
// Pas d'invention de pathologie, motifs génériques (suivi, accompagnement, premier RDV).
export const MOCK_APPOINTMENT_REQUESTS: MockAppointmentRequest[] = [
  {
    id: "mock-req-001",
    providerFirstName: "Camille",
    providerLastName: "Bernard",
    providerSpecialty: "Diététicienne",
    providerSlug: "camille-bernard",
    motif: "Premier rendez-vous suivi nutritionnel",
    requestedDate: "2026-06-12",
    locationType: "IN_PERSON",
    status: "PENDING",
    createdAt: "2026-05-26T10:32:00Z",
    acceptedAt: null,
    declinedAt: null,
    declineReason: null,
  },
  {
    id: "mock-req-002",
    providerFirstName: "Julien",
    providerLastName: "Moreau",
    providerSpecialty: "Médecin généraliste",
    providerSlug: "julien-moreau",
    motif: null,
    requestedDate: "2026-06-03",
    locationType: "VIDEO",
    status: "ACCEPTED",
    createdAt: "2026-05-24T14:15:00Z",
    acceptedAt: "2026-05-24T16:42:00Z",
    declinedAt: null,
    declineReason: null,
  },
  {
    id: "mock-req-003",
    providerFirstName: "Sophie",
    providerLastName: "Lambert",
    providerSpecialty: "Psychologue",
    providerSlug: "sophie-lambert",
    motif: "Accompagnement personnel",
    requestedDate: null,
    locationType: "IN_PERSON",
    status: "DECLINED",
    createdAt: "2026-05-20T09:00:00Z",
    acceptedAt: null,
    declinedAt: "2026-05-21T11:30:00Z",
    declineReason: "Cabinet complet jusqu'à septembre 2026",
  },
  {
    id: "mock-req-004",
    providerFirstName: "Marie",
    providerLastName: "Durand",
    providerSpecialty: "Kinésithérapeute",
    providerSlug: "marie-durand",
    motif: "Suivi régulier",
    requestedDate: "2026-06-18",
    locationType: "IN_PERSON",
    status: "PENDING",
    createdAt: "2026-05-25T08:45:00Z",
    acceptedAt: null,
    declinedAt: null,
    declineReason: null,
  },
];
