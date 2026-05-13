"use client";

/**
 * TaskPeriodSection — section collapsible générique pour les périodes
 * "Aujourd'hui", "À venir", "Terminées" (pattern StatusSection adressages).
 *
 * `defaultCollapsed=true` sur "Terminées" pour respecter Q3 (réduire le bruit
 * visuel sur les tâches déjà closes).
 */

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TaskPeriodSectionProps {
  title: string;
  count: number;
  children: ReactNode;
  defaultCollapsed?: boolean;
}

export function TaskPeriodSection({
  title,
  count,
  children,
  defaultCollapsed = false,
}: TaskPeriodSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  if (count === 0) return null;
  return (
    <section className="mb-8">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
        className={cn(
          "flex items-center gap-2 mb-3 w-full text-left group",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 rounded",
        )}
      >
        <ChevronDown
          size={14}
          aria-hidden
          className={cn(
            "text-[#8A8A96] transition-transform",
            collapsed && "-rotate-90",
          )}
        />
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A2E]">
          {title}
        </span>
        <span className="text-[11px] font-mono text-[#8A8A96]">· {count}</span>
      </button>
      {!collapsed && <div className="space-y-2.5">{children}</div>}
    </section>
  );
}
