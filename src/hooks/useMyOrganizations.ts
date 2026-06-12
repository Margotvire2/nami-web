"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface MyOrganization {
  membershipId: string;
  role: string;
  joinedAt: string;
  organization: {
    id: string;
    name: string;
    type: string;
    city: string | null;
    zipCode: string | null;
    logoUrl: string | null;
    status: string;
    memberCount: number;
  };
}

export function useMyOrganizations() {
  const { accessToken } = useAuthStore();

  const { data, isLoading, isError } = useQuery<{ organizations: MyOrganization[] }>({
    queryKey: ["my-organizations"],
    queryFn: async () => {
      const res = await fetch(`${API}/me/organizations`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Erreur chargement organisations");
      return res.json();
    },
    enabled: !!accessToken,
    staleTime: 60_000,
  });

  return {
    organizations: data?.organizations ?? [],
    isLoading,
    isError,
  };
}
