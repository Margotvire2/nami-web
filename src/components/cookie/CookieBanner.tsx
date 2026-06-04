"use client";

/**
 * F-WEB-COOKIE-BANNER-GDPR-V1
 *
 * Bannière de consentement cookies. S'affiche uniquement si l'utilisateur
 * n'a pas encore exprimé de choix (`hasDecision === false`). Trois actions :
 *
 *   1. "Tout accepter"           → analytics + marketing = true
 *   2. "Refuser non-essentiels"  → analytics + marketing = false
 *   3. "Personnaliser"           → ouvre la CookieSettingsModal
 *
 * Wording validé MDR : aucun verbe interdit (surveillance, monitoring,
 * détecter, alerter…). On parle de "mesure d'audience" et "organisation
 * du contenu" — vocabulaire RGPD safe.
 *
 * UI : palette Nami (#5B4EC4 primary, fond crème), fixed bottom, z-index
 * élevé pour passer au-dessus des contenus de page. Lien vers
 * /confidentialite (page existante) pour le détail.
 */

import { useState } from "react";
import Link from "next/link";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { CookieSettingsModal } from "./CookieSettingsModal";

export function CookieBanner() {
  const { hasDecision, hasHydrated, acceptAll, rejectNonEssential } = useCookieConsent();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Avant hydratation : on ne rend rien pour éviter un flash banner sur les
  // utilisateurs qui ont déjà choisi (sinon le SSR affiche, puis JS retire).
  if (!hasHydrated) return null;
  if (hasDecision) return null;

  return (
    <>
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-desc"
        data-testid="cookie-banner"
        className="fixed inset-x-0 bottom-0 z-[9000] border-t border-[rgba(26,26,46,0.08)] bg-[#FAFAF8] shadow-[0_-8px_32px_rgba(26,26,46,0.08)]"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5 md:flex-row md:items-center md:gap-6">
          <div className="flex-1 text-sm leading-relaxed text-[#374151]">
            <p id="cookie-banner-title" className="mb-1 font-semibold text-[#1A1A2E]">
              Vos préférences en matière de cookies
            </p>
            <p id="cookie-banner-desc">
              Nami utilise des cookies strictement nécessaires au fonctionnement du service.
              Avec votre accord, des cookies de mesure d&apos;audience nous aident à améliorer
              l&apos;organisation de la plateforme. Vous pouvez modifier vos choix à tout moment.{" "}
              <Link
                href="/confidentialite"
                className="font-medium text-[#5B4EC4] underline-offset-2 hover:underline"
              >
                En savoir plus
              </Link>
              .
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap md:flex-nowrap md:gap-3">
            <button
              type="button"
              data-testid="cookie-banner-customize"
              onClick={() => setSettingsOpen(true)}
              className="rounded-lg border border-[rgba(26,26,46,0.12)] bg-white px-4 py-2 text-sm font-medium text-[#1A1A2E] transition hover:border-[#5B4EC4] hover:text-[#5B4EC4]"
            >
              Personnaliser
            </button>
            <button
              type="button"
              data-testid="cookie-banner-reject"
              onClick={rejectNonEssential}
              className="rounded-lg border border-[rgba(26,26,46,0.12)] bg-white px-4 py-2 text-sm font-medium text-[#1A1A2E] transition hover:border-[#5B4EC4] hover:text-[#5B4EC4]"
            >
              Refuser non-essentiels
            </button>
            <button
              type="button"
              data-testid="cookie-banner-accept"
              onClick={acceptAll}
              className="rounded-lg bg-[#5B4EC4] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A3FAF]"
            >
              Tout accepter
            </button>
          </div>
        </div>
      </div>

      {settingsOpen ? (
        <CookieSettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}
    </>
  );
}
