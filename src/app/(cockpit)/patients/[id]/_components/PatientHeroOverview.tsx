"use client";

/**
 * F-COCKPIT-PATIENT-360-REFONTE — PatientHeroOverview
 *
 * Hero condensé en haut du tab "Vue d'ensemble".
 * - Avatar (initiales)
 * - Identité (prénom + nom)
 * - Âge / sexe / caseType
 * - Indicateur d'engagement uniquement si donnée fournie (sinon omis)
 * - Pas d'invention de score — si engagementLevel === undefined, le bloc disparaît.
 */

import type { CareCaseDetail } from "@/lib/api";
import { shortSex } from "@/lib/patient-utils";

type EngagementLevel = "high" | "medium" | "low";

interface Props {
  careCase: CareCaseDetail;
  engagementLevel?: EngagementLevel | null;
}

const CASE_TYPE_LABEL: Record<string, string> = {
  TCA: "TCA",
  OBESITY: "Obésité",
  PEDIATRIC: "Pédiatrie",
  ENDOCRINO: "Endocrinologie",
  GENERAL: "Général",
};

const ENGAGEMENT_LABEL: Record<EngagementLevel, string> = {
  high: "Engagement élevé",
  medium: "Engagement moyen",
  low: "Engagement faible",
};

const ENGAGEMENT_COLOR: Record<EngagementLevel, string> = {
  high: "bg-emerald-500",
  medium: "bg-amber-500",
  low: "bg-rose-500",
};

function initials(firstName?: string, lastName?: string): string {
  const a = (firstName?.[0] ?? "").toUpperCase();
  const b = (lastName?.[0] ?? "").toUpperCase();
  return `${a}${b}` || "?";
}

function ageFromBirth(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null;
  const t = new Date(birthDate).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / (365.25 * 24 * 3600 * 1000));
}

export function PatientHeroOverview({ careCase, engagementLevel }: Props) {
  const { patient, caseType, patientFacingTitle } = careCase;
  const age = ageFromBirth(patient.birthDate ?? null);
  const sexLabel = shortSex(patient.sex);
  const caseLabel = CASE_TYPE_LABEL[caseType] ?? caseType;

  return (
    <section
      data-testid="patient-hero-overview"
      className="rounded-xl border border-[#E8ECF4] bg-white shadow-sm px-5 py-4 flex items-start gap-4"
    >
      <div
        aria-hidden="true"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EEF0FB] text-[#4F46E5] font-semibold text-base"
      >
        {initials(patient.firstName, patient.lastName)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {patient.firstName} {patient.lastName}
          </h2>
          {patientFacingTitle && (
            <span className="text-xs text-gray-400">({patientFacingTitle})</span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
          {age !== null && <span>{age} ans</span>}
          {sexLabel && (
            <>
              <span aria-hidden="true">·</span>
              <span>{sexLabel}</span>
            </>
          )}
          {caseLabel && (
            <>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center rounded-full bg-[#EEF0FB] px-2 py-0.5 text-xs font-medium text-[#4F46E5]">
                {caseLabel}
              </span>
            </>
          )}
        </div>

        {engagementLevel ? (
          <div
            data-testid="patient-hero-engagement"
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-500"
          >
            <span
              aria-hidden="true"
              className={`inline-block h-2 w-2 rounded-full ${ENGAGEMENT_COLOR[engagementLevel]}`}
            />
            {ENGAGEMENT_LABEL[engagementLevel]}
          </div>
        ) : null}
      </div>
    </section>
  );
}
