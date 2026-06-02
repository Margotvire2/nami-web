"use client";

import { useMutation } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ─── Types & constantes — miroir du backend (PR #138) ────────────────────────
// Source canonique : nami repo, src/routes/organizationApplications.ts
// Toute évolution backend doit être répliquée ici.

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
  | "FEDERATION"
  | "INSTITUTIONNEL"
  | "ACCELERATEUR";

export const ORG_TYPES_REQUIRING_FINESS: ReadonlyArray<OrgType> = [
  "HOSPITAL",
  "CLINIC",
  "HEALTH_CENTER",
  "HOSPITAL_SERVICE",
];

export function requiresFiness(type: OrgType): boolean {
  return ORG_TYPES_REQUIRING_FINESS.includes(type);
}

// Version courante des CGU au moment de l'envoi de la candidature.
// Stockée côté backend (RGPD Art. 7 — preuve du consentement à un état précis).
// À bumper à chaque révision des CGU exposées sur /cgu.
export const CGU_VERSION = "2026-06-02";

export const SIRET_REGEX = /^\d{14}$/;
export const FINESS_REGEX = /^\d{9}$/;
export const ZIP_REGEX = /^\d{5}$/;
export const RPPS_REGEX = /^\d{11}$/;

export interface SubmitApplicationInput {
  proposedName: string;
  proposedType: OrgType;
  proposedSiret: string;
  proposedFiness?: string | null;
  proposedAddress: string;
  proposedCity: string;
  proposedZipCode: string;
  proposedRegion?: string | null;
  proposedDescription?: string | null;
  proposedMissionStatement?: string | null;
  proposedSpecialty?: string | null;
  proposedWebsite?: string | null;
  proposedSince?: string | null;
  applicantEmail: string;
  applicantFirstName: string;
  applicantLastName: string;
  applicantPhone?: string | null;
  applicantRoleInOrg: string;
  applicantHasRpps?: boolean;
  applicantRpps?: string | null;
  cguVersion: string;
  acceptedTerms: true;
  acceptedRgpd: true;
}

export interface SubmitApplicationResponse {
  id: string;
  status: string;
  trackingToken: string;
}

export class SubmitApplicationError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "SubmitApplicationError";
  }
}

export async function submitOrganizationApplication(
  input: SubmitApplicationInput,
): Promise<SubmitApplicationResponse> {
  const res = await fetch(`${API_URL}/organization-applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.status === 429) {
      throw new SubmitApplicationError(
        429,
        "Trop de candidatures depuis votre adresse. Réessayez dans une heure.",
        body,
      );
    }
    if (res.status === 409) {
      throw new SubmitApplicationError(
        409,
        body.error ||
          "Une candidature avec ce SIRET ou cet email est déjà enregistrée.",
        body,
      );
    }
    if (res.status === 400) {
      throw new SubmitApplicationError(
        400,
        body.error || "Les informations envoyées sont incomplètes.",
        body,
      );
    }
    throw new SubmitApplicationError(
      res.status,
      body.error || `Erreur ${res.status}`,
      body,
    );
  }

  return (await res.json()) as SubmitApplicationResponse;
}

export function useSubmitApplication() {
  return useMutation<
    SubmitApplicationResponse,
    SubmitApplicationError,
    SubmitApplicationInput
  >({
    mutationFn: submitOrganizationApplication,
  });
}
