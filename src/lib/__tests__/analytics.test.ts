/**
 * F-WEB-COOKIE-BANNER-GDPR-V1 — tests wrapper analytics
 *
 * Garantit qu'aucun event n'est tiré tant que le consent analytics
 * n'est pas accordé (Art.82 LCEN / CNIL).
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  COOKIE_CONSENT_STORAGE_KEY,
} from "@/hooks/useCookieConsent";

// Vitest 4 + Node 22+ / jsdom : voir useCookieConsent.test.tsx pour le pattern.
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

const captureSpy = vi.fn();
const identifySpy = vi.fn();
const resetSpy = vi.fn();
const initStub = { __loaded: false };

vi.mock("@/lib/posthog", () => ({
  posthog: {
    capture: (...args: unknown[]) => captureSpy(...args),
    identify: (...args: unknown[]) => identifySpy(...args),
    reset: () => resetSpy(),
    get __loaded() {
      return initStub.__loaded;
    },
  },
  initPostHog: () => {
    initStub.__loaded = true;
  },
}));

beforeEach(() => {
  captureSpy.mockClear();
  identifySpy.mockClear();
  resetSpy.mockClear();
  initStub.__loaded = false;
  window.localStorage.clear();
});

describe("lib/analytics", () => {
  it("capture() est no-op si aucun consent stocké", async () => {
    const { capture, hasAnalyticsConsent } = await import("../analytics");
    expect(hasAnalyticsConsent()).toBe(false);
    capture("test_event", { foo: "bar" });
    expect(captureSpy).not.toHaveBeenCalled();
  });

  it("capture() est no-op si consent.analytics=false", async () => {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({
        necessary: true,
        analytics: false,
        marketing: false,
        decidedAt: "2026-06-04T10:00:00.000Z",
      }),
    );
    const { capture } = await import("../analytics");
    capture("login");
    expect(captureSpy).not.toHaveBeenCalled();
  });

  it("capture() tire l'event si consent.analytics=true", async () => {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({
        necessary: true,
        analytics: true,
        marketing: false,
        decidedAt: "2026-06-04T10:00:00.000Z",
      }),
    );
    const { capture } = await import("../analytics");
    capture("login", { method: "password" });
    expect(captureSpy).toHaveBeenCalledTimes(1);
    expect(captureSpy).toHaveBeenCalledWith("login", { method: "password" });
  });

  it("identify() est no-op sans consent", async () => {
    const { identify } = await import("../analytics");
    identify("user-123", { email: "a@b.com" });
    expect(identifySpy).not.toHaveBeenCalled();
  });

  it("identify() fire si consent accordé", async () => {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({
        necessary: true,
        analytics: true,
        marketing: false,
        decidedAt: "2026-06-04T10:00:00.000Z",
      }),
    );
    const { identify } = await import("../analytics");
    identify("user-123", { email: "a@b.com" });
    expect(identifySpy).toHaveBeenCalledWith("user-123", { email: "a@b.com" });
  });

  it("reset() ne fait rien si posthog jamais chargé", async () => {
    const { reset } = await import("../analytics");
    reset();
    expect(resetSpy).not.toHaveBeenCalled();
  });
});
