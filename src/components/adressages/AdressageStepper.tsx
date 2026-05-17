"use client";

/**
 * AdressageStepper — 5 étapes inline (Envoyé → Reçu → Accepté → RDV pris → 1re consultation).
 *
 * Dérivation 100% client-side depuis status + respondedAt + desiredAppointmentDate.
 * SOLID couleurs sacrées (jamais glass) — donnée clinique.
 *
 * États visuels :
 *   done      → disc teal #2BA89C + check blanc
 *   current   → disc violet #5B4EC4 animate-pulse (étape next attendue)
 *   pending   → ring violet 30% transparent
 *   interrompu→ dernière étape atteinte en disc gris #A1A1AA (pas current, pas teal)
 *
 * DRAFT → composant retourne null (brouillon = pas de stepper).
 */

import { Fragment } from "react";
import type { Referral } from "@/lib/api";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdressageStepperProps {
  referral: Referral;
  className?: string;
}

const STEPPER_STEPS = [
  { label: "Envoyé" },
  { label: "Reçu" },
  { label: "Accepté" },
  { label: "RDV pris" },
  { label: "1re consultation" },
] as const;

interface StepperState {
  currentStep: number; // index de la dernière étape complétée (0-4)
  interrupted: boolean;
}

function deriveStepperState(r: Referral): StepperState | null {
  if (r.status === "DRAFT") return null;

  if (r.status === "DECLINED") return { currentStep: 1, interrupted: true };
  if (r.status === "EXPIRED") return { currentStep: 0, interrupted: true };
  if (r.status === "CANCELLED") {
    let step = 0;
    if (r.respondedAt) step = Math.max(step, 2);
    if (r.desiredAppointmentDate) step = Math.max(step, 3);
    return { currentStep: step, interrupted: true };
  }

  switch (r.status) {
    case "SENT":
      return { currentStep: 0, interrupted: false };
    case "RECEIVED":
    case "UNDER_REVIEW":
      return { currentStep: 1, interrupted: false };
    case "ACCEPTED":
      return { currentStep: 2, interrupted: false };
    case "PATIENT_CONTACTED":
    case "APPOINTMENT_INVITED":
      return { currentStep: r.desiredAppointmentDate ? 3 : 2, interrupted: false };
    case "APPOINTMENT_BOOKED":
      return { currentStep: 3, interrupted: false };
    case "FIRST_VISIT_COMPLETED":
      return { currentStep: 4, interrupted: false };
  }
}

function formatDateShort(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

export function AdressageStepper({ referral, className }: AdressageStepperProps) {
  const state = deriveStepperState(referral);
  if (!state) return null;
  const { currentStep, interrupted } = state;

  const timestamps: (string | null)[] = [
    formatDateShort(referral.createdAt),
    null,
    formatDateShort(referral.respondedAt),
    formatDateShort(referral.desiredAppointmentDate),
    null,
  ];

  const reached = currentStep + 1;
  const ariaLabel = interrupted
    ? `Parcours interrompu — ${reached} étape${reached > 1 ? "s" : ""} sur 5`
    : `Progression : ${reached} étape${reached > 1 ? "s" : ""} sur 5`;

  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className={cn("flex items-start w-full", className)}
    >
      {STEPPER_STEPS.map((step, i) => {
        const isDone = i <= currentStep;
        const isInterruptedLast = interrupted && i === currentStep;
        const isCurrent = !interrupted && i === currentStep + 1;
        const date = timestamps[i];

        return (
          <Fragment key={i}>
            {i > 0 && (
              <div
                aria-hidden="true"
                className={cn(
                  "h-[2px] flex-1 mt-[6px] min-[540px]:mt-[8px] min-w-[8px] rounded-full",
                  "transition-colors duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                  i <= currentStep ? "bg-[#2BA89C]" : "bg-[#E5E5E5]",
                )}
              />
            )}
            <div
              role="listitem"
              aria-current={isCurrent ? "step" : undefined}
              title={step.label}
              className="flex flex-col items-center shrink-0 max-w-[72px]"
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-full shrink-0",
                  "w-[14px] h-[14px] min-[540px]:w-[18px] min-[540px]:h-[18px]",
                  "transition-colors duration-300",
                  isDone && !isInterruptedLast && "bg-[#2BA89C]",
                  isInterruptedLast && "bg-[#A1A1AA]",
                  isCurrent && "bg-[#5B4EC4] animate-pulse",
                  !isDone && !isCurrent && "ring-1 ring-[#5B4EC4]/30 bg-transparent",
                )}
              >
                {isDone && (
                  <Check
                    className="w-2 h-2 min-[540px]:w-2.5 min-[540px]:h-2.5 text-white"
                    aria-hidden="true"
                    strokeWidth={3}
                  />
                )}
              </div>
              <span
                className={cn(
                  "sr-only min-[540px]:not-sr-only",
                  "min-[540px]:mt-1 min-[540px]:text-[11px] min-[540px]:leading-tight",
                  "min-[540px]:text-center min-[540px]:tracking-tight min-[540px]:px-0.5",
                  isDone || isCurrent
                    ? "min-[540px]:text-[#1A1A2E] min-[540px]:font-medium"
                    : "min-[540px]:text-[#1A1A2E]/50",
                )}
              >
                {step.label}
              </span>
              {date && (
                <span
                  className={cn(
                    "sr-only min-[540px]:not-sr-only",
                    "min-[540px]:mt-0.5 min-[540px]:text-[10px] min-[540px]:font-mono min-[540px]:text-[#8A8A96]",
                  )}
                >
                  {date}
                </span>
              )}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
