import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface DashboardIndicator {
  metricKey: string;
  label: string;
  domain: string;
  unit: string | null;
  value: number | null;
  previousValue: number | null;
  delta: number | null;
  deltaPercent: number | null;
  status: "OK" | "ALERT" | "CRITICAL" | "MISSING";
  timeStatus: "UP_TO_DATE" | "DUE_SOON" | "OVERDUE" | "NEVER";
  cadence: string;
  lastObservedAt: string | null;
  sparkline: number[];
  required: boolean;
}

export interface DashboardAlert {
  ruleKey: string;
  label: string;
  severity: "INFO" | "WARNING" | "HIGH" | "CRITICAL";
  triggeredAt: string;
  sourceLabel: string | null;
}

export interface DashboardScreening {
  fromLabel: string;
  toLabel: string;
  linkType: string;
  recommendation: string;
  evidence: string;
  suggestedSpecialty: string | null;
  sourceRef: string | null;
}

export interface DashboardQuestionnaire {
  key: string;
  label: string;
  lastScore: number | null;
  previousScore: number | null;
  maxScore: number | null;
  lastCompletedAt: string | null;
  timeStatus: "UP_TO_DATE" | "DUE_SOON" | "OVERDUE" | "NEVER";
  cadence: string;
}

export interface PatientDashboard {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    age: number | null;
    sex: string | null;
  };
  pathway: {
    key: string;
    label: string;
    family: string;
    currentPhase: { key: string; label: string; order: number } | null;
  } | null;
  alerts: DashboardAlert[];
  screenings: DashboardScreening[];
  indicators: DashboardIndicator[];
  questionnaires: DashboardQuestionnaire[];
  actions: {
    urgentTasks: Array<{ id: string; label: string; dueDate: string | null; assigneeName: string | null }>;
    upcomingAppointments: Array<{ id: string; date: string; providerName: string | null; type: string | null }>;
    pendingReferrals: Array<{ id: string; toSpecialty: string | null; status: string }>;
    suggestedReferrals: Array<{ specialty: string; comorbidity: string; fromCondition: string; linkType: string; source: string }>;
  };
  recentActivity: Array<{
    type: "NOTE" | "OBSERVATION" | "DOCUMENT" | "APPOINTMENT" | "REFERRAL" | "JOURNAL";
    date: string;
    summary: string;
    authorName: string | null;
  }>;
}

export function usePatientDashboard(careCaseId: string | undefined) {
  return useQuery<PatientDashboard>({
    queryKey: ["dashboard", careCaseId],
    queryFn: async () => {
      const res = await api.get(`/care-cases/${careCaseId}/dashboard`);
      return res.data;
    },
    enabled: !!careCaseId,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
