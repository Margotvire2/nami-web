import posthog from "posthog-js";
import { readCookieConsent } from "@/hooks/useCookieConsent";

/**
 * Init PostHog. F-WEB-COOKIE-BANNER-GDPR-V1 : aucun script analytics ne
 * démarre tant que l'utilisateur n'a pas accordé le consent `analytics`.
 * Cette fonction peut donc être appelée plusieurs fois sans risque — elle
 * ne fait rien tant que le consent n'est pas en place, et devient idempotente
 * une fois posthog chargé.
 */
export function initPostHog() {
  if (typeof window === "undefined") return;
  if (posthog.__loaded) return;

  // Garde-fou RGPD : pas d'init sans consent analytics.
  if (!readCookieConsent().analytics) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || !key.startsWith("phc_")) return;

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
    capture_pageview: false, // on gère manuellement
    capture_pageleave: true,
    persistence: "localStorage+cookie",
  });
}

export { posthog };
