"use client";

/**
 * DeclineReasonModal — modal de saisie du motif de refus.
 *
 * Audit MDR : jamais de refus silencieux. Le motif (≥ 10 chars) est obligatoire
 * et tracé dans l'audit log côté backend via `referralsApi.respond(id, "DECLINED", responseNote)`.
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DeclineReasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<void> | void;
}

const MIN_REASON_LEN = 10;

export function DeclineReasonModal({
  open,
  onOpenChange,
  onConfirm,
}: DeclineReasonModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = reason.trim().length >= MIN_REASON_LEN && !submitting;

  async function handleConfirm() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong !p-0 !border-0 !bg-transparent !shadow-2xl max-w-md">
        <div className="rounded-2xl p-6">
          <DialogTitle className="text-lg font-bold text-[#1A1A2E]">
            Motif de refus
          </DialogTitle>
          <DialogDescription className="text-sm text-[#4A4A5A] mt-1">
            Pour la traçabilité de votre cabinet et de l'adressage, merci d'indiquer
            la raison du refus. Cette information est confidentielle et tracée dans
            l'audit log.
          </DialogDescription>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Ex : spécialité hors compétence, agenda complet sur les 3 prochains mois, etc."
            aria-label="Motif du refus"
            className={cn(
              "mt-4 w-full rounded-lg border border-[#1A1A2E]/10 bg-white/70",
              "px-3 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/40",
            )}
          />
          <p className="text-[11px] text-[#8A8A96] mt-1.5" aria-live="polite">
            {reason.trim().length}/{MIN_REASON_LEN} caractères minimum
          </p>
          <div className="flex justify-end gap-2 mt-5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className={cn(
                "px-4 py-2 rounded-lg glass-soft",
                "text-sm font-medium text-[#4A4A5A]",
                "hover:bg-white/60 transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40",
              )}
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleConfirm}
              className={cn(
                "px-4 py-2 rounded-lg bg-[#D14545] text-white text-sm font-semibold",
                "hover:bg-[#b73838] transition shadow-sm",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D14545]/40",
              )}
            >
              {submitting ? "En cours…" : "Confirmer le refus"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
