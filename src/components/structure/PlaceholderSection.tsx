"use client";

import type { LucideIcon } from "lucide-react";

interface PlaceholderSectionProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function PlaceholderSection({
  icon: Icon,
  title,
  description,
}: PlaceholderSectionProps) {
  return (
    <div
      className="rounded-xl border border-dashed border-[#E8ECF4] bg-white/50 px-5 py-5 flex items-start gap-3"
      aria-disabled
    >
      <div className="w-8 h-8 rounded-lg bg-[#F0F2FA] text-[#5B4EC4] flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3
            className="font-semibold text-sm text-[#0F172A]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            {title}
          </h3>
          <span className="text-[10px] uppercase tracking-wide bg-[#F0F2FA] text-[#6B7280] px-1.5 py-0.5 rounded">
            Bientôt V2
          </span>
        </div>
        <p className="text-xs text-[#6B7280]">{description}</p>
      </div>
    </div>
  );
}
