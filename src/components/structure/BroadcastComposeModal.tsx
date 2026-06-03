"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Megaphone, Users } from "lucide-react";
import { BroadcastComposer } from "@/components/broadcast/BroadcastComposer";
import { useOrgBroadcasts } from "@/hooks/useOrgBroadcasts";

interface BroadcastComposeModalProps {
  orgId: string;
  /** Nombre de membres actifs — alimente le compteur de destinataires. */
  memberCount: number;
  open: boolean;
  onClose: () => void;
}

type Targeting = "ALL_ACTIVE" | "BY_ROLE" | "BY_SPECIALTY";

/**
 * Modal de composition d'un broadcast email à destination des membres
 * d'une organisation. Wrap `BroadcastComposer` (sujet + corps markdown +
 * aperçu) et ajoute une section ciblage.
 *
 * V1 : seule l'option "Tous les membres actifs" est fonctionnelle —
 * "Par rôle" et "Par spécialité" sont des placeholders "V2" (le backend
 * V3-D, PR #149, n'accepte aujourd'hui qu'un envoi à tous les membres).
 *
 * Flow : compose → createDraft (DRAFT côté backend) → redirection vers la
 * page détail communications/[broadcastId] où l'envoi final est confirmé.
 */
export function BroadcastComposeModal({
  orgId,
  memberCount,
  open,
  onClose,
}: BroadcastComposeModalProps) {
  const router = useRouter();
  const { createDraft } = useOrgBroadcasts(orgId);
  const [targeting, setTargeting] = useState<Targeting>("ALL_ACTIVE");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fermeture sur Escape.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSubmit = useCallback(
    async (input: { subject: string; body: string }) => {
      setErrorMessage(null);
      try {
        const draft = await createDraft.mutateAsync(input);
        onClose();
        router.push(
          `/structure/${orgId}/admin/communications/${draft.id}`,
        );
      } catch (e) {
        setErrorMessage(
          e instanceof Error
            ? e.message
            : "Impossible d'enregistrer le brouillon. Réessayez.",
        );
      }
    },
    [createDraft, onClose, orgId, router],
  );

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="broadcast-compose-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#1A1A2E]/40 px-4 py-8 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-[#E8ECF4] bg-white shadow-xl"
        style={{ fontFamily: "var(--font-jakarta)" }}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#E8ECF4] px-6 py-4">
          <div className="flex items-start gap-3">
            <div
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEEDFB] text-[#5B4EC4]"
            >
              <Megaphone size={18} />
            </div>
            <div>
              <h2
                id="broadcast-compose-title"
                className="text-base font-bold text-[#0F172A]"
              >
                Nouveau broadcast
              </h2>
              <p className="text-xs text-[#6B7280]">
                Envoyez une communication écrite à votre réseau.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F0F2FA] hover:text-[#0F172A]"
          >
            <X size={16} />
          </button>
        </header>

        <div className="space-y-5 px-6 py-5">
          <section
            aria-labelledby="broadcast-targeting-heading"
            className="rounded-lg border border-[#E8ECF4] bg-[#FAFAF8] px-4 py-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3
                id="broadcast-targeting-heading"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#374151]"
              >
                <Users size={13} className="text-[#5B4EC4]" />
                Ciblage
              </h3>
              <span
                data-testid="broadcast-recipient-count"
                className="text-[11px] font-semibold text-[#5B4EC4]"
              >
                {memberCount} destinataire{memberCount > 1 ? "s" : ""}
              </span>
            </div>

            <fieldset className="space-y-1.5">
              <legend className="sr-only">Choisir le ciblage</legend>
              <label className="flex cursor-pointer items-start gap-2 text-xs text-[#374151]">
                <input
                  type="radio"
                  name="broadcast-targeting"
                  value="ALL_ACTIVE"
                  checked={targeting === "ALL_ACTIVE"}
                  onChange={() => setTargeting("ALL_ACTIVE")}
                  className="mt-0.5"
                />
                <span>
                  <span className="font-medium text-[#0F172A]">
                    Tous les membres actifs
                  </span>{" "}
                  — l&apos;email est envoyé à chaque membre dont l&apos;adhésion
                  est active et qui n&apos;a pas refusé les communications
                  réseau (RGPD Art. 21).
                </span>
              </label>
              <label className="flex cursor-not-allowed items-start gap-2 text-xs text-[#9CA3AF]">
                <input
                  type="radio"
                  name="broadcast-targeting"
                  value="BY_ROLE"
                  disabled
                  className="mt-0.5"
                />
                <span>
                  Par rôle (admin / animateur / membre) —{" "}
                  <span className="font-semibold">V2</span>
                </span>
              </label>
              <label className="flex cursor-not-allowed items-start gap-2 text-xs text-[#9CA3AF]">
                <input
                  type="radio"
                  name="broadcast-targeting"
                  value="BY_SPECIALTY"
                  disabled
                  className="mt-0.5"
                />
                <span>
                  Par spécialité (diététique, psychiatrie…) —{" "}
                  <span className="font-semibold">V2</span>
                </span>
              </label>
            </fieldset>
          </section>

          <BroadcastComposer
            isSubmitting={createDraft.isPending}
            submitLabel="Créer le brouillon"
            onSubmit={handleSubmit}
            errorMessage={errorMessage}
          />
        </div>
      </div>
    </div>
  );
}
