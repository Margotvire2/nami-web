/**
 * ConsentChip — SOLID (jamais glass).
 * Indicateur de consentement patient avec 3 états MDR :
 *   - ✓ Consentement (true)  → vert teal (sécurité)
 *   - ✗ Consentement manquant (false) → rouge (signal action requise)
 *   - À vérifier (null/undefined) → ambre neutre (signal "donnée à valider")
 *
 * Le data Referral actuel n'expose pas patientConsent en lecture ; ce composant
 * accepte null/undefined pour anticiper la maturation backend (ticket dédié).
 * Règle absolue : JAMAIS pré-coché ✓ par défaut.
 */

import { Check, X, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConsentChipProps {
  hasConsent: boolean | null | undefined;
  className?: string;
}

export function ConsentChip({ hasConsent, className }: ConsentChipProps) {
  if (hasConsent === true) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md",
          "text-[11px] font-medium whitespace-nowrap",
          "bg-[#E6F4F1] text-[#1a8a7e] ring-1 ring-[#1a8a7e]/20",
          className,
        )}
      >
        <Check className="size-3" strokeWidth={2.5} />
        Consentement
      </span>
    );
  }

  if (hasConsent === false) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md",
          "text-[11px] font-medium whitespace-nowrap",
          "bg-[#FCE9E9] text-[#D14545] ring-1 ring-[#D14545]/20",
          className,
        )}
      >
        <X className="size-3" strokeWidth={2.5} />
        Consentement manquant
      </span>
    );
  }

  // hasConsent === null || hasConsent === undefined → état "à vérifier"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md",
        "text-[11px] font-medium whitespace-nowrap",
        "bg-[#FBF1DD] text-[#B07820] ring-1 ring-[#B07820]/20",
        className,
      )}
    >
      <HelpCircle className="size-3" strokeWidth={2.5} />
      Consentement à vérifier
    </span>
  );
}
