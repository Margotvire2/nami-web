"use client";

import Link from "next/link";
import { Route } from "lucide-react";

type SectionAnchor =
  | "documents"
  | "soignants"
  | "rendez-vous"
  | "suivi"
  | "bilans";

interface HubLinkButtonProps {
  /** ID du CareCase ciblé par le hub /parcours/[careCaseId]. */
  careCaseId: string;
  /** Libellé patient-facing du parcours (ex: caseTitle ou patientFacingTitle). */
  careCaseLabel: string;
  /**
   * Ancre optionnelle vers une section du hub (V2 — non utilisée côté hub
   * pour l'instant, mais pré-encodée pour éviter un breaking change ultérieur).
   */
  sectionAnchor?: SectionAnchor;
}

/**
 * Lien discret "Voir dans {parcours} →" placé dans les headers de groupes
 * CareCase des vues flat (/mes-soignants, /mes-bilans, /mes-documents,
 * /rendez-vous, /suivi).
 *
 * Cohérence Sprint V1.1 : chaque item ou groupe scoped CareCase doit ramener
 * au hub /parcours/[careCaseId] de son parcours.
 *
 * Wording MDR-safe : on parle uniquement de "parcours" (libellé administratif
 * autorisé), jamais de terme clinique.
 */
export function HubLinkButton({
  careCaseId,
  careCaseLabel,
  sectionAnchor,
}: HubLinkButtonProps) {
  const href = sectionAnchor
    ? `/parcours/${careCaseId}#${sectionAnchor}`
    : `/parcours/${careCaseId}`;

  return (
    <Link
      href={href}
      aria-label={`Ouvrir le parcours ${careCaseLabel}`}
      className="inline-flex items-center gap-1 text-[13px] font-medium text-[#5B4EC4] no-underline hover:underline whitespace-nowrap"
    >
      <Route size={14} strokeWidth={2} aria-hidden="true" />
      <span>Voir dans {careCaseLabel} →</span>
    </Link>
  );
}
