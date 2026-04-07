"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  variant?: "default" | "subtle";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = "default",
}: EmptyStateProps) {
  const isSubtle = variant === "subtle";

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      isSubtle ? "py-8 px-4" : "py-16 px-6"
    )}>
      <div className={cn(
        "rounded-full flex items-center justify-center mb-4",
        isSubtle ? "w-10 h-10 bg-muted" : "w-14 h-14 bg-indigo-50"
      )}>
        <Icon size={isSubtle ? 18 : 24} className={isSubtle ? "text-muted-foreground" : "text-indigo-600"} />
      </div>

      <h3 className={cn(
        "font-semibold",
        isSubtle ? "text-sm text-foreground" : "text-base text-gray-900"
      )}>
        {title}
      </h3>

      <p className={cn(
        "mt-1.5 max-w-sm leading-relaxed",
        isSubtle ? "text-xs text-muted-foreground" : "text-sm text-gray-500"
      )}>
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-5">
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                isSubtle
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md"
              )}
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
