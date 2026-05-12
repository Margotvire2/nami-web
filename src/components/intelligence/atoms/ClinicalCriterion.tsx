"use client";

/**
 * ClinicalCriterion — pill mono inline pour un critère clinique chiffré.
 * Phase 3.B.3 — porte `data-crit` pour la sympathie cross-card (hover
 * highlight toutes les occurrences du même key dans la page).
 *
 * Transition 320ms ease verrouillée par le brief.
 */

import type { ReactNode } from "react";
import { NAMI } from "./_tokens";

export default function ClinicalCriterion({
  critKey,
  children,
  onSympathy,
}: {
  critKey: string;
  children: ReactNode;
  onSympathy?: (critKey: string, on: boolean) => void;
}) {
  return (
    <span
      data-crit={critKey}
      onMouseEnter={onSympathy ? () => onSympathy(critKey, true) : undefined}
      onMouseLeave={onSympathy ? () => onSympathy(critKey, false) : undefined}
      style={{
        display: "inline",
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 500,
        fontSize: 13,
        color: NAMI.text,
        background: NAMI.violetSoft,
        padding: "2px 7px",
        borderRadius: 4,
        whiteSpace: "nowrap",
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.005em",
        cursor: onSympathy ? "pointer" : "default",
        transition: `background 320ms ${NAMI.ease}`,
      }}
    >
      {children}
    </span>
  );
}
