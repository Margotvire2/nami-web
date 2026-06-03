"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import type { MembershipRequest, MembershipRequestStatus } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Surface unifiée pour la console d'animation (Card + Modal). On expose
// applicant + reviewedBy pour afficher l'examinateur sur les requêtes déjà
// traitées (ACCEPTED / REJECTED).
export interface MembershipRequestRow extends MembershipRequest {
  applicant: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string | null;
    city: string | null;
    photoUrl: string | null;
  };
  reviewer: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

// Shape backend GET /organizations/:orgId/membership-requests (PR #92).
// include person { id, firstName, lastName, providerProfile.specialties }
// + reviewedBy { id, firstName, lastName } sur les rows traitées.
type ApiResponseRow = MembershipRequest & {
  person: {
    id: string;
    firstName: string;
    lastName: string;
    providerProfile: { specialties: string[] } | null;
  };
  reviewedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
};

// "ALL" = pas de filtre côté URL — utile pour l'onglet "Tous" qui mélange
// PENDING + ACCEPTED + REJECTED. Les autres statuts (TO_CONTACT, IN_REVIEW,
// WITHDRAWN) ne sont pas exposés en V1 (cf. nami-information-architecture :
// surface = animateur, pas worflow interne).
export type MembershipRequestFilter =
  | "ALL"
  | Extract<MembershipRequestStatus, "PENDING" | "ACCEPTED" | "REJECTED">;

const DEFAULT_LIMIT = 50;

export function useMembershipRequests(
  orgId: string,
  filter: MembershipRequestFilter = "ALL",
  limit: number = DEFAULT_LIMIT,
) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["org-membership-requests", orgId, filter, limit],
    queryFn: async (): Promise<MembershipRequestRow[]> => {
      if (!accessToken || !orgId) return [];
      const params = new URLSearchParams();
      if (filter !== "ALL") params.set("status", filter);
      params.set("limit", String(limit));
      const r = await fetch(
        `${API}/organizations/${orgId}/membership-requests?${params.toString()}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (!r.ok)
        throw new Error(`Membership requests fetch failed: ${r.status}`);
      const { requests } = (await r.json()) as { requests: ApiResponseRow[] };
      return requests.map(({ person, reviewedBy, ...req }) => ({
        ...req,
        applicant: {
          id: person.id,
          firstName: person.firstName,
          lastName: person.lastName,
          specialty: person.providerProfile?.specialties?.[0] ?? null,
          city: null,
          photoUrl: null,
        },
        reviewer: reviewedBy
          ? {
              id: reviewedBy.id,
              firstName: reviewedBy.firstName,
              lastName: reviewedBy.lastName,
            }
          : null,
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
