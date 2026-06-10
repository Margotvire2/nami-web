"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import type {
  OrganizationMemberStatus,
  OrganizationMemberRole,
} from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Shape backend GET /organizations/:id/members?status=X (PR #143).
export interface OrgMemberRow {
  personId: string;
  memberRole: OrganizationMemberRole | string;
  joinedAt: string;
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  providerProfile: { specialtyView: string | null } | null;
  membershipId: string;
  status: OrganizationMemberStatus;
  exitedAt: string | null;
  lastActivityAt: string | null;
  memberStatusReason: string | null;
}

export type MembersStatusFilter = OrganizationMemberStatus | "all";

export function useOrgMembers(
  orgId: string,
  status: MembersStatusFilter,
  options?: { enabled?: boolean }
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const enabled = (options?.enabled ?? true) && !!accessToken && !!orgId;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["org-members", orgId, status],
    queryFn: async (): Promise<OrgMemberRow[]> => {
      if (!accessToken || !orgId) return [];
      const r = await fetch(
        `${API}/organizations/${orgId}/members?status=${status}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!r.ok) throw new Error(`Members fetch failed: ${r.status}`);
      return (await r.json()) as OrgMemberRow[];
    },
    enabled,
    staleTime: 30 * 1000,
  });

  return {
    members: data ?? [],
    isLoading,
    isError,
    refetch,
  };
}
