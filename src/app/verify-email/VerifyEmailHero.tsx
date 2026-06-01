"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, Clock, Loader2, Mail, XCircle } from "lucide-react";

// 4 états visibles distincts + 1 état "no-token" (UI explicative quand l'utilisateur
// arrive sur /verify-email sans paramètre — par ex. depuis un signal d'erreur email).
export type VerifyStatus =
  | "loading"
  | "success"
  | "expired"
  | "invalid"
  | "no-token";

interface Props {
  status: VerifyStatus;
  onContinue: () => void;
  onBackToLogin: () => void;
}

// Palette cohérente avec /login et le design system Nami (CLAUDE.md) :
//   - Primaire violet  #5B4EC4 (loading + CTA neutres)
//   - Success green   #065F46
//   - Expired amber   #92400E
//   - Invalid red     #991B1B
//   - Fond crème      #FAFAF8
//   - Texte titres    #1A1A2E / muted #6B7280
const COLORS = {
  primary: "#5B4EC4",
  success: "#065F46",
  successBg: "#D1FAE5",
  expired: "#92400E",
  expiredBg: "#FEF3C7",
  invalid: "#991B1B",
  invalidBg: "#FEE2E2",
  bg: "#FAFAF8",
  cardBorder: "rgba(26,26,46,0.06)",
  title: "#1A1A2E",
  muted: "#6B7280",
  bodyText: "#374151",
};

export default function VerifyEmailHero({
  status,
  onContinue,
  onBackToLogin,
}: Props) {
  // Focus auto sur le CTA principal dès qu'un résultat (success/expired/invalid)
  // est rendu : a11y — l'utilisateur en navigation clavier sait où aller.
  const ctaRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (status === "loading") return;
    ctaRef.current?.focus();
  }, [status]);

  return (
    <main
      aria-label="Vérification de votre adresse email"
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: COLORS.bg }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white px-8 py-10 text-center"
        style={{
          border: `1px solid ${COLORS.cardBorder}`,
          boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
        }}
      >
        {/* Logo léger (cohérence /login) */}
        <img
          src="/nami-mascot.png"
          alt="Nami"
          className="mx-auto mb-8 w-10 h-10"
          style={{ borderRadius: 12, objectFit: "contain" }}
        />

        {/* Zone de status — annonce les changements de state aux lecteurs d'écran. */}
        <div
          role="status"
          aria-live="polite"
          aria-busy={status === "loading"}
        >
          {status === "loading" && <LoadingState />}
          {status === "success" && (
            <SuccessState ctaRef={ctaRef} onContinue={onContinue} />
          )}
          {status === "expired" && (
            <ExpiredState ctaRef={ctaRef} onBackToLogin={onBackToLogin} />
          )}
          {status === "invalid" && (
            <InvalidState ctaRef={ctaRef} onBackToLogin={onBackToLogin} />
          )}
          {status === "no-token" && (
            <NoTokenState ctaRef={ctaRef} onBackToLogin={onBackToLogin} />
          )}
        </div>
      </div>
    </main>
  );
}

// ── State : loading ──────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <>
      <div
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: "rgba(91,78,196,0.08)" }}
      >
        <Loader2
          aria-label="Vérification en cours"
          className="h-8 w-8 animate-spin"
          style={{ color: COLORS.primary }}
        />
      </div>
      <h1
        className="text-xl font-semibold mb-2"
        style={{
          color: COLORS.title,
          fontFamily: "var(--font-jakarta)",
        }}
      >
        Vérification en cours…
      </h1>
      <p className="text-sm" style={{ color: COLORS.muted }}>
        Nous confirmons votre adresse email. Cela prend quelques instants.
      </p>
    </>
  );
}

// ── State : success ──────────────────────────────────────────────────────────
function SuccessState({
  ctaRef,
  onContinue,
}: {
  ctaRef: React.RefObject<HTMLButtonElement | null>;
  onContinue: () => void;
}) {
  return (
    <>
      <div
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: COLORS.successBg }}
      >
        <CheckCircle2
          aria-hidden="true"
          className="h-8 w-8"
          style={{ color: COLORS.success }}
        />
      </div>
      <h1
        className="text-xl font-semibold mb-2"
        style={{
          color: COLORS.title,
          fontFamily: "var(--font-jakarta)",
        }}
      >
        Votre email est vérifié
      </h1>
      <p className="text-sm mb-6" style={{ color: COLORS.muted }}>
        Votre adresse est confirmée. Vous pouvez maintenant accéder à votre espace.
      </p>
      <button
        ref={ctaRef}
        type="button"
        onClick={onContinue}
        className="w-full h-11 rounded-xl text-sm font-semibold text-white border-0 transition-colors"
        style={{
          background: COLORS.primary,
          boxShadow: "0 2px 10px rgba(91,78,196,0.3)",
        }}
      >
        Continuer vers mon espace
      </button>
    </>
  );
}

// ── State : expired ──────────────────────────────────────────────────────────
function ExpiredState({
  ctaRef,
  onBackToLogin,
}: {
  ctaRef: React.RefObject<HTMLButtonElement | null>;
  onBackToLogin: () => void;
}) {
  return (
    <>
      <div
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: COLORS.expiredBg }}
      >
        <Clock
          aria-hidden="true"
          className="h-8 w-8"
          style={{ color: COLORS.expired }}
        />
      </div>
      <h1
        className="text-xl font-semibold mb-2"
        style={{
          color: COLORS.title,
          fontFamily: "var(--font-jakarta)",
        }}
      >
        Ce lien a expiré
      </h1>
      <p className="text-sm mb-6" style={{ color: COLORS.muted }}>
        Le lien de vérification n&apos;est plus valide. Reconnectez-vous pour
        recevoir un nouveau lien dans votre boîte mail.
      </p>
      <button
        ref={ctaRef}
        type="button"
        onClick={onBackToLogin}
        className="w-full h-11 rounded-xl text-sm font-semibold text-white border-0 transition-colors"
        style={{
          background: COLORS.primary,
          boxShadow: "0 2px 10px rgba(91,78,196,0.3)",
        }}
      >
        Retour à la connexion
      </button>
    </>
  );
}

// ── State : invalid ──────────────────────────────────────────────────────────
function InvalidState({
  ctaRef,
  onBackToLogin,
}: {
  ctaRef: React.RefObject<HTMLButtonElement | null>;
  onBackToLogin: () => void;
}) {
  return (
    <>
      <div
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: COLORS.invalidBg }}
      >
        <XCircle
          aria-hidden="true"
          className="h-8 w-8"
          style={{ color: COLORS.invalid }}
        />
      </div>
      <h1
        className="text-xl font-semibold mb-2"
        style={{
          color: COLORS.title,
          fontFamily: "var(--font-jakarta)",
        }}
      >
        Lien invalide
      </h1>
      <p className="text-sm mb-6" style={{ color: COLORS.muted }}>
        Ce lien de vérification est incorrect ou a déjà été utilisé.
        Connectez-vous pour demander un nouveau lien si nécessaire.
      </p>
      <button
        ref={ctaRef}
        type="button"
        onClick={onBackToLogin}
        className="w-full h-11 rounded-xl text-sm font-semibold text-white border-0 transition-colors"
        style={{
          background: COLORS.primary,
          boxShadow: "0 2px 10px rgba(91,78,196,0.3)",
        }}
      >
        Retour à la connexion
      </button>
    </>
  );
}

// ── State : no-token (UI explicative — pas de paramètre) ─────────────────────
function NoTokenState({
  ctaRef,
  onBackToLogin,
}: {
  ctaRef: React.RefObject<HTMLButtonElement | null>;
  onBackToLogin: () => void;
}) {
  return (
    <>
      <div
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: "rgba(91,78,196,0.08)" }}
      >
        <Mail
          aria-hidden="true"
          className="h-8 w-8"
          style={{ color: COLORS.primary }}
        />
      </div>
      <h1
        className="text-xl font-semibold mb-2"
        style={{
          color: COLORS.title,
          fontFamily: "var(--font-jakarta)",
        }}
      >
        Vérifiez votre boîte mail
      </h1>
      <p className="text-sm mb-6" style={{ color: COLORS.bodyText }}>
        Vous avez reçu un email avec un lien de vérification. Cliquez sur ce
        lien pour activer votre compte.
      </p>
      <p
        className="text-xs mb-6 px-4 py-3 rounded-xl"
        style={{
          color: COLORS.muted,
          background: "rgba(91,78,196,0.04)",
        }}
      >
        Pas reçu d&apos;email ? Vérifiez vos spams, puis reconnectez-vous pour
        en recevoir un nouveau.
      </p>
      <button
        ref={ctaRef}
        type="button"
        onClick={onBackToLogin}
        className="w-full h-11 rounded-xl text-sm font-semibold text-white border-0 transition-colors"
        style={{
          background: COLORS.primary,
          boxShadow: "0 2px 10px rgba(91,78,196,0.3)",
        }}
      >
        Retour à la connexion
      </button>
    </>
  );
}
