"use client";

/**
 * StatusBadge — SOLID, jamais glass.
 *
 * 4 statuts distincts (PENDING, IN_PROGRESS, COMPLETED, CANCELLED).
 * La couleur dérive de STATUS_CATEGORY mais le label reste l'invariant.
 */

import { CATEGORY_META, STATUS_CATEGORY, STATUS_LABEL } from "./_constants";
import { cn } from "@/lib/utils";

type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

interface StatusBadgeProps {
  status: TaskStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = STATUS_LABEL[status as TaskStatus] ?? status;
  const category = STATUS_CATEGORY[status as TaskStatus] ?? "pending";
  const meta = CATEGORY_META[category];
  return (
    <span
      aria-label={`Statut : ${label}`}
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md",
        "text-[11px] font-medium",
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
