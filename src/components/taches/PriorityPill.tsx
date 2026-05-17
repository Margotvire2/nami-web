"use client";

/**
 * PriorityPill — SOLID, jamais glass (donnée clinique sacrée, MDR).
 *
 * URGENT déclenche un pulse-dot animé (équivalent EMERGENCY du pattern
 * adressages). LOW/MEDIUM/HIGH affichent uniquement le label coloré.
 */

import { PRIORITY_LABEL, PRIORITY_META } from "./_constants";
import { cn } from "@/lib/utils";

type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface PriorityPillProps {
  priority: TaskPriority | string;
  className?: string;
}

export function PriorityPill({ priority, className }: PriorityPillProps) {
  const meta = PRIORITY_META[priority as TaskPriority];
  if (!meta) return null;
  const label = PRIORITY_LABEL[priority as TaskPriority] ?? priority;
  return (
    <span
      aria-label={`Priorité ${label}`}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full",
        "text-[11px] font-semibold uppercase tracking-wider",
        meta.bgClass,
        meta.textClass,
        meta.ringClass,
        className,
      )}
    >
      {meta.withDot && (
        <span className="size-1.5 rounded-full bg-current animate-pulse" />
      )}
      {label}
    </span>
  );
}
