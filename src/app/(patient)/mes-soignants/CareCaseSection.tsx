"use client";

import { Loader2 } from "lucide-react";
import { MesSoignantsList } from "./MesSoignantsList";
import type { AuthorizedProvider } from "./mock-data";
import type { PatientCareCaseSummary } from "./types";

interface CareCaseSectionProps {
  careCase: PatientCareCaseSummary;
  providers: AuthorizedProvider[];
  isLoading: boolean;
  isError: boolean;
  onRevoke: (provider: AuthorizedProvider) => void;
}

/**
 * Section d'un CareCase : titre + nb soignants + liste réutilisant
 * `MesSoignantsCard` via `MesSoignantsList`.
 *
 * États gérés :
 *   - isLoading : spinner discret (le hero compte aussi)
 *   - isError   : message générique (pas de détail technique côté patient)
 *   - empty     : phrase "Aucun soignant rattaché à ce parcours"
 *
 * Wording MDR-safe : "parcours de soins" est autorisé (libellé administratif),
 * mais on évite "prise en charge", "suivi", "vigilance".
 */
export function CareCaseSection({
  careCase,
  providers,
  isLoading,
  isError,
  onRevoke,
}: CareCaseSectionProps) {
  const count = providers.length;
  const headerId = `care-case-${careCase.id}-title`;

  return (
    <section aria-labelledby={headerId} className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id={headerId}
          className="text-lg md:text-xl font-semibold text-[#1A1A2E] tracking-tight"
        >
          {careCase.caseTitle}
        </h2>
        {!isLoading && !isError && (
          <span className="text-sm text-[#6B7280] shrink-0">
            {count === 0
              ? "Aucun soignant"
              : `${count} soignant${count > 1 ? "s" : ""}`}
          </span>
        )}
      </div>

      {isLoading ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 text-sm text-[#6B7280] py-4"
        >
          <Loader2
            className="w-4 h-4 animate-spin"
            aria-hidden="true"
            strokeWidth={2}
          />
          Chargement des soignants…
        </div>
      ) : isError ? (
        <p
          role="alert"
          className="text-sm text-[#DC2626] bg-[rgba(220,38,38,0.05)] border border-[rgba(220,38,38,0.18)] rounded-xl p-4"
        >
          Impossible de charger les soignants de ce parcours pour le moment.
          Réessayez dans un instant.
        </p>
      ) : count === 0 ? (
        <p className="text-sm text-[#6B7280] bg-white border border-[rgba(26,26,46,0.08)] rounded-xl p-5">
          Aucun soignant n&apos;est rattaché à ce parcours pour le moment.
        </p>
      ) : (
        <MesSoignantsList providers={providers} onRevoke={onRevoke} />
      )}
    </section>
  );
}
