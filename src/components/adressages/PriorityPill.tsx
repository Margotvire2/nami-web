/**
 * PriorityPill — SOLID (jamais glass).
 * Affiche la priorité ROUTINE / URGENT / EMERGENCY avec couleurs sacrées MDR.
 * EMERGENCY = pulse-dot animé pour signaler l'urgence cliniquement.
 */

import type { ReferralPriority } from "@/lib/api";
import { PRIORITY_META } from "./_constants";
import { cn } from "@/lib/utils";

interface PriorityPillProps {
  priority: ReferralPriority;
  className?: string;
}

export function PriorityPill({ priority, className }: PriorityPillProps) {
  const meta = PRIORITY_META[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full",
        "text-xs font-semibold whitespace-nowrap",
        meta.bgClass,
        meta.textClass,
        meta.ringClass,
        className,
      )}
    >
      {priority === "EMERGENCY" && (
        <span className="size-1.5 rounded-full bg-current animate-pulse" />
      )}
      {meta.label}
    </span>
  );
}
