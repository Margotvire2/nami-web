"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface OrgPatientRow {
  id: string;
  firstName: string | null;
  lastName: string;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  birthDate: string | null;
  patientCases: {
    id: string;
    caseTitle: string;
    leadProviderId: string | null;
    leadProvider: {
      person: { firstName: string | null; lastName: string };
    } | null;
  }[];
}

export function useOrgPatients(orgId: string, search?: string) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["org-patients", orgId, search ?? ""],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "100" });
      if (search?.trim()) params.set("search", search.trim());
      const r = await fetch(`${API}/organizations/${orgId}/patients?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!r.ok) throw new Error(`Patients fetch failed: ${r.status}`);
      return r.json() as Promise<{ patients: OrgPatientRow[]; total: number }>;
    },
    enabled: !!accessToken && !!orgId,
    staleTime: 30_000,
  });

  return {
    patients: data?.patients ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError,
    refetch,
  };
}
