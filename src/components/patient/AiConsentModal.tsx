"use client";

/**
 * AiConsentModal — Recueil du consentement AI_PROCESSING (RGPD Art. 6(1)(a))
 *
 * Affiché quand une fonctionnalité IA renvoie 403 { code: "AI_CONSENT_REQUIRED" }.
 *
 * Wording : factuel et neutre — aucun terme médical d'aide à la décision (MDR).
 * "Accepter" → POST /patient/consents { consentType: "AI_PROCESSING", granted: true }
 * "Refuser"  → POST /patient/consents { consentType: "AI_PROCESSING", granted: false }
 *              ou simple fermeture (pas d'appel si déjà refusé)
 *
 * Architecture : le store `useAiConsentModalStore` expose `open()`.
 * Les call-sites qui reçoivent une ApiError 403 AI_CONSENT_REQUIRED
 * appellent `useAiConsentModalStore.getState().open()`.
 */

import { create } from "zustand";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
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

// ─── Store Zustand ────────────────────────────────────────────────────────────

interface AiConsentModalStore {
  isOpen: boolean;
  /** Callback déclenché après acceptation (optionnel — pour retry l'action) */
  onAccepted?: () => void;
  open: (opts?: { onAccepted?: () => void }) => void;
  close: () => void;
}

export const useAiConsentModalStore = create<AiConsentModalStore>((set) => ({
  isOpen: false,
  onAccepted: undefined,
  open: (opts) => set({ isOpen: true, onAccepted: opts?.onAccepted }),
  close: () => set({ isOpen: false, onAccepted: undefined }),
}));

// ─── Composant ────────────────────────────────────────────────────────────────

export function AiConsentModal() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const { isOpen, onAccepted, close } = useAiConsentModalStore();

  const api = apiWithToken(accessToken!);

  const grantMutation = useMutation({
    mutationFn: (granted: boolean) => {
      if (!user?.id) throw new Error("Utilisateur introuvable");
      return api.persons.grantConsent(user.id, {
        consentType: "AI_PROCESSING",
        granted,
        scope: null,
        source: "WEB",
      });
    },
    onSuccess: (_data, granted) => {
      qc.invalidateQueries({ queryKey: ["consents-matrix"] });
      if (granted) {
        toast.success("Accord enregistré");
        onAccepted?.();
      } else {
        toast("Traitement IA désactivé. Vous pouvez modifier ce choix dans vos réglages.");
      }
      close();
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement. Réessayez.");
    },
  });

  const isLoading = grantMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isLoading) close(); }}>
      <DialogContent
        style={{
          maxWidth: 440,
          borderRadius: 20,
          padding: 0,
          overflow: "hidden",
          border: "1px solid var(--nami-border)",
        }}
      >
        {/* En-tête */}
        <DialogHeader style={{ padding: "24px 24px 0" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "var(--nami-primary-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <Sparkles size={20} color={"var(--nami-primary)"} strokeWidth={2} />
          </div>
          <DialogTitle
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "var(--nami-dark)",
              lineHeight: 1.3,
            }}
          >
            Traitement de vos données par l&apos;IA
          </DialogTitle>
          <DialogDescription
            style={{
              fontSize: 14,
              color: "var(--nami-text-muted)",
              lineHeight: 1.6,
              marginTop: 8,
            }}
          >
            Nami utilise des services d&apos;intelligence artificielle (transcription,
            structuration de compte rendu) pour vous aider à organiser votre dossier
            de coordination.
            <br /><br />
            Vos données sont transmises de manière pseudonymisée à nos prestataires.
            Vous pouvez retirer votre accord à tout moment dans vos réglages.
          </DialogDescription>
        </DialogHeader>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "20px 24px 24px",
          }}
        >
          <button
            type="button"
            disabled={isLoading}
            onClick={() => grantMutation.mutate(true)}
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: 12,
              border: "none",
              background: "var(--nami-primary)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              cursor: isLoading ? "wait" : "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: isLoading ? 0.8 : 1,
            }}
          >
            {isLoading && grantMutation.variables === true ? (
              <Loader2 size={15} className="animate-spin" />
            ) : null}
            Accepter
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => grantMutation.mutate(false)}
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: 12,
              border: "1.5px solid var(--nami-border)",
              background: "var(--nami-card)",
              color: "var(--nami-text-muted)",
              fontSize: 15,
              fontWeight: 500,
              cursor: isLoading ? "wait" : "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {isLoading && grantMutation.variables === false ? (
              <Loader2 size={15} className="animate-spin" />
            ) : null}
            Refuser
          </button>
          <p
            style={{
              fontSize: 11,
              color: "var(--nami-text-muted)",
              textAlign: "center",
              lineHeight: 1.5,
              marginTop: 4,
            }}
          >
            En refusant, les fonctionnalités d&apos;analyse automatique sont désactivées.
            Les autres fonctionnalités de Nami restent disponibles.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
