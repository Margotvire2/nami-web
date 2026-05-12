/**
 * EmergencySection — wrapper section EMERGENCY toujours en tête.
 * Header avec pulse-dot animé pour signaler l'urgence clinique.
 * Pas affiché si count === 0.
 */

import type { ReactNode } from "react";

interface EmergencySectionProps {
  count: number;
  children: ReactNode;
}

export function EmergencySection({ count, children }: EmergencySectionProps) {
  if (count === 0) return null;
  return (
    <section className="mb-6" aria-label="Urgences cliniques">
      <h2 className="flex items-center gap-2 mb-3">
        <span
          className="size-2 rounded-full bg-[#D14545] animate-pulse"
          aria-hidden="true"
        />
        <span className="text-sm font-bold uppercase tracking-wider text-[#D14545]">
          Urgences cliniques · {count}
        </span>
      </h2>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}
