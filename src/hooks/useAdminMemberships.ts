"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { organizationsApi, type OrganizationMembership } from "@/lib/api";

export interface AdminMembership {
  id: string;
  name: string;
  type: string;
}

// Renvoie la liste des organisations dans lesquelles l'utilisateur est ADMIN
// ou OWNER, avec un statut d'adhésion ACTIVE. Utilisé par :
//  - StructureSwitcher (header cockpit)
//  - login redirect logic
//  - middleware (via sync cookie nami-admin-org-ids)
export function useAdminMemberships() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const personId = useAuthStore((s) => s.user?.id);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-memberships", personId],
    queryFn: async (): Promise<AdminMembership[]> => {
      if (!accessToken) return [];
      const all: OrganizationMembership[] = await organizationsApi.mine(accessToken);
      // Backend /organizations/mine filtre déjà status=ACTIVE et expose myRole directement.
      return all
        .filter((o) => o.myRole === "ADMIN" || o.myRole === "OWNER")
        .map((o) => ({ id: o.id, name: o.name, type: o.type }));
    },
    enabled: !!accessToken && !!personId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    memberships: data ?? [],
    hasAny: (data ?? []).length > 0,
    isLoading,
    isError,
  };
}
