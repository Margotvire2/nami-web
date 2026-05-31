"use client";

import type { LucideIcon } from "lucide-react";

interface ConsoleStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  comingSoon?: boolean;
}

export function ConsoleStatCard({
  icon: Icon,
  label,
  value,
  hint,
  comingSoon = false,
}: ConsoleStatCardProps) {
  return (
    <div
      className={`rounded-xl border bg-white px-5 py-4 transition-shadow ${
        comingSoon
          ? "border-[#E8ECF4] opacity-70"
          : "border-[#E8ECF4] hover:shadow-md hover:shadow-[#5B4EC4]/5"
      }`}
      aria-disabled={comingSoon || undefined}
    >
      <div className="flex items-center gap-2 text-[#5B4EC4] mb-3">
        <Icon size={16} />
        <span
          className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="text-2xl font-bold text-[#0F172A] tabular-nums"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          {comingSoon ? "—" : value}
        </span>
        {comingSoon && (
          <span className="text-[10px] uppercase tracking-wide text-[#6B7280] bg-[#F0F2FA] px-1.5 py-0.5 rounded">
            Bientôt
          </span>
        )}
      </div>
      {hint && !comingSoon && (
        <p className="text-xs text-[#6B7280] mt-1">{hint}</p>
      )}
    </div>
  );
}
