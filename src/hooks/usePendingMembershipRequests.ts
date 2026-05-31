"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import type { MembershipRequest } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface PendingMembershipRequestRow extends MembershipRequest {
  applicant: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string | null;
    city: string | null;
    photoUrl: string | null;
  };
}

// Shape backend GET /organizations/:orgId/membership-requests (PR #92).
// include person { id, firstName, lastName, providerProfile.specialties }.
type ApiResponseRow = MembershipRequest & {
  person: {
    id: string;
    firstName: string;
    lastName: string;
    providerProfile: { specialties: string[] } | null;
  };
};

export function usePendingMembershipRequests(orgId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["org-membership-requests", orgId, "PENDING"],
    queryFn: async (): Promise<PendingMembershipRequestRow[]> => {
      if (!accessToken || !orgId) return [];
      const r = await fetch(
        `${API}/organizations/${orgId}/membership-requests?status=PENDING&limit=5`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!r.ok) throw new Error(`Membership requests fetch failed: ${r.status}`);
      const { requests } = (await r.json()) as { requests: ApiResponseRow[] };
      return requests.map(({ person, ...req }) => ({
        ...req,
        applicant: {
          id: person.id,
          firstName: person.firstName,
          lastName: person.lastName,
          specialty: person.providerProfile?.specialties?.[0] ?? null,
          city: null,
          photoUrl: null,
        },
      }));
    },
    enabled: !!accessToken && !!orgId,
    staleTime: 30 * 1000,
  });

  return {
    requests: data ?? [],
    isLoading,
    isError,
  };
}
