"use client";

import { Plus } from "lucide-react";

interface QuickActionButtonProps {
  label: string;
  onClick?: () => void;
  comingSoon?: boolean;
}

export function QuickActionButton({
  label,
  onClick,
  comingSoon = false,
}: QuickActionButtonProps) {
  const disabled = comingSoon || !onClick;

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      title={comingSoon ? "Disponible en V2" : undefined}
      className={`group flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
        disabled
          ? "border-[#E8ECF4] bg-white text-[#6B7280] cursor-not-allowed opacity-60"
          : "border-[#5B4EC4]/20 bg-[#5B4EC4]/5 text-[#5B4EC4] hover:bg-[#5B4EC4] hover:text-white hover:border-[#5B4EC4]"
      }`}
      style={{ fontFamily: "var(--font-jakarta)" }}
    >
      <Plus
        size={14}
        className={disabled ? "" : "group-hover:rotate-90 transition-transform"}
      />
      {label}
      {comingSoon && (
        <span className="text-[10px] uppercase tracking-wide ml-1 bg-[#F0F2FA] text-[#6B7280] px-1.5 py-0.5 rounded">
          Bientôt
        </span>
      )}
    </button>
  );
}
