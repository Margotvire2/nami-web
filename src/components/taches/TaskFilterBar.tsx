"use client";

/**
 * TaskFilterBar — glass-medium, chips SOLID actifs + search input glass-soft.
 *
 * Filtre client-side (le backend /tasks/mine renvoie déjà les tâches
 * accessibles à l'utilisateur). Le découpage "Mes tâches / Mes équipes" est
 * un raffinement UX local sur le champ `assignedTo`.
 */

import { TASK_FILTERS, type TaskFilterValue } from "./_constants";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskFilterBarProps {
  filter: TaskFilterValue;
  onFilterChange: (filter: TaskFilterValue) => void;
  searchValue: string;
  onSearchChange: (v: string) => void;
  counts?: Partial<Record<TaskFilterValue, number>>;
}

export function TaskFilterBar({
  filter,
  onFilterChange,
  searchValue,
  onSearchChange,
  counts,
}: TaskFilterBarProps) {
  return (
    <div className="glass-medium rounded-xl px-3 py-2 flex items-center gap-3 flex-wrap">
      <div role="tablist" className="flex items-center gap-1">
        {TASK_FILTERS.map((f) => {
          const isActive = filter === f.value;
          const count = counts?.[f.value];
          return (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onFilterChange(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40",
                isActive
                  ? "bg-white/80 text-[#1A1A2E] shadow-sm ring-1 ring-[#5B4EC4]/15"
                  : "text-[#4A4A5A] hover:bg-white/40",
              )}
            >
              {f.label}
              {typeof count === "number" && (
                <span
                  className={cn(
                    "ml-1.5 font-mono text-[10px]",
                    isActive ? "text-[#5B4EC4]" : "text-[#8A8A96]",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-w-[180px] relative">
        <Search
          size={14}
          aria-hidden
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A96]"
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher tâche, patient, description…"
          aria-label="Rechercher une tâche"
          className={cn(
            "w-full glass-soft rounded-lg pl-8 pr-3 py-1.5",
            "text-sm text-[#1A1A2E] placeholder:text-[#8A8A96]",
            "focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30",
          )}
        />
      </div>

      <kbd className="hidden md:inline-flex items-center px-2 py-1 rounded-md bg-white/70 text-[10px] font-mono text-[#8A8A96] ring-1 ring-[#1A1A2E]/10">
        ⌘K
      </kbd>
    </div>
  );
}
