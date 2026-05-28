"use client";

import { useEffect, useRef } from "react";
import { User2 } from "lucide-react";
import type { SwitchableProfile } from "@/lib/api";

interface DelegationPickerModalProps {
  open: boolean;
  profiles: SwitchableProfile[];
  selectedPersonId: string | null;
  onSelect: (personId: string) => void;
  onConfirm: () => void;
  title?: string;
}

/**
 * Modal "Pour qui ?" — sélection radiogroup self vs délégations actives.
 * Réutilisable pour tout flow qui doit demander "pour qui ce RDV / message /
 * questionnaire" au patient connecté (parent → enfant, tuteur → protégé).
 *
 * RGPD : on n'affiche que firstName + lastName (pas de birthDate).
 * A11y : aria-modal + focus trap minimal + ESC pour fermer.
 */
export default function DelegationPickerModal({
  open,
  profiles,
  selectedPersonId,
  onSelect,
  onConfirm,
  title = "Pour qui souhaitez-vous prendre rendez-vous ?",
}: DelegationPickerModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus initial sur le bouton de confirmation à l'ouverture
  useEffect(() => {
    if (open) confirmButtonRef.current?.focus();
  }, [open]);

  // Focus trap minimal : Tab boucle entre éléments focusables
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delegation-picker-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[rgba(26,26,46,0.45)] backdrop-blur-sm p-0 sm:p-4"
    >
      <div
        ref={dialogRef}
        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-[rgba(26,26,46,0.06)] p-6 max-h-[90vh] overflow-y-auto"
      >
        <h2
          id="delegation-picker-title"
          className="text-lg font-semibold text-[#1A1A2E] mb-1"
        >
          {title}
        </h2>
        <p className="text-sm text-[#6B7280] mb-5">
          Choisissez le profil concerné par ce rendez-vous.
        </p>

        <fieldset
          role="radiogroup"
          aria-labelledby="delegation-picker-title"
          className="space-y-2"
          aria-live="polite"
        >
          <legend className="sr-only">Choix du profil</legend>
          {profiles.map((p) => {
            const isSelected = p.personId === selectedPersonId;
            const label = p.isSelf
              ? `Pour moi (${p.firstName} ${p.lastName})`
              : `Pour ${p.firstName} ${p.lastName}`;
            return (
              <label
                key={p.personId}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  isSelected
                    ? "border-[#5B4EC4] bg-[#EEEDFB]"
                    : "border-[rgba(26,26,46,0.08)] hover:bg-[#F5F3EF]"
                }`}
              >
                <input
                  type="radio"
                  name="delegation-picker"
                  value={p.personId}
                  checked={isSelected}
                  onChange={() => onSelect(p.personId)}
                  className="w-4 h-4 accent-[#5B4EC4] shrink-0"
                />
                <span
                  aria-hidden="true"
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    p.isSelf
                      ? "bg-gradient-to-br from-[#5B4EC4] to-[#2BA89C] text-white"
                      : "bg-[#F5F3EF] text-[#5B4EC4]"
                  }`}
                >
                  {p.isSelf ? (
                    <User2 className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-semibold">
                      {(p.firstName[0] ?? "").toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="flex-1 text-sm font-medium text-[#1A1A2E]">
                  {label}
                </span>
              </label>
            );
          })}
        </fieldset>

        <button
          ref={confirmButtonRef}
          type="button"
          onClick={onConfirm}
          disabled={!selectedPersonId}
          className="mt-6 w-full px-4 py-3 rounded-xl bg-[#5B4EC4] text-white font-semibold text-sm hover:bg-[#4A3FB0] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 focus-visible:ring-offset-2 transition-colors"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
