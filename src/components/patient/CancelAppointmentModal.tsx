"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { apiWithToken, type PatientAppointment, type PatientCancelReason } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

const REASONS: Array<{
  value: PatientCancelReason;
  label: string;
  description: string;
}> = [
  {
    value: "PATIENT_UNAVAILABLE",
    label: "Je ne suis pas disponible",
    description: "Empêchement personnel ou professionnel",
  },
  {
    value: "PATIENT_NO_LONGER_NEEDED",
    label: "Ce RDV n'est plus nécessaire",
    description: "Le besoin de consultation a évolué",
  },
  {
    value: "PATIENT_FINANCIAL",
    label: "Raison financière",
    description: "Difficultés de prise en charge",
  },
];

interface CancelAppointmentModalProps {
  appointment: PatientAppointment & {
    providerName: string;
    /** Si annulation déléguée (parent annule pour enfant), nom de l'enfant. */
    onBehalfOfName?: string;
    /** Person.id de l'enfant si annulation déléguée. Passé au backend. */
    onBehalfOf?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CancelAppointmentModal({
  appointment,
  open,
  onOpenChange,
  onSuccess,
}: CancelAppointmentModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [reason, setReason] = useState<PatientCancelReason | null>(null);
  const [cancelNote, setCancelNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accessToken = useAuthStore((s) => s.accessToken);

  function resetAndClose() {
    setStep(1);
    setReason(null);
    setCancelNote("");
    setError(null);
    onOpenChange(false);
  }

  async function handleConfirm() {
    if (!reason || !accessToken) return;
    setLoading(true);
    setError(null);
    try {
      await apiWithToken(accessToken).patient.appointments.cancel(appointment.id, {
        reason,
        cancelNote: cancelNote.trim() || undefined,
        onBehalfOf: appointment.onBehalfOf,
      });
      onSuccess();
      resetAndClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'annulation";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        // Intercepter fermeture pendant API call (Échap + click backdrop)
        // pour éviter la fermeture pendant que la mutation est en vol.
        if (!o && loading) return;
        return o ? onOpenChange(true) : resetAndClose();
      }}
    >
      <DialogContent className="bg-[rgba(26,26,46,0.92)] backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md text-white">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                Annuler ce RDV
              </DialogTitle>
              <DialogDescription className="text-white/70 mt-2">
                {appointment.providerName} — {formatDate(appointment.startAt)}
                {appointment.onBehalfOfName && (
                  <>
                    {" "}· Au nom de <strong className="text-white">{appointment.onBehalfOfName}</strong>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-6">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setReason(r.value);
                    setStep(2);
                  }}
                  className="
                    w-full text-left p-4 rounded-xl
                    bg-white/5 hover:bg-white/10
                    border border-white/10
                    transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nami-primary,#5B4EC4)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E]
                  "
                >
                  <p className="font-semibold text-white">{r.label}</p>
                  <p className="text-sm text-white/60 mt-1">{r.description}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && reason && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                Confirmer l&apos;annulation
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/70">Raison sélectionnée</p>
              <p className="font-semibold text-white mt-1">
                {REASONS.find((r) => r.value === reason)?.label}
              </p>
            </div>

            <label className="block mt-6">
              <span className="text-sm text-white/70">Note (optionnel)</span>
              <textarea
                value={cancelNote}
                onChange={(e) => setCancelNote(e.target.value)}
                maxLength={500}
                rows={3}
                className="
                  mt-2 w-full p-3 rounded-xl
                  bg-white/5 border border-white/10
                  text-white placeholder:text-white/40
                  focus:border-[var(--nami-primary)] focus:ring-2 focus:ring-[var(--nami-primary)]/50 focus:outline-none
                  transition-all
                "
                placeholder="Précision facultative pour le soignant..."
              />
              <span className="text-xs text-white/40 mt-1 block">
                {cancelNote.length} / 500
              </span>
            </label>

            {error && (
              <p className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                {error}
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="
                  flex-1 py-3 rounded-xl border border-white/20
                  text-white/80 hover:bg-white/5 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nami-primary,#5B4EC4)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E]
                "
              >
                Retour
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                aria-busy={loading}
                className="
                  flex-1 py-3 rounded-xl
                  bg-gradient-to-r from-[var(--nami-primary)] to-[var(--nami-teal)]
                  text-white font-semibold
                  shadow-lg shadow-[var(--nami-primary)]/30
                  hover:shadow-xl hover:shadow-[var(--nami-primary)]/40
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nami-primary,#5B4EC4)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E]
                  inline-flex items-center justify-center gap-2
                "
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
                    </svg>
                    Annulation…
                  </>
                ) : (
                  "Confirmer l'annulation"
                )}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}
