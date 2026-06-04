/**
 * F-WEB-COOKIE-BANNER-GDPR-V1 — tests CookieBanner
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import { CookieBanner } from "../CookieBanner";
import {
  CookieConsentProvider,
  COOKIE_CONSENT_STORAGE_KEY,
} from "@/hooks/useCookieConsent";
import { installLocalStorageShim } from "./_localStorageShim";

installLocalStorageShim();

function withProvider(children: ReactNode) {
  return <CookieConsentProvider>{children}</CookieConsentProvider>;
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("CookieBanner", () => {
  it("s'affiche au premier visiteur (aucun choix stocké)", async () => {
    render(withProvider(<CookieBanner />));
    // hydratation côté client → l'effet de mount affiche la bannière
    expect(await screen.findByTestId("cookie-banner")).toBeInTheDocument();
    expect(screen.getByTestId("cookie-banner-accept")).toBeInTheDocument();
    expect(screen.getByTestId("cookie-banner-reject")).toBeInTheDocument();
    expect(screen.getByTestId("cookie-banner-customize")).toBeInTheDocument();
  });

  it("ne s'affiche pas si un choix a déjà été enregistré", async () => {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({
        necessary: true,
        analytics: true,
        marketing: false,
        decidedAt: "2026-06-04T10:00:00.000Z",
      }),
    );
    render(withProvider(<CookieBanner />));
    // Laisse l'effet de hydratation tourner
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.queryByTestId("cookie-banner")).toBeNull();
  });

  it("'Tout accepter' enregistre analytics+marketing=true et masque la bannière", async () => {
    const user = userEvent.setup();
    render(withProvider(<CookieBanner />));
    await user.click(await screen.findByTestId("cookie-banner-accept"));
    expect(screen.queryByTestId("cookie-banner")).toBeNull();

    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const stored = JSON.parse(raw as string);
    expect(stored.analytics).toBe(true);
    expect(stored.marketing).toBe(true);
    expect(stored.decidedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("'Refuser non-essentiels' enregistre analytics+marketing=false", async () => {
    const user = userEvent.setup();
    render(withProvider(<CookieBanner />));
    await user.click(await screen.findByTestId("cookie-banner-reject"));
    expect(screen.queryByTestId("cookie-banner")).toBeNull();

    const stored = JSON.parse(
      window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) as string,
    );
    expect(stored.analytics).toBe(false);
    expect(stored.marketing).toBe(false);
    expect(stored.necessary).toBe(true);
  });

  it("'Personnaliser' ouvre la modal de réglages", async () => {
    const user = userEvent.setup();
    render(withProvider(<CookieBanner />));
    await user.click(await screen.findByTestId("cookie-banner-customize"));
    expect(screen.getByTestId("cookie-settings-modal")).toBeInTheDocument();
  });

  it("expose un lien vers /confidentialite", async () => {
    render(withProvider(<CookieBanner />));
    await screen.findByTestId("cookie-banner");
    const link = screen.getByRole("link", { name: /En savoir plus/i });
    expect(link).toHaveAttribute("href", "/confidentialite");
  });

  it("n'utilise aucun terme MDR interdit dans le wording", async () => {
    render(withProvider(<CookieBanner />));
    const banner = await screen.findByTestId("cookie-banner");
    const txt = banner.textContent?.toLowerCase() ?? "";
    // Mots interdits CLAUDE.md (champ DM / requalification clinique)
    expect(txt).not.toContain("alerte clinique");
    expect(txt).not.toContain("surveill"); // surveillance / surveiller
    expect(txt).not.toContain("détecter");
    expect(txt).not.toContain("monitoring");
    expect(txt).not.toContain("risque clinique");
  });
});
