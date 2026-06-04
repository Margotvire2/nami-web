/**
 * F-WEB-COOKIE-BANNER-GDPR-V1 — tests CookieSettingsModal
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import { CookieSettingsModal } from "../CookieSettingsModal";
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

describe("CookieSettingsModal", () => {
  it("rend les 3 catégories avec la catégorie nécessaire désactivée et cochée", () => {
    render(withProvider(<CookieSettingsModal open onClose={() => {}} />));
    const necessary = screen.getByTestId("cookie-cat-necessary") as HTMLInputElement;
    const analytics = screen.getByTestId("cookie-cat-analytics") as HTMLInputElement;
    const marketing = screen.getByTestId("cookie-cat-marketing") as HTMLInputElement;
    expect(necessary.checked).toBe(true);
    expect(necessary.disabled).toBe(true);
    expect(analytics.checked).toBe(false);
    expect(marketing.checked).toBe(false);
  });

  it("toggle analytics on puis save → persiste analytics=true marketing=false", async () => {
    const user = userEvent.setup();
    let closed = false;
    render(
      withProvider(
        <CookieSettingsModal open onClose={() => (closed = true)} />,
      ),
    );
    await user.click(screen.getByTestId("cookie-cat-analytics"));
    await user.click(screen.getByTestId("cookie-settings-save"));

    expect(closed).toBe(true);
    const stored = JSON.parse(
      window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) as string,
    );
    expect(stored.analytics).toBe(true);
    expect(stored.marketing).toBe(false);
    expect(stored.necessary).toBe(true);
    expect(stored.decidedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("'Tout accepter' depuis la modal active analytics + marketing", async () => {
    const user = userEvent.setup();
    let closed = false;
    render(
      withProvider(
        <CookieSettingsModal open onClose={() => (closed = true)} />,
      ),
    );
    await user.click(screen.getByTestId("cookie-settings-accept-all"));
    expect(closed).toBe(true);
    const stored = JSON.parse(
      window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) as string,
    );
    expect(stored.analytics).toBe(true);
    expect(stored.marketing).toBe(true);
  });

  it("ne rend rien quand open=false", () => {
    render(withProvider(<CookieSettingsModal open={false} onClose={() => {}} />));
    expect(screen.queryByTestId("cookie-settings-modal")).toBeNull();
  });

  it("le bouton Fermer appelle onClose", async () => {
    const user = userEvent.setup();
    let closed = false;
    render(
      withProvider(
        <CookieSettingsModal open onClose={() => (closed = true)} />,
      ),
    );
    await user.click(screen.getByRole("button", { name: /Fermer/i }));
    expect(closed).toBe(true);
  });

  it("la touche Escape ferme la modal", async () => {
    const user = userEvent.setup();
    let closed = false;
    render(
      withProvider(
        <CookieSettingsModal open onClose={() => (closed = true)} />,
      ),
    );
    await user.keyboard("{Escape}");
    expect(closed).toBe(true);
  });

  it("n'utilise aucun terme MDR interdit", () => {
    render(withProvider(<CookieSettingsModal open onClose={() => {}} />));
    const modal = screen.getByTestId("cookie-settings-modal");
    const txt = modal.textContent?.toLowerCase() ?? "";
    expect(txt).not.toContain("alerte clinique");
    expect(txt).not.toContain("surveill");
    expect(txt).not.toContain("détecter");
    expect(txt).not.toContain("monitoring");
    expect(txt).not.toContain("risque clinique");
  });
});
