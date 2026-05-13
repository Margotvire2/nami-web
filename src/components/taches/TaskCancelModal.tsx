"use client";

/**
 * TaskCancelModal — modal annulation, motif obligatoire ≥10 chars.
 *
 * Pattern DeclineReasonModal adapté. Le modèle Prisma Task n'a pas de champ
 * `cancelReason` dédié (matrice de gel V2.1) — le motif est appendé à
 * `description` via `buildCancelDescription()` côté caller, et tracé via
 * l'audit middleware existant sur PATCH /care-cases/:id/tasks/:id.
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface TaskCancelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<void> | void;
}

const MIN_REASON_LEN = 10;

export function TaskCancelModal({
  open,
  onOpenChange,
  onConfirm,
}: TaskCancelModalProps) {
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
            Annuler cette tâche
          </DialogTitle>
          <DialogDescription className="text-sm text-[#4A4A5A] mt-1">
            Pour la traçabilité de votre cabinet, merci d'indiquer la raison de
            l'annulation. Cette information est confidentielle et tracée dans
            l'audit log de la coordination.
          </DialogDescription>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Ex : décision modifiée, doublon, action déjà réalisée ailleurs, patient non joignable…"
            aria-label="Motif d'annulation"
            className={cn(
              "mt-4 w-full rounded-lg border border-[#1A1A2E]/10 bg-white/70",
              "px-3 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/40",
            )}
          />
          <p
            className="text-[11px] text-[#8A8A96] mt-1.5"
            aria-live="polite"
          >
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
              Retour
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleConfirm}
              className={cn(
                "px-4 py-2 rounded-lg bg-[#D14545] text-white",
                "hover:bg-[#b73838] transition shadow-sm",
                "text-sm font-semibold",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D14545]/40",
              )}
            >
              {submitting ? "En cours…" : "Confirmer l'annulation"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
