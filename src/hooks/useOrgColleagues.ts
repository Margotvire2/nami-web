"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface ColleagueProvider {
  personId: string;
  firstName: string | null;
  lastName: string;
  photoUrl: string | null;
  memberRole: string;
  joinedAt: string;
  specialty: string | null;
  city: string | null;
  providerProfileId: string | null;
}

export interface ColleagueSecretary {
  secretaryProfileId: string;
  personId: string;
  firstName: string | null;
  lastName: string;
  photoUrl: string | null;
  email: string | null;
  joinedAt: string;
}

export function useOrgColleagues(orgId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["org-colleagues", orgId],
    queryFn: async () => {
      const r = await fetch(`${API}/organizations/${orgId}/members/colleagues`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!r.ok) throw new Error(`Colleagues fetch failed: ${r.status}`);
      return r.json() as Promise<{ providers: ColleagueProvider[]; secretaries: ColleagueSecretary[] }>;
    },
    enabled: !!accessToken && !!orgId,
    staleTime: 30_000,
  });

  return {
    providers: data?.providers ?? [],
    secretaries: data?.secretaries ?? [],
    isLoading,
    isError,
  };
}
