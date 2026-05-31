"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import type { MembershipRequest } from "@/lib/api";

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

// V1 — l'endpoint backend `GET /organizations/:orgId/membership-requests`
// n'existe pas encore. Ce hook est posé prêt à être branché : il suffira
// de remplacer la queryFn par un vrai fetch dès que l'endpoint est livré.
// Décision Margot dans CC #E (cf BLOQUANT-1, Phase 0).
export function usePendingMembershipRequests(orgId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["org-membership-requests", orgId, "PENDING"],
    queryFn: async (): Promise<PendingMembershipRequestRow[]> => {
      // Stub V1 — endpoint backend en cours.
      return [];
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
