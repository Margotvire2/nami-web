"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CareCaseDetail } from "@/lib/api";
import {
  usePatientDashboard,
  type PatientDashboard,
} from "./usePatientDashboard";

/**
 * F-COCKPIT-PATIENT-360-REFONTE
 *
 * Hook agrégateur pour la vue 360° du patient.
 *
 * Compose:
 *   - GET /care-cases/:id              (CareCaseDetail + _count)
 *   - GET /care-cases/:id/dashboard    (PatientDashboard via usePatientDashboard)
 *
 * Retourne:
 *   - patient (CareCaseDetail)
 *   - dashboard (PatientDashboard | undefined)
 *   - counts (Record agrégé pour les badges de la sidebar)
 *   - isLoading / error
 *
 * NB: aucune requête réseau supplémentaire. On réutilise les données déjà
 *     consommées par la page existante.
 */

export interface Patient360Counts {
  /** RDV à venir (depuis dashboard.actions.upcomingAppointments) */
  agendaUpcoming: number;
  /** Bilans en attente — proxy: indicateurs OVERDUE + DUE_SOON */
  bilansPending: number;
  /** Nombre total d'observations stockées (via careCase._count.activities) */
  observationsTotal: number;
  /** RCPs récents — pas exposé en counts API, on tombe sur 0 si inconnu */
  rcpsRecent: number;
  /** Documents récents — careCase._count.documents */
  documentsRecent: number;
  /** Messages non lus — non agrégé côté CareCase, fallback 0 */
  messagesUnread: number;
  /** Tâches assignées (urgent) */
  tasksOpen: number;
}

export interface Patient360Result {
  patient: CareCaseDetail | undefined;
  dashboard: PatientDashboard | undefined;
  counts: Patient360Counts;
  isLoading: boolean;
  error: Error | null;
}

const ZERO_COUNTS: Patient360Counts = {
  agendaUpcoming: 0,
  bilansPending: 0,
  observationsTotal: 0,
  rcpsRecent: 0,
  documentsRecent: 0,
  messagesUnread: 0,
  tasksOpen: 0,
};

export function computePatient360Counts(
  patient: CareCaseDetail | undefined,
  dashboard: PatientDashboard | undefined,
): Patient360Counts {
  if (!patient && !dashboard) return ZERO_COUNTS;

  const upcoming = dashboard?.actions?.upcomingAppointments?.length ?? 0;
  const urgentTasks = dashboard?.actions?.urgentTasks?.length ?? 0;

  const indicators = dashboard?.indicators ?? [];
  const bilansPending = indicators.filter(
    (i) =>
      i.required &&
      (i.timeStatus === "OVERDUE" || i.timeStatus === "DUE_SOON"),
  ).length;

  const counts = patient?._count;

  return {
    agendaUpcoming: upcoming,
    bilansPending,
    observationsTotal: counts?.activities ?? 0,
    rcpsRecent: 0,
    documentsRecent: counts?.documents ?? 0,
    messagesUnread: 0,
    tasksOpen: urgentTasks,
  };
}

export function usePatient360(careCaseId: string | undefined): Patient360Result {
  const patientQuery = useQuery<CareCaseDetail>({
    queryKey: ["patient360", careCaseId, "care-case"],
    queryFn: async () => {
      const res = await api.get(`/care-cases/${careCaseId}`);
      return res.data;
    },
    enabled: !!careCaseId,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const dashboardQuery = usePatientDashboard(careCaseId);

  const counts = computePatient360Counts(
    patientQuery.data,
    dashboardQuery.data,
  );

  return {
    patient: patientQuery.data,
    dashboard: dashboardQuery.data,
    counts,
    isLoading: patientQuery.isLoading || dashboardQuery.isLoading,
    error: (patientQuery.error as Error | null) ?? null,
  };
}
