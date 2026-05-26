"use client";

import { Loader2 } from "lucide-react";

interface BookingSubmitButtonProps {
  isSubmitting: boolean;
  disabled: boolean;
  onSubmit: () => void;
}

export default function BookingSubmitButton({
  isSubmitting,
  disabled,
  onSubmit,
}: BookingSubmitButtonProps) {
  return (
    <button
      type="button"
      onClick={onSubmit}
      disabled={disabled || isSubmitting}
      aria-busy={isSubmitting}
      className={[
        "w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-semibold text-sm transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4] focus-visible:ring-offset-2",
        disabled || isSubmitting
          ? "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
          : "bg-[#5B4EC4] text-white hover:bg-[#4A3FA8] hover:shadow-md",
      ].join(" ")}
    >
      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
      {isSubmitting ? "Envoi en cours…" : "Envoyer ma demande"}
    </button>
  );
}
