"use client";

/**
 * StatusSection — wrapper section avec collapse optionnel.
 * Utilisé pour les groupes "À traiter", "En cours", "Aboutis", "Non aboutis".
 * Pas affiché si count === 0.
 */

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusSectionProps {
  title: string;
  count: number;
  children: ReactNode;
  defaultCollapsed?: boolean;
}

export function StatusSection({
  title,
  count,
  children,
  defaultCollapsed = false,
}: StatusSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  if (count === 0) return null;

  return (
    <section className="mb-6">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
        className="flex items-center gap-2 mb-3 w-full text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 rounded"
      >
        <ChevronDown
          className={cn(
            "size-4 text-[#8A8A96] transition-transform",
            collapsed && "-rotate-90",
          )}
          aria-hidden="true"
        />
        <span className="text-sm font-semibold text-[#1A1A2E]">{title}</span>
        <span className="text-xs text-[#8A8A96]">({count})</span>
      </button>
      {!collapsed && <div className="space-y-2.5">{children}</div>}
    </section>
  );
}
