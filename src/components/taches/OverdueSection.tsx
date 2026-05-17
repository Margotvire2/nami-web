"use client";

/**
 * OverdueSection — section "En retard" avec pulse-dot rouge,
 * pattern EmergencySection de la refonte adressages.
 *
 * Le pulse-dot signale visuellement l'urgence organisationnelle (échéance
 * dépassée). Le wording reste compliance MDR — pas d'interprétation clinique.
 */

import type { ReactNode } from "react";

interface OverdueSectionProps {
  count: number;
  children: ReactNode;
}

export function OverdueSection({ count, children }: OverdueSectionProps) {
  if (count === 0) return null;
  return (
    <section className="mb-8" aria-label={`En retard, ${count} tâche${count > 1 ? "s" : ""}`}>
      <h2 className="flex items-center gap-2 mb-3">
        <span
          aria-hidden
          className="size-2 rounded-full bg-[#D14545] animate-pulse"
        />
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#D14545]">
          En retard
        </span>
        <span className="text-[11px] font-mono text-[#D14545]/70">· {count}</span>
      </h2>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}
