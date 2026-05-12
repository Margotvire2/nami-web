"use client";

/**
 * AdressageTabBar — glass-medium pill containers.
 * Tabs Entrants / Sortants avec compteurs.
 */

import { cn } from "@/lib/utils";

export type AdressageTabKey = "incoming" | "outgoing";

interface AdressageTabBarProps {
  tab: AdressageTabKey;
  onTabChange: (tab: AdressageTabKey) => void;
  incomingCount?: number;
  outgoingCount?: number;
  className?: string;
}

export function AdressageTabBar({
  tab,
  onTabChange,
  incomingCount,
  outgoingCount,
  className,
}: AdressageTabBarProps) {
  return (
    <div
      role="tablist"
      aria-label="Direction des adressages"
      className={cn("glass-medium rounded-xl p-1 inline-flex gap-1", className)}
    >
      <TabButton
        active={tab === "incoming"}
        onClick={() => onTabChange("incoming")}
        label="Entrants"
        count={incomingCount}
      />
      <TabButton
        active={tab === "outgoing"}
        onClick={() => onTabChange("outgoing")}
        label="Sortants"
        count={outgoingCount}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-medium transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40",
        active
          ? "bg-white/80 text-[#1A1A2E] shadow-sm"
          : "text-[#4A4A5A] hover:bg-white/40",
      )}
    >
      {label}
      {typeof count === "number" && (
        <span className="text-[#8A8A96] ml-1">({count})</span>
      )}
    </button>
  );
}
