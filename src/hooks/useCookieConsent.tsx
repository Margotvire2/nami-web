"use client";

/**
 * F-WEB-COOKIE-BANNER-GDPR-V1
 *
 * Hook + Context React pour gérer le consentement cookies (RGPD / ePrivacy).
 *
 * Catégories :
 * - `necessary` : cookies essentiels (session, CSRF, préférence consentement
 *   elle-même). TOUJOURS actifs — pas de bascule pour l'utilisateur.
 * - `analytics`  : mesure d'audience (PostHog). Désactivé par défaut.
 * - `marketing`  : éventuels pixels/retargeting. Désactivé par défaut.
 *
 * Persistence : localStorage clé `nami_cookie_consent_v1`. Le hook expose
 * `hasDecision` pour détecter le premier visiteur (pas encore choisi) afin
 * d'afficher la bannière.
 *
 * Aucun script analytics ne doit être tiré avant que `consent.analytics`
 * soit `true`. C'est le wrapper `src/lib/analytics.ts` qui applique cette
 * règle — ce hook se contente d'être la source de vérité.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const COOKIE_CONSENT_STORAGE_KEY = "nami_cookie_consent_v1";
export const COOKIE_CONSENT_EVENT = "nami:cookie-consent-changed";

export type CookieConsent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string | null;
};

export const DEFAULT_CONSENT: CookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  decidedAt: null,
};

type CookieConsentContextValue = {
  consent: CookieConsent;
  hasDecision: boolean;
  hasHydrated: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (next: Partial<Pick<CookieConsent, "analytics" | "marketing">>) => void;
  reset: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

function readFromStorage(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (typeof parsed !== "object" || parsed === null) return null;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      decidedAt:
        typeof parsed.decidedAt === "string" && parsed.decidedAt.length > 0
          ? parsed.decidedAt
          : null,
    };
  } catch {
    return null;
  }
}

function writeToStorage(consent: CookieConsent) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent));
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: consent }));
  } catch {
    // localStorage indisponible (Safari private, quota) : on dégrade silencieusement.
  }
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent>(DEFAULT_CONSENT);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Hydratation côté client uniquement — évite la race Zustand-like SSR.
  // setState ici est attendu : sync depuis localStorage (système externe) au mount.
  useEffect(() => {
    const stored = readFromStorage();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setConsent(stored);
    setHasHydrated(true);
  }, []);

  // Resync entre onglets : un autre onglet a accepté/refusé → on s'aligne.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== COOKIE_CONSENT_STORAGE_KEY) return;
      const stored = readFromStorage();
      if (stored) setConsent(stored);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: CookieConsent) => {
    setConsent(next);
    writeToStorage(next);
  }, []);

  const acceptAll = useCallback(() => {
    persist({
      necessary: true,
      analytics: true,
      marketing: true,
      decidedAt: new Date().toISOString(),
    });
  }, [persist]);

  const rejectNonEssential = useCallback(() => {
    persist({
      necessary: true,
      analytics: false,
      marketing: false,
      decidedAt: new Date().toISOString(),
    });
  }, [persist]);

  const savePreferences = useCallback(
    (next: Partial<Pick<CookieConsent, "analytics" | "marketing">>) => {
      persist({
        necessary: true,
        analytics: Boolean(next.analytics),
        marketing: Boolean(next.marketing),
        decidedAt: new Date().toISOString(),
      });
    },
    [persist],
  );

  const reset = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    setConsent(DEFAULT_CONSENT);
  }, []);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      hasDecision: consent.decidedAt !== null,
      hasHydrated,
      acceptAll,
      rejectNonEssential,
      savePreferences,
      reset,
    }),
    [consent, hasHydrated, acceptAll, rejectNonEssential, savePreferences, reset],
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error(
      "useCookieConsent doit être utilisé à l'intérieur d'un <CookieConsentProvider>",
    );
  }
  return ctx;
}

/**
 * Lecture standalone sans contexte React — utile pour `lib/analytics.ts` qui
 * doit checker le consent avant chaque event capture, y compris depuis du
 * code hors composant. Retourne le consent par défaut si rien stocké.
 */
export function readCookieConsent(): CookieConsent {
  return readFromStorage() ?? DEFAULT_CONSENT;
}
