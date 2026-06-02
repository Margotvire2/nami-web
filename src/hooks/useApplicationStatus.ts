"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export type ApplicationStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "WITHDRAWN";

export interface ApplicationDetail {
  id: string;
  status: ApplicationStatus;
  trackingToken: string;
  proposedName: string;
  proposedType: string;
  proposedSiret: string;
  proposedFiness: string | null;
  proposedAddress: string;
  proposedCity: string;
  proposedZipCode: string;
  proposedRegion: string | null;
  applicantEmail: string;
  applicantFirstName: string;
  applicantLastName: string;
  applicantRoleInOrg: string;
  createdAt: string;
  submittedAt: string | null;
  reviewStartedAt: string | null;
  decidedAt: string | null;
  rejectionReason: string | null;
}

export class ApplicationStatusError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApplicationStatusError";
  }
}

export async function fetchApplicationByToken(
  trackingToken: string,
): Promise<ApplicationDetail> {
  const res = await fetch(
    `${API_URL}/organization-applications/${encodeURIComponent(trackingToken)}`,
  );
  if (res.status === 404) {
    throw new ApplicationStatusError(404, "Candidature introuvable.");
  }
  if (!res.ok) {
    throw new ApplicationStatusError(res.status, `Erreur ${res.status}`);
  }
  return (await res.json()) as ApplicationDetail;
}

export async function withdrawApplicationByToken(
  trackingToken: string,
): Promise<{ status: ApplicationStatus; alreadyWithdrawn?: boolean }> {
  const res = await fetch(
    `${API_URL}/organization-applications/${encodeURIComponent(trackingToken)}/withdraw`,
    { method: "PATCH" },
  );
  if (res.status === 404) {
    throw new ApplicationStatusError(404, "Candidature introuvable.");
  }
  if (res.status === 409) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApplicationStatusError(
      409,
      body.error || "Cette candidature est déjà clôturée.",
    );
  }
  if (!res.ok) {
    throw new ApplicationStatusError(res.status, `Erreur ${res.status}`);
  }
  return (await res.json()) as {
    status: ApplicationStatus;
    alreadyWithdrawn?: boolean;
  };
}

export function useApplicationStatus(trackingToken: string | undefined | null) {
  return useQuery<ApplicationDetail, ApplicationStatusError>({
    queryKey: ["organization-application", trackingToken],
    queryFn: () => fetchApplicationByToken(trackingToken as string),
    enabled: Boolean(trackingToken),
    retry: (failureCount, error) => {
      if (error instanceof ApplicationStatusError && error.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useWithdrawApplication(trackingToken: string) {
  const qc = useQueryClient();
  return useMutation<
    { status: ApplicationStatus; alreadyWithdrawn?: boolean },
    ApplicationStatusError,
    void
  >({
    mutationFn: () => withdrawApplicationByToken(trackingToken),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["organization-application", trackingToken],
      });
    },
  });
}
