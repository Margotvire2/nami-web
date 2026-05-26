"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiWithToken } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

/**
 * Suppression de compte (RGPD Art. 17 — droit à l'effacement).
 *
 * Flow strict (cf. spec D2.C) :
 *   1. SI parcours actifs → Étape 1 garde-fou doux (liste + bouton "Je comprends")
 *      SINON → saute direct à Étape 2.
 *   2. Étape 2 : re-saisie "SUPPRIMER" (input texte). Bouton "Supprimer définitivement"
 *      activé UNIQUEMENT si input === "SUPPRIMER" (sensible à la casse).
 *   3. Succès 200 : toast + logout() + window.location.href = "/" (landing publique).
 *   4. 409 (déjà anonymisé, cas rare) : toast spécifique + même flow logout/redirect.
 *   5. Autre erreur : toast erreur, modal reste ouvert.
 *
 * Garde-fou doux conforme RGPD : il INFORME ne BLOQUE PAS (droit à l'effacement
 * Art. 17 ne peut pas être refusé pour cause de parcours en cours).
 *
 * Ne traite QUE le compte du user connecté (personId = self.id). Un parent ne
 * peut PAS supprimer le compte d'un enfant délégué via ce modal — c'est l'enfant
 * (à majorité) qui fait l'action sur son propre compte.
 */

const REQUIRED_PHRASE = "SUPPRIMER" as const;

export interface ActiveCareCaseSummary {
  id: string;
  caseTitle: string;
  /** Nom du soignant lead ou premier soignant de la liste, pour l'affichage garde-fou. */
  leadProviderFirstName: string | null;
}

interface DeleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personId: string;
  activeCareCases: ActiveCareCaseSummary[];
}

export function DeleteAccountModal({
  open,
  onOpenChange,
  personId,
  activeCareCases,
}: DeleteAccountModalProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const logout = useAuthStore((s) => s.logout);

  const hasActiveCases = activeCareCases.length > 0;
  // Étape 1 = garde-fou (si parcours actif), Étape 2 = re-saisie SUPPRIMER
  const [step, setStep] = useState<1 | 2>(hasActiveCases ? 1 : 2);
  const [phrase, setPhrase] = useState("");
  // F-DELETE-ACCOUNT-MODAL-A11Y-POLISH — focus initial sur input (pas Annuler)
  const phraseInputRef = useRef<HTMLInputElement>(null);

  // Reset à chaque ouverture (évite état persistant)
  useEffect(() => {
    if (open) {
      setStep(hasActiveCases ? 1 : 2);
      setPhrase("");
    }
  }, [open, hasActiveCases]);

  // Focus l'input dès qu'on entre en étape 2 (a11y : utilisateur tape direct)
  useEffect(() => {
    if (open && step === 2) {
      // requestAnimationFrame pour laisser Radix Dialog finir son mount
      const id = requestAnimationFrame(() => phraseInputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open, step]);

  const deleteMutation = useMutation({
    mutationFn: () => apiWithToken(accessToken!).persons.deleteGdpr(personId),
    onSuccess: () => {
      toast.success("Votre compte a été anonymisé conformément au RGPD (Art. 17)");
      logout();
      window.location.href = "/";
    },
    onError: (err: unknown) => {
      // Détection 409 "déjà anonymisé" via message d'erreur (le wrapper request
      // throw avec err.message contenant la réponse JSON)
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("déjà été anonymisé") || msg.includes("409")) {
        toast.success("Votre compte a déjà été anonymisé");
        logout();
        window.location.href = "/";
        return;
      }
      toast.error("Erreur lors de la suppression. Réessayez ou contactez le support.");
    },
  });

  const isConfirmValid = phrase === REQUIRED_PHRASE;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        // F-DELETE-ACCOUNT-MODAL-A11Y-POLISH — empêcher fermeture accidentelle
        // pendant une suppression en cours (Échap + click outside + close button).
        // Base UI gère nativement role=dialog/aria-modal/focus trap/body scroll lock.
        if (!nextOpen && deleteMutation.isPending) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#DC2626]" strokeWidth={2} aria-hidden="true" />
            <DialogTitle>Supprimer mon compte</DialogTitle>
          </div>
          <DialogDescription>
            Cette action est définitive et irréversible. Vos données seront anonymisées
            sous 30 jours, conformément au RGPD (Art. 17 — droit à l&apos;effacement).
          </DialogDescription>
        </DialogHeader>

        {step === 1 && hasActiveCases && (
          <div className="space-y-4 py-2">
            <div
              role="status"
              className="flex gap-3 p-4 rounded-xl border border-[rgba(217,38,38,0.2)] bg-[rgba(217,38,38,0.05)]"
            >
              <AlertTriangle
                className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5"
                strokeWidth={2}
              />
              <div className="text-sm text-[#1A1A2E] leading-relaxed">
                <p className="font-semibold mb-2">
                  Vous avez {activeCareCases.length} parcours en cours&nbsp;:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  {activeCareCases.map((c) => (
                    <li key={c.id}>
                      <span className="font-medium">{c.caseTitle}</span>
                      {c.leadProviderFirstName && (
                        <span className="text-[#6B7280]">
                          {" "}
                          avec Dr {c.leadProviderFirstName}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[#6B7280]">
                  La suppression de votre compte n&apos;arrête pas automatiquement vos
                  soins. Pensez à prévenir votre équipe soignante si nécessaire.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F5F3EF] transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#5B4EC4] hover:bg-[#4A3EA6] transition-colors"
              >
                Je comprends, continuer
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-2">
            <p className="text-sm text-[#374151] leading-relaxed">
              Pour confirmer la suppression définitive de votre compte, tapez{" "}
              <strong className="font-mono text-[#DC2626]">SUPPRIMER</strong> ci-dessous.
            </p>
            <input
              ref={phraseInputRef}
              type="text"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="SUPPRIMER"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-label="Tapez SUPPRIMER pour confirmer"
              aria-required="true"
              className="w-full px-3 py-2 rounded-lg border-2 border-[rgba(26,26,46,0.12)] focus:border-[#DC2626] focus:outline-none text-sm font-mono"
              disabled={deleteMutation.isPending}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F5F3EF] transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate()}
                disabled={!isConfirmValid || deleteMutation.isPending}
                aria-disabled={!isConfirmValid || deleteMutation.isPending}
                aria-busy={deleteMutation.isPending}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/50 focus-visible:ring-offset-2"
              >
                {deleteMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                )}
                {deleteMutation.isPending ? "Suppression…" : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
