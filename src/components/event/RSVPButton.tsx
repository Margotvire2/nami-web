"use client";

import { useState } from "react";
import { Check, Loader2, LogOut, UserPlus } from "lucide-react";
import { ApiError } from "@/lib/api";
import type { ParticipantStatus } from "@/hooks/useEvent";

// RSVPButton — encapsule la logique d'inscription / désinscription self.
//
// V1 — Pas d'endpoint backend qui dit "suis-je inscrit ?" → on suit l'état
// local après mutation. Si le user a déjà rsvp dans la session, on a la valeur ;
// sinon on affiche "S'inscrire" par défaut, et 409 → on bascule en "Désinscrire".
//
// Le RBAC backend gère :
//  - 403 si visibilité interdite (PUBLIC/ORGANIZATION_MEMBERS/WORKING_GROUP)
//  - 409 si déjà inscrit (P2002)
//  - 410 si event annulé / terminé
//  - 404 si event introuvable

interface RSVPButtonProps {
  /** Statut UI dérivé de l'event (PAST / CANCELLED désactivent le bouton). */
  uiStatus: "SCHEDULED" | "OPEN" | "FULL" | "CANCELLED" | "PAST";
  /** Capacité atteinte (maxParticipants vs count). */
  isFull: boolean;
  /**
   * État connu de ma participation. Null = inconnu (initial), on tente l'inscription.
   * Si null + 409 sur rsvp → on switch vers REGISTERED localement.
   */
  myStatus: ParticipantStatus | null;
  onRsvp: () => Promise<{ id: string; status: ParticipantStatus }>;
  onUnregister: () => Promise<unknown>;
  isRsvping?: boolean;
  isUnregistering?: boolean;
  /** Callback après changement effectif — parent peut refetch. */
  onChange?: (newStatus: ParticipantStatus | null) => void;
}

export function RSVPButton({
  uiStatus,
  isFull,
  myStatus,
  onRsvp,
  onUnregister,
  isRsvping = false,
  isUnregistering = false,
  onChange,
}: RSVPButtonProps) {
  const [localStatus, setLocalStatus] = useState<ParticipantStatus | null>(
    myStatus,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Si l'event est terminé / annulé / brouillon → pas d'action utilisateur.
  if (uiStatus === "PAST" || uiStatus === "CANCELLED" || uiStatus === "SCHEDULED") {
    return null;
  }

  const isRegistered =
    localStatus === "REGISTERED" || localStatus === "WAITLIST" || localStatus === "CONFIRMED";

  async function handleRsvp() {
    setErrorMsg(null);
    try {
      const res = await onRsvp();
      setLocalStatus(res.status);
      onChange?.(res.status);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        // Déjà inscrit — synchronise l'UI.
        setLocalStatus("REGISTERED");
        onChange?.("REGISTERED");
        setErrorMsg("Vous êtes déjà inscrit");
      } else if (e instanceof ApiError) {
        setErrorMsg(e.message);
      } else {
        setErrorMsg("Erreur inattendue");
      }
    }
  }

  async function handleUnregister() {
    setErrorMsg(null);
    try {
      await onUnregister();
      setLocalStatus("CANCELLED");
      onChange?.("CANCELLED");
    } catch (e) {
      if (e instanceof ApiError) setErrorMsg(e.message);
      else setErrorMsg("Erreur inattendue");
    }
  }

  // Confirmation par l'admin (post-DPC) → bouton désactivé "Confirmé" + info.
  if (localStatus === "CONFIRMED") {
    return (
      <div className="flex flex-col gap-1">
        <button
          type="button"
          disabled
          aria-disabled="true"
          data-testid="rsvp-button-confirmed"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E8F4F2] px-4 py-2 text-sm font-semibold text-[#1F7368] cursor-not-allowed"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          <Check size={14} />
          Inscription confirmée
        </button>
        <p className="text-[11px] text-[#6B7280]">
          La désinscription n&apos;est plus possible après confirmation par l&apos;animateur.
        </p>
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={handleUnregister}
          disabled={isUnregistering}
          data-testid="rsvp-button-unregister"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E8ECF4] bg-white px-4 py-2 text-sm font-semibold text-[#6B7280] hover:border-[#FECACA] hover:text-[#991B1B] hover:bg-[#FEF2F2] transition-colors disabled:opacity-50"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          {isUnregistering ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <LogOut size={14} />
          )}
          Se désinscrire
        </button>
        {errorMsg && <p className="text-[11px] text-[#991B1B]">{errorMsg}</p>}
      </div>
    );
  }

  // Pas inscrit → S'inscrire (désactivé si FULL).
  const disabled = uiStatus === "FULL" || isFull || isRsvping;

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleRsvp}
        disabled={disabled}
        data-testid="rsvp-button-register"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5B4EC4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4F43AC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ fontFamily: "var(--font-jakarta)" }}
      >
        {isRsvping ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <UserPlus size={14} />
        )}
        {uiStatus === "FULL" || isFull ? "Complet" : "S'inscrire"}
      </button>
      {errorMsg && <p className="text-[11px] text-[#991B1B]">{errorMsg}</p>}
    </div>
  );
}
