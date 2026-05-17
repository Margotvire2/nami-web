"use client";

/**
 * TaskCard — glass-soft rounded-xl, pattern AdressageCard adapté pour Task.
 *
 * Variante "en retard" : border-l 3px rouge + dégradé wash, calquée sur le
 * pattern EmergencySection de la refonte adressages.
 *
 * Checkbox "Marquer terminée" SOLID (action état, jamais glass). Clic sur
 * la zone titre/description ouvre la sheet détail. Clic checkbox arrête la
 * propagation et déclenche directement la mutation status=COMPLETED.
 */

import type { TaskWithContext } from "@/lib/api";
import { Calendar, Check, ChevronRight, User } from "lucide-react";
import { PriorityPill } from "./PriorityPill";
import { StatusBadge } from "./StatusBadge";
import { isOverdue, patientLabel, relativeDate } from "./_utils";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: TaskWithContext;
  onClick: (task: TaskWithContext) => void;
  onComplete?: (task: TaskWithContext) => void;
  className?: string;
}

export function TaskCard({
  task,
  onClick,
  onComplete,
  className,
}: TaskCardProps) {
  const overdue = isOverdue(task);
  const isCompleted = task.status === "COMPLETED";
  const isCancelled = task.status === "CANCELLED";
  const isTerminal = isCompleted || isCancelled;

  return (
    <div
      className={cn(
        "group glass-soft rounded-xl",
        "transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:bg-white/60 hover:-translate-y-px hover:shadow-md",
        overdue && [
          "border-l-[3px] border-l-[#D14545]",
          "bg-gradient-to-r from-[#FCE9E9]/40 to-transparent",
        ],
        isTerminal && "opacity-60",
        className,
      )}
    >
      <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3 px-5 py-4">
        {/* Checkbox : compléter (SOLID, jamais glass) */}
        {!isTerminal && onComplete ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onComplete(task);
            }}
            aria-label="Marquer terminée"
            className={cn(
              "mt-0.5 size-5 rounded-md ring-1 ring-[#1A1A2E]/15 bg-white/80",
              "hover:bg-[#5B4EC4]/10 hover:ring-[#5B4EC4]/40",
              "transition flex items-center justify-center",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40",
            )}
          >
            <Check
              size={14}
              className="text-[#5B4EC4] opacity-0 group-hover:opacity-100 transition"
              aria-hidden
            />
          </button>
        ) : isCompleted ? (
          <span
            aria-label="Terminée"
            className="mt-0.5 size-5 rounded-md bg-[#E6F4F1] flex items-center justify-center ring-1 ring-[#1a8a7e]/20"
          >
            <Check size={14} className="text-[#1a8a7e]" aria-hidden />
          </span>
        ) : (
          <span className="mt-0.5 size-5 rounded-md bg-[#F3F4F6] ring-1 ring-[#6B7280]/20" />
        )}

        {/* Body (clickable → sheet) */}
        <button
          type="button"
          onClick={() => onClick(task)}
          className={cn(
            "min-w-0 text-left",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 rounded",
          )}
        >
          <div className="flex items-start gap-2 flex-wrap">
            <h3
              className={cn(
                "font-semibold text-sm truncate flex-1 min-w-0",
                isCompleted
                  ? "text-[#4A4A5A] line-through"
                  : "text-[#1A1A2E]",
              )}
            >
              {task.title}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
              <PriorityPill priority={task.priority} />
              <StatusBadge status={task.status} />
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-[#4A4A5A] mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2 flex-wrap text-[11px] text-[#6B7280]">
            {task.careCase?.patient && (
              <span className="inline-flex items-center gap-1 font-medium text-[#5B4EC4]">
                <User size={11} aria-hidden />
                {patientLabel(task)}
              </span>
            )}
            {task.dueDate && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-mono",
                  overdue ? "text-[#D14545] font-semibold" : "text-[#6B7280]",
                )}
              >
                <Calendar size={11} aria-hidden />
                {relativeDate(task.dueDate)}
              </span>
            )}
            {task.assignedTo && (
              <span className="text-[#8A8A96]">
                Pour {task.assignedTo.firstName} {task.assignedTo.lastName}
              </span>
            )}
          </div>
        </button>

        {/* Chevron */}
        <ChevronRight
          size={16}
          className="text-[#8A8A96] mt-0.5 shrink-0 group-hover:text-[#5B4EC4] transition"
          aria-hidden
        />
      </div>
    </div>
  );
}
