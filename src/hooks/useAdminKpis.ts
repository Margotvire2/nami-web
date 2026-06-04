/**
 * useAdminKpis — F-ADMIN-NAMI-DASHBOARD-KPIS
 *
 * Hook React Query qui interroge `GET /admin/dashboard/kpis` (PLATFORM_ADMIN).
 * Polling 60s. Cache mémoire backend 5 min → side-cost OK même en re-poll.
 */
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface AdminKpiTotals {
  organizations: number;
  providers: number;
  patients: number;
  careCasesActive: number;
  eventsUpcoming: number;
  rcpsScheduled: number;
}

export interface AdminKpiGrowthEntry {
  date: string;
  signupsTotal: number;
  signupsByRole: Record<string, number>;
}

export interface AdminKpiActivity24h {
  newSignups: number;
  newCareCases: number;
  newRCPs: number;
  newAppointments: number;
  newDocs: number;
  newMessages: number;
}

export interface AdminKpiAlert {
  type: string;
  count: number;
  lastAt: string | null;
}

export interface AdminKpiResponse {
  totals: AdminKpiTotals;
  growth30d: AdminKpiGrowthEntry[];
  activity24h: AdminKpiActivity24h;
  alerts: AdminKpiAlert[];
  generatedAt: string;
}

async function fetchAdminKpis(token: string): Promise<AdminKpiResponse> {
  const res = await fetch(`${API_URL}/admin/dashboard/kpis`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Erreur ${res.status} lors du calcul des KPIs`);
  }
  return res.json();
}

export function useAdminKpis() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ["admin-kpis"],
    queryFn: () => fetchAdminKpis(accessToken!),
    enabled: !!accessToken,
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
  });
}
