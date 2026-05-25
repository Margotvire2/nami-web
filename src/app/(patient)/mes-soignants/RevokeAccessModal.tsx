"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, ShieldOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AuthorizedProvider } from "./mock-data";

interface RevokeAccessModalProps {
  provider: AuthorizedProvider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Confirmation de révocation. V1 = simulation (console.info + close).
   * V2 = appel API via ticket F-MES-SOIGNANTS-REVOKE-API-INTEGRATION.
   */
  onConfirm: (provider: AuthorizedProvider) => Promise<void> | void;
}

/**
 * Modal de confirmation de révocation d'accès.
 *
 * Pattern Base UI strict (cf. PR #64 / DeleteAccountModal) :
 *   - Dialog wrapper @/components/ui/dialog (Root/Portal/Backdrop/Popup interne)
 *   - Échap natif + click outside natifs
 *   - Interrupt guard pendant la simulation (safeOnOpenChange)
 *   - Focus initial sur "Annuler" (best practice : pas sur le bouton danger)
 *   - aria-busy={confirming} sur le bouton danger
 *
 * Wording MDR-safe :
 *   - "Ce soignant n'aura plus accès à vos données" (pas "à vos soins")
 *   - "ré-accorder l'accès" (pas "réactiver le suivi")
 */
export function RevokeAccessModal({
  provider,
  open,
  onOpenChange,
  onConfirm,
}: RevokeAccessModalProps) {
  const [confirming, setConfirming] = useState(false);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);

  // Reset état lors d'une réouverture
  useEffect(() => {
    if (open) {
      setConfirming(false);
      // Focus initial sur "Annuler" (best practice modale destructive)
      const raf = requestAnimationFrame(() => {
        cancelBtnRef.current?.focus();
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [open]);

  // Interrupt guard : pendant la simulation, on bloque toute tentative de fermeture
  function safeOnOpenChange(next: boolean) {
    if (confirming && !next) return;
    onOpenChange(next);
  }

  async function handleConfirm() {
    if (!provider || confirming) return;
    setConfirming(true);
    try {
      // V1 = simulation 600ms pour donner un retour visuel cohérent
      await new Promise((resolve) => setTimeout(resolve, 600));
      await onConfirm(provider);
    } finally {
      setConfirming(false);
    }
  }

  // Si pas de provider sélectionné, on ne rend rien (évite flash modal vide)
  if (!provider) {
    return null;
  }

  const fullName = `${provider.firstName} ${provider.lastName}`;

  return (
    <Dialog open={open} onOpenChange={safeOnOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldOff
              className="w-5 h-5 text-[#DC2626]"
              strokeWidth={2}
              aria-hidden="true"
            />
            <DialogTitle>
              Révoquer l&apos;accès de {fullName}&nbsp;?
            </DialogTitle>
          </div>
          <DialogDescription>
            Ce soignant n&apos;aura plus accès à vos données après confirmation.
            Vous pourrez à tout moment lui ré-accorder l&apos;accès.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 pt-2">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={() => safeOnOpenChange(false)}
            disabled={confirming}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F5F3EF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 transition-colors duration-150 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirming}
            aria-busy={confirming}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {confirming && (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            )}
            Révoquer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
