/**
 * F-WEB-COOKIE-BANNER-GDPR-V1 — tests useCookieConsent
 */
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";

import {
  CookieConsentProvider,
  useCookieConsent,
  readCookieConsent,
  COOKIE_CONSENT_STORAGE_KEY,
  DEFAULT_CONSENT,
} from "../useCookieConsent";

// Vitest 4 + Node 22+ / jsdom : localStorage natif Node n'expose pas l'API
// Storage complète — on installe un shim mémoire (cf. StructureSwitcher.test).
const fakeStorage: Record<string, string> = {};
Object.defineProperty(window, "localStorage", {
  value: {
    get length() {
      return Object.keys(fakeStorage).length;
    },
    clear: () => {
      for (const k of Object.keys(fakeStorage)) delete fakeStorage[k];
    },
    getItem: (k: string) => (k in fakeStorage ? fakeStorage[k] : null),
    setItem: (k: string, v: string) => {
      fakeStorage[k] = v;
    },
    removeItem: (k: string) => {
      delete fakeStorage[k];
    },
    key: (i: number) => Object.keys(fakeStorage)[i] ?? null,
  } satisfies Storage,
  configurable: true,
  writable: true,
});

function wrapper({ children }: { children: ReactNode }) {
  return <CookieConsentProvider>{children}</CookieConsentProvider>;
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("useCookieConsent", () => {
  it("démarre avec hasDecision=false et le consent par défaut", () => {
    const { result } = renderHook(() => useCookieConsent(), { wrapper });
    expect(result.current.consent).toEqual(DEFAULT_CONSENT);
    expect(result.current.hasDecision).toBe(false);
  });

  it("acceptAll persiste analytics+marketing=true", () => {
    const { result } = renderHook(() => useCookieConsent(), { wrapper });
    act(() => result.current.acceptAll());
    expect(result.current.consent.analytics).toBe(true);
    expect(result.current.consent.marketing).toBe(true);
    expect(result.current.hasDecision).toBe(true);
    expect(readCookieConsent().analytics).toBe(true);
  });

  it("rejectNonEssential persiste analytics+marketing=false mais hasDecision=true", () => {
    const { result } = renderHook(() => useCookieConsent(), { wrapper });
    act(() => result.current.rejectNonEssential());
    expect(result.current.consent.analytics).toBe(false);
    expect(result.current.consent.marketing).toBe(false);
    expect(result.current.hasDecision).toBe(true);
  });

  it("savePreferences applique les flags transmis", () => {
    const { result } = renderHook(() => useCookieConsent(), { wrapper });
    act(() => result.current.savePreferences({ analytics: true, marketing: false }));
    expect(result.current.consent.analytics).toBe(true);
    expect(result.current.consent.marketing).toBe(false);
  });

  it("reset efface localStorage et restaure le défaut", () => {
    const { result } = renderHook(() => useCookieConsent(), { wrapper });
    act(() => result.current.acceptAll());
    expect(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).not.toBeNull();
    act(() => result.current.reset());
    expect(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).toBeNull();
    expect(result.current.hasDecision).toBe(false);
  });

  it("readCookieConsent retourne le default si rien stocké", () => {
    expect(readCookieConsent()).toEqual(DEFAULT_CONSENT);
  });

  it("readCookieConsent ignore un JSON corrompu en localStorage", () => {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, "{not json");
    expect(readCookieConsent()).toEqual(DEFAULT_CONSENT);
  });
});
