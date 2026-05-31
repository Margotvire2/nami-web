"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { organizationsApi, type OrganizationMembership } from "@/lib/api";

// Retourne l'entrée correspondante depuis GET /organizations/mine.
// On préfère ce shape (qui inclut déjà memberCount + conversations top 5)
// à un GET /organizations/:id séparé, pour éviter une 2e requête.
export function useOrgDetail(orgId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const personId = useAuthStore((s) => s.user?.id);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["organizations", "mine", personId],
    queryFn: async (): Promise<OrganizationMembership[]> => {
      if (!accessToken) return [];
      return organizationsApi.mine(accessToken);
    },
    enabled: !!accessToken && !!personId,
    staleTime: 5 * 60 * 1000,
  });

  const org = data?.find((o) => o.id === orgId);

  return {
    org,
    isLoading,
    isError,
  };
}
