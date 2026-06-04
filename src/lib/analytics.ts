"use client";

/**
 * F-WEB-COOKIE-BANNER-GDPR-V1
 *
 * Wrapper centralisé pour les events analytics. Garde-fou RGPD : aucun event
 * n'est tiré tant que `consent.analytics !== true`. Source de vérité : le
 * localStorage écrit par `useCookieConsent`.
 *
 * Tous les call-sites existants qui utilisaient directement `posthog.capture`
 * ou l'objet `track` doivent passer par `analytics.capture` / `analytics.track`
 * pour bénéficier du gating consent.
 *
 * Côté serveur (SSR) : `hasAnalyticsConsent()` retourne `false` — pas d'event.
 */

import { posthog, initPostHog } from "./posthog";
import { readCookieConsent } from "@/hooks/useCookieConsent";

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  return readCookieConsent().analytics === true;
}

export function hasMarketingConsent(): boolean {
  if (typeof window === "undefined") return false;
  return readCookieConsent().marketing === true;
}

/**
 * Capture un event uniquement si l'analytics consent est actif. Sinon :
 * no-op silencieux. Garantit que aucun event PostHog ne sort sans accord
 * explicite de l'utilisateur (Art.82 LCEN / CNIL recommandation cookies).
 */
export function capture(eventName: string, properties?: Record<string, unknown>): void {
  if (!hasAnalyticsConsent()) return;
  // Lazy init : posthog n'est armé qu'au premier event après consent.
  initPostHog();
  posthog.capture(eventName, properties);
}

/**
 * Identifie un utilisateur authentifié — uniquement si consent analytics.
 */
export function identify(userId: string, properties?: Record<string, unknown>): void {
  if (!hasAnalyticsConsent()) return;
  initPostHog();
  posthog.identify(userId, properties);
}

/**
 * Reset session — appelé au logout. Toujours safe (pas de side-effect si
 * posthog n'a jamais démarré).
 */
export function reset(): void {
  if (typeof window === "undefined") return;
  if (!posthog.__loaded) return;
  posthog.reset();
}

/**
 * Helpers typés équivalents au module `track.ts` existant, mais protégés
 * par le gate consent. Conserver la même signature pour faciliter la
 * migration progressive des call-sites.
 */
export const analytics = {
  capture,
  identify,
  reset,
  hasAnalyticsConsent,
  hasMarketingConsent,
};
