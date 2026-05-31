/**
 * Types & mappers pour /mes-soignants V2 (CC #SOIGNANTS-V2 PHASE 2).
 *
 * Le backend renvoie `PatientAuthorizedProvider` avec `specialty: string | null`
 * et `avatarUrl: string | null`. Les composants UI existants (MesSoignantsCard,
 * RevokeAccessModal) ont été câblés sur l'`AuthorizedProvider` du mock avec
 * `specialty: string` non-null et `avatarUrl?: string`.
 *
 * Pour éviter de toucher au design des cartes (consigne PHASE 2), on mappe
 * le payload backend vers la forme qu'attendent les composants : fallback
 * "Soignant" sur specialty null, undefined sur avatarUrl null.
 */

import type {
  PatientAuthorizedProvider,
  PatientCareCaseSummary,
} from "@/lib/api";
import type { AuthorizedProvider } from "./mock-data";

export type { PatientAuthorizedProvider, PatientCareCaseSummary };

/**
 * Adapte un PatientAuthorizedProvider (backend) en AuthorizedProvider
 * (forme attendue par MesSoignantsCard / RevokeAccessModal).
 */
export function toAuthorizedProvider(
  p: PatientAuthorizedProvider,
): AuthorizedProvider {
  return {
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    specialty: p.specialty ?? "Soignant",
    authorizedSince: p.authorizedSince,
    lastAppointmentAt: p.lastAppointmentAt,
    totalAppointments: p.totalAppointments,
    avatarUrl: p.avatarUrl ?? undefined,
    slug: p.slug,
  };
}

/**
 * Section UI = un CareCase + sa care team déjà adaptée pour MesSoignantsCard.
 * Construite côté page-client à partir de usePatientCareCases +
 * usePatientCareTeamByCareCases.
 */
export interface CareCaseSection {
  careCase: PatientCareCaseSummary;
  providers: AuthorizedProvider[];
  isLoading: boolean;
  isError: boolean;
}
