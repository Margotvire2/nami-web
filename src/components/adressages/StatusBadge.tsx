/**
 * StatusBadge — SOLID (jamais glass).
 * Affiche le label distinct de chacun des 12 statuts (préservation MDR).
 * Couleur de fond = catégorie visuelle (active/pending/terminal) — JAMAIS un masquage du statut réel.
 */

import type { ReferralStatus } from "@/lib/api";
import { STATUS_LABEL, STATUS_CATEGORY, CATEGORY_META } from "./_constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ReferralStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = STATUS_LABEL[status];
  const category = STATUS_CATEGORY[status];
  const meta = CATEGORY_META[category];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md",
        "text-[11px] font-medium whitespace-nowrap",
        meta.bgClass,
        meta.textClass,
        meta.ringClass,
        className,
      )}
    >
      {label}
    </span>
  );
}
