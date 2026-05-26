/**
 * Mock data V1 — page /mes-soignants
 *
 * V1 : données illustratives en dur (frontend pur, aucun hit API).
 * V2 (post ICD11) : intégration API réelle via ticket dérivé
 * F-MES-SOIGNANTS-REVOKE-API-INTEGRATION.
 *
 * Wording MDR : aucune donnée clinique. Uniquement champs administratifs :
 * identité, spécialité (libellé annuaire), accès accordé, historique RDV.
 */

export interface AuthorizedProvider {
  /** ID stable du soignant (utilisé comme key React et dans la modal). */
  id: string;
  firstName: string;
  lastName: string;
  /** Spécialité au sens annuaire (libellé public, pas de jargon clinique). */
  specialty: string;
  /** Date d'octroi de l'accès, ISO 8601. */
  authorizedSince: string;
  /** Dernier RDV avec ce soignant, ISO 8601, ou null si aucun. */
  lastAppointmentAt: string | null;
  /** Nombre total de consultations passées avec ce soignant. */
  totalAppointments: number;
  /** URL photo (optionnel — fallback initiales). */
  avatarUrl?: string;
  /** Slug pour /soignants/[slug]. */
  slug: string;
}

export const MOCK_AUTHORIZED_PROVIDERS: AuthorizedProvider[] = [
  {
    id: "mock-prov-001",
    firstName: "Sarah",
    lastName: "Leroy",
    specialty: "Médecin généraliste",
    authorizedSince: "2024-09-12T10:00:00.000Z",
    lastAppointmentAt: "2026-05-14T09:30:00.000Z",
    totalAppointments: 8,
    slug: "sarah-leroy",
  },
  {
    id: "mock-prov-002",
    firstName: "Margot",
    lastName: "Vire",
    specialty: "Diététicienne",
    authorizedSince: "2025-02-03T14:15:00.000Z",
    lastAppointmentAt: "2026-05-20T11:00:00.000Z",
    totalAppointments: 12,
    slug: "margot-vire",
  },
  {
    id: "mock-prov-003",
    firstName: "Thomas",
    lastName: "Bernard",
    specialty: "Psychologue clinicien",
    authorizedSince: "2025-04-18T09:00:00.000Z",
    lastAppointmentAt: "2026-05-22T16:00:00.000Z",
    totalAppointments: 9,
    slug: "thomas-bernard",
  },
  {
    id: "mock-prov-004",
    firstName: "Claire",
    lastName: "Moreau",
    specialty: "Cardiologue",
    authorizedSince: "2025-11-05T08:30:00.000Z",
    lastAppointmentAt: "2026-03-10T15:30:00.000Z",
    totalAppointments: 2,
    slug: "claire-moreau",
  },
  {
    id: "mock-prov-005",
    firstName: "Antoine",
    lastName: "Dubois",
    specialty: "Kinésithérapeute",
    authorizedSince: "2026-01-20T13:00:00.000Z",
    lastAppointmentAt: null,
    totalAppointments: 0,
    slug: "antoine-dubois",
  },
];
