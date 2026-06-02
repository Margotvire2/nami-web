"use client";

// F-STRUCT-V2-ORG-APPLICATION — Hooks PLATFORM_ADMIN review queue.
// Endpoints backend (PR #138) :
//   GET    /admin/organization-applications
//   GET    /admin/organization-applications/:id
//   POST   /admin/organization-applications/:id/start-review
//   POST   /admin/organization-applications/:id/approve
//   POST   /admin/organization-applications/:id/reject

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export type ApplicationStatus =
  | "PENDING_REVIEW"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "WITHDRAWN";

export type OrgType =
  | "PRIVATE_PRACTICE"
  | "CLINIC"
  | "HOSPITAL"
  | "HEALTH_CENTER"
  | "NETWORK"
  | "MSP"
  | "CPTS"
  | "ASSOCIATION"
  | "PROFESSIONAL_GROUP"
  | "HOSPITAL_SERVICE"
  | "INTERNAL"
  | "FEDERATION"
  | "INSTITUTIONNEL"
  | "ACCELERATEUR";

export type OrganizationTier =
  | "COORDINATION"
  | "INTELLIGENCE"
  | "PILOTAGE"
  | "RESEAU";

// Shape de listPendingApplications() — select projeté côté backend.
export interface ApplicationListItem {
  id: string;
  proposedName: string;
  proposedType: OrgType;
  proposedCity: string;
  proposedSiret: string;
  applicantEmail: string;
  applicantFirstName: string;
  applicantLastName: string;
  applicantRoleInOrg: string;
  status: ApplicationStatus;
  createdAt: string;
  reviewedAt: string | null;
}

// Shape de getApplicationForReview() — modèle complet + relations include.
export interface ApplicationDetail {
  id: string;
  proposedName: string;
  proposedType: OrgType;
  proposedSiret: string;
  proposedFiness: string | null;
  proposedAddress: string;
  proposedCity: string;
  proposedZipCode: string;
  proposedRegion: string | null;
  proposedDescription: string | null;
  proposedMissionStatement: string | null;
  proposedSpecialty: string | null;
  proposedWebsite: string | null;
  proposedSince: string | null;
  proposedTier: OrganizationTier | null;
  applicantEmail: string;
  applicantFirstName: string;
  applicantLastName: string;
  applicantPhone: string | null;
  applicantRoleInOrg: string;
  applicantHasRpps: boolean;
  applicantRpps: string | null;
  status: ApplicationStatus;
  reviewedByPersonId: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  rejectionReason: string | null;
  approvedAt: string | null;
  withdrawnAt: string | null;
  trackingToken: string;
  createdOrganizationId: string | null;
  createdAdminPersonId: string | null;
  acceptedTermsAt: string;
  acceptedRgpdAt: string;
  cguVersion: string;
  createdAt: string;
  updatedAt: string;
  reviewedBy: { id: string; firstName: string; lastName: string; email: string } | null;
  createdOrganization: { id: string; name: string; type: OrgType } | null;
  createdAdminPerson: { id: string; firstName: string; lastName: string; email: string } | null;
}

// ─── Queries ────────────────────────────────────────────────────────────────

export function useAdminApplicationsList() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ["admin-organization-applications", "list"],
    queryFn: async (): Promise<ApplicationListItem[]> => {
      if (!accessToken) return [];
      const r = await fetch(`${API}/admin/organization-applications`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!r.ok) throw new Error(`List applications failed: ${r.status}`);
      const { items } = (await r.json()) as { items: ApplicationListItem[] };
      return items;
    },
    enabled: !!accessToken,
    staleTime: 30 * 1000,
  });
}

export function useAdminApplicationDetail(id: string | null | undefined) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ["admin-organization-applications", "detail", id],
    queryFn: async (): Promise<ApplicationDetail | null> => {
      if (!accessToken || !id) return null;
      const r = await fetch(`${API}/admin/organization-applications/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`Detail failed: ${r.status}`);
      return (await r.json()) as ApplicationDetail;
    },
    enabled: !!accessToken && !!id,
    staleTime: 0,
  });
}

// ─── Mutations ──────────────────────────────────────────────────────────────

function invalidate(qc: ReturnType<typeof useQueryClient>, id: string) {
  qc.invalidateQueries({ queryKey: ["admin-organization-applications", "list"] });
  qc.invalidateQueries({ queryKey: ["admin-organization-applications", "detail", id] });
}

export function useStartReview() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ status: ApplicationStatus }> => {
      const r = await fetch(`${API}/admin/organization-applications/${id}/start-review`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken ?? ""}` },
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body.error || `Start review failed: ${r.status}`);
      }
      return r.json();
    },
    onSuccess: (_, id) => invalidate(qc, id),
  });
}

export function useApproveApplication() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      reviewNotes?: string | null;
    }): Promise<{
      status: ApplicationStatus;
      organizationId: string;
      adminPersonId: string;
    }> => {
      const r = await fetch(
        `${API}/admin/organization-applications/${params.id}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken ?? ""}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reviewNotes: params.reviewNotes ?? null }),
        },
      );
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body.error || `Approve failed: ${r.status}`);
      }
      return r.json();
    },
    onSuccess: (_, { id }) => invalidate(qc, id),
  });
}

export function useRejectApplication() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      rejectionReason: string;
    }): Promise<{ status: ApplicationStatus; rejectionReason: string }> => {
      const r = await fetch(
        `${API}/admin/organization-applications/${params.id}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken ?? ""}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rejectionReason: params.rejectionReason }),
        },
      );
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body.error || `Reject failed: ${r.status}`);
      }
      return r.json();
    },
    onSuccess: (_, { id }) => invalidate(qc, id),
  });
}
