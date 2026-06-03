"use client";

import { useState } from "react";
import Link from "next/link";
import { Mic, X, Loader2, ExternalLink } from "lucide-react";
import { N } from "@/lib/design-tokens";
import { useAudioConsent } from "@/hooks/useAudioConsent";

type ApiErrorLike = { status?: number; body?: { error?: string } };

function describeError(err: unknown): string {
  const e = err as ApiErrorLike;
  if (e?.status === 403) {
    return "Le patient doit donner son accord depuis son propre espace « Mon compte › Confidentialité ». Vous pouvez recueillir un accord verbal dans la consultation, mais l'enregistrement ne peut être démarré qu'une fois le consentement consigné par le patient.";
  }
  if (err instanceof Error) return err.message;
  return "Impossible d'enregistrer la décision.";
}

export interface AudioConsentBannerProps {
  /** Patient (Person.id) dont on demande le consentement audio. */
  patientPersonId: string;
  /** Affichage uniquement, sert à personnaliser le wording. */
  patientName: string;
  /** Si false, la modale n'est pas rendue. */
  open: boolean;
  /** Appelé après un POST grant 201 réussi. */
  onAccepted: () => void;
  /** Appelé après un POST refus 201 réussi OU si l'utilisateur ferme sans poster. */
  onRefused: () => void;
  /** Fermeture demandée par le user (clic backdrop, croix). Distinct de onRefused. */
  onClose: () => void;
}

/**
 * Bandeau modal affiché avant le démarrage d'un enregistrement audio de
 * consultation. Recueille l'accord exprès du patient avant que la fonction
 * d'IA (transcription + brouillon de compte-rendu) ne traite la piste audio.
 *
 * Le caller est responsable de vérifier d'abord via `useAudioConsent.hasConsented`
 * — si déjà consenti, ne PAS rendre ce composant.
 */
export function AudioConsentBanner({
  patientPersonId,
  patientName,
  open,
  onAccepted,
  onRefused,
  onClose,
}: AudioConsentBannerProps) {
  const { grant, refuse } = useAudioConsent(patientPersonId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isBusy = grant.isPending || refuse.isPending;

  if (!open) return null;

  async function handleAccept() {
    setErrorMessage(null);
    try {
      await grant.mutateAsync({ source: "WEB" });
      onAccepted();
    } catch (err) {
      setErrorMessage(describeError(err));
    }
  }

  async function handleRefuse() {
    setErrorMessage(null);
    try {
      await refuse.mutateAsync({ source: "WEB" });
      onRefused();
    } catch (err) {
      setErrorMessage(describeError(err));
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audio-consent-title"
      aria-describedby="audio-consent-description"
      style={{
        position: "fixed",
        inset: 0,
        background: N.glassOverlayBg,
        backdropFilter: N.glassOverlayBlur,
        WebkitBackdropFilter: N.glassOverlayBlur,
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isBusy) onClose();
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 20,
          width: "100%",
          maxWidth: 520,
          padding: 28,
          boxShadow: "0 24px 64px rgba(26,26,46,0.18)",
          border: `1px solid ${N.border}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#EEEDFB",
                color: "#5B4EC4",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Mic size={18} aria-hidden />
            </span>
            <h2 id="audio-consent-title" style={{ fontSize: 17, fontWeight: 700, color: N.dark, margin: 0 }}>
              Enregistrer la consultation&nbsp;?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            aria-label="Fermer"
            style={{
              background: "transparent",
              border: "none",
              cursor: isBusy ? "not-allowed" : "pointer",
              color: N.textLight,
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <p
          id="audio-consent-description"
          style={{ fontSize: 13, color: N.textMid, lineHeight: 1.55, marginTop: 0, marginBottom: 14 }}
        >
          Cette consultation avec <strong>{patientName}</strong> peut être enregistrée et transcrite
          automatiquement, afin de générer un brouillon de compte-rendu structuré. La transcription
          est ensuite supprimée du sous-traitant et seule la version validée par le soignant est
          conservée dans le dossier.
        </p>

        <ul style={{ margin: "0 0 16px", padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
          {[
            "Aucune décision médicale n'est prise par l'IA — le brouillon est relu et validé par le soignant.",
            "Vous pouvez retirer votre accord à tout moment depuis « Mon compte › Confidentialité ».",
            "Refuser n'a aucune incidence sur la prise en charge — la consultation se poursuit normalement.",
          ].map((line, i) => (
            <li
              key={i}
              style={{
                fontSize: 12,
                color: N.textMid,
                lineHeight: 1.5,
                paddingLeft: 18,
                position: "relative",
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 4,
                  top: 7,
                  width: 6,
                  height: 6,
                  borderRadius: 6,
                  background: "#5B4EC4",
                }}
              />
              {line}
            </li>
          ))}
        </ul>

        <p style={{ fontSize: 12, color: N.textLight, lineHeight: 1.5, margin: "0 0 18px" }}>
          Détail des modèles utilisés et de vos droits :&nbsp;
          <Link
            href="/ai-act"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#5B4EC4", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            Transparence IA
            <ExternalLink size={11} aria-hidden />
          </Link>
        </p>

        {errorMessage && (
          <p
            role="alert"
            style={{
              marginTop: 0,
              marginBottom: 14,
              padding: 10,
              borderRadius: 8,
              background: N.dangerBg,
              color: N.danger,
              fontSize: 12,
              lineHeight: 1.4,
            }}
          >
            {errorMessage}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            type="button"
            onClick={handleRefuse}
            disabled={isBusy}
            style={{
              padding: "9px 16px",
              borderRadius: 10,
              border: `1px solid ${N.borderMed}`,
              background: "transparent",
              color: N.textMid,
              fontSize: 13,
              fontWeight: 500,
              cursor: isBusy ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {refuse.isPending && <Loader2 size={14} className="animate-spin" aria-hidden />}
            Refuser
          </button>
          <button
            type="button"
            onClick={handleAccept}
            disabled={isBusy}
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              border: "none",
              background: "#5B4EC4",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: isBusy ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              opacity: isBusy ? 0.7 : 1,
            }}
          >
            {grant.isPending && <Loader2 size={14} className="animate-spin" aria-hidden />}
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
