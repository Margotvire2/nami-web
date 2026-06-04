"use client";

/**
 * F-WEB-COOKIE-BANNER-GDPR-V1
 *
 * Modal de réglage granulaire du consentement cookies. Trois catégories :
 *
 *   1. Strictement nécessaires : toggle désactivé, toujours "on" (session,
 *      authentification, mémorisation du choix de consentement).
 *   2. Mesure d'audience (analytics) : toggle utilisateur.
 *   3. Communication (marketing) : toggle utilisateur.
 *
 * Validation = bouton "Enregistrer mes choix" → persiste via
 * `savePreferences`. "Tout accepter" reste accessible en raccourci.
 *
 * Wording validé MDR : aucun champ sémantique clinique (alerte, surveillance,
 * détecter…). On reste sur "mesure d'audience", "organisation du service".
 */

import { useEffect, useState } from "react";
import { useCookieConsent } from "@/hooks/useCookieConsent";

type CookieSettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CookieSettingsModal({ open, onClose }: CookieSettingsModalProps) {
  const { consent, acceptAll, savePreferences } = useCookieConsent();
  const [analytics, setAnalytics] = useState(consent.analytics);
  const [marketing, setMarketing] = useState(consent.marketing);

  // Resync si le consent change pendant que la modal est ouverte (autre onglet).
  // setState ici est attendu : sync depuis source externe (storage event cross-tab).
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnalytics(consent.analytics);
    setMarketing(consent.marketing);
  }, [open, consent.analytics, consent.marketing]);

  // ESC ferme la modal.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleSave() {
    savePreferences({ analytics, marketing });
    onClose();
  }

  function handleAcceptAll() {
    acceptAll();
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-settings-title"
      data-testid="cookie-settings-modal"
      className="fixed inset-0 z-[9100] flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(26,26,46,0.18)] sm:p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2
            id="cookie-settings-title"
            className="text-xl font-semibold text-[#1A1A2E]"
          >
            Vos préférences de cookies
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-lg p-1 text-[#6B7280] transition hover:bg-[#F5F3EF] hover:text-[#1A1A2E]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-[#6B7280]">
          Choisissez les catégories de cookies que vous autorisez. Vos préférences
          peuvent être modifiées à tout moment depuis la page Confidentialité.
        </p>

        <div className="space-y-3">
          <CategoryRow
            title="Strictement nécessaires"
            description="Cookies essentiels au fonctionnement du service : session, authentification, mémorisation de vos choix de consentement. Sans eux, la plateforme ne peut pas fonctionner."
            checked
            disabled
            testId="cookie-cat-necessary"
          />

          <CategoryRow
            title="Mesure d'audience"
            description="Cookies de mesure d'audience (PostHog) qui nous aident à comprendre comment la plateforme est utilisée, afin d'en améliorer l'organisation. Aucune donnée n'est revendue à un tiers."
            checked={analytics}
            onChange={setAnalytics}
            testId="cookie-cat-analytics"
          />

          <CategoryRow
            title="Communication"
            description="Cookies permettant de personnaliser les communications relatives à votre utilisation du service. Désactivés par défaut."
            checked={marketing}
            onChange={setMarketing}
            testId="cookie-cat-marketing"
          />
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleAcceptAll}
            data-testid="cookie-settings-accept-all"
            className="rounded-lg border border-[rgba(26,26,46,0.12)] bg-white px-4 py-2 text-sm font-medium text-[#1A1A2E] transition hover:border-[#5B4EC4] hover:text-[#5B4EC4]"
          >
            Tout accepter
          </button>
          <button
            type="button"
            onClick={handleSave}
            data-testid="cookie-settings-save"
            className="rounded-lg bg-[#5B4EC4] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A3FAF]"
          >
            Enregistrer mes choix
          </button>
        </div>
      </div>
    </div>
  );
}

type CategoryRowProps = {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
  testId: string;
};

function CategoryRow({
  title,
  description,
  checked,
  disabled = false,
  onChange,
  testId,
}: CategoryRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-[rgba(26,26,46,0.06)] bg-[#FAFAF8] p-4">
      <div className="flex-1">
        <p className="mb-1 text-sm font-semibold text-[#1A1A2E]">{title}</p>
        <p className="text-xs leading-relaxed text-[#6B7280]">{description}</p>
      </div>
      <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          data-testid={testId}
          onChange={(e) => onChange?.(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={
            disabled
              ? "h-6 w-11 rounded-full bg-[#5B4EC4]/40 transition"
              : "h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-[#5B4EC4]"
          }
        />
        <span
          aria-hidden
          className={
            checked
              ? "absolute left-6 top-0.5 h-5 w-5 rounded-full bg-white shadow transition"
              : "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition"
          }
        />
      </label>
    </div>
  );
}
