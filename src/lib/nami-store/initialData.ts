/**
 * Nami Initial Data — L'UNIQUE source de mocks
 *
 * Ce fichier est chargé une seule fois au démarrage via initializeStore().
 * Après ça, plus aucun mock n'existe dans l'application.
 * Toutes les pages lisent depuis le store Zustand.
 */

import { mockDB } from "../domain/mockData";

/**
 * Appeler cette fonction une fois au mount de l'app
 * pour hydrater le store avec les données initiales.
 */
export function getInitialData() {
  return {
    patients: mockDB.patients,
    practitioners: mockDB.practitioners,
    establishments: mockDB.establishments,
    carePathways: mockDB.carePathways,
    careTeams: mockDB.careTeams,
    careTeamMembers: mockDB.careTeamMembers,
    appointments: mockDB.appointments,
    consultations: mockDB.consultations,
    referrals: mockDB.referrals,
    clinicalNotes: mockDB.clinicalNotes,
    alerts: mockDB.alerts,
    tasks: mockDB.tasks,
    documents: mockDB.documents,
    threads: mockDB.threads,
    messages: mockDB.messages,
    aiSummaries: mockDB.aiSummaries,
  };
}
