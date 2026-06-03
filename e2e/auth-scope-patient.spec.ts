import { test, expect, type Page, type Response } from "@playwright/test";

// F-UX-PATIENT-V1-LAUNCH-1 — smoke E2E des deux endpoints scopés
// /auth/login/patient (namipourlavie.com) et /auth/login/provider (app.namipourlavie.com).
//
// Vérifie côté UI :
//   1. Un compte PATIENT se loggue sur la surface patient → /accueil.
//   2. Un compte PROVIDER qui tente la surface patient voit le toast 403
//      "réservé aux patients" et reste sur /login.
//   3. Un compte PATIENT qui tente la surface soignant voit le toast 403
//      "réservé aux soignants" et reste sur /login.
//   4. Un compte PROVIDER se loggue sur la surface soignant → /aujourd-hui.
//
// Les specs s'exécutent **sans storage state** (override du auth.setup) parce
// qu'on a besoin de partir d'une session vide. Cibles prod (DNS namipourlavie.com
// et app.namipourlavie.com vérifiés 2026-06-03).
//
// Rate limit backend : `authLimiter` = 10 / 15 min / IP partagé entre tous les
// /auth/login*. Si la suite est ré-exécutée trop vite, les tests skipent
// proprement plutôt que de noircir le reporter.

const PATIENT_BASE = "https://namipourlavie.com";
const PROVIDER_BASE = "https://app.namipourlavie.com";

const PATIENT_CREDS = {
  email: "gabrielle.martin@nami-demo.fr",
  password: "nami1234demo",
};

const PROVIDER_CREDS = {
  email: "margot.vire.diet@nami-demo.fr",
  password: "nami1234demo",
};

test.use({ storageState: { cookies: [], origins: [] } });

// Soumet le formulaire et capture la réponse /auth/login* déclenchée pour
// pouvoir détecter un 429 (rate limit prod 10/15min/IP partagé entre
// toutes les routes /auth/*) avant que le timeout waitForURL ne fasse
// tomber le test à tort.
async function submitAndCaptureLoginResponse(
  page: Page,
  email: string,
  password: string
): Promise<Response> {
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  const responsePromise = page.waitForResponse(
    (res) => /\/auth\/login(\/(patient|provider))?$/.test(new URL(res.url()).pathname),
    { timeout: 15_000 }
  );
  await page.getByRole("button", { name: /^se connecter$/i }).click();
  return responsePromise;
}

function skipIfRateLimited(res: Response): boolean {
  if (res.status() === 429) {
    test.skip(
      true,
      `Rate limit /auth/* atteint (${res.status()} ${res.url()}) — réessayer dans 15 min.`
    );
    return true;
  }
  return false;
}

test.describe("Auth scope — surface patient (namipourlavie.com)", () => {
  test("PATIENT login → redirige vers /accueil", async ({ page }) => {
    await page.goto(`${PATIENT_BASE}/login`);
    const res = await submitAndCaptureLoginResponse(
      page,
      PATIENT_CREDS.email,
      PATIENT_CREDS.password
    );
    if (skipIfRateLimited(res)) return;

    expect(res.status()).toBe(200);
    await page.waitForURL(/\/accueil(\?|$)/, { timeout: 20_000 });
    expect(page.url()).toContain("/accueil");
  });

  test("PROVIDER login → toast 'réservé aux patients' + reste sur /login", async ({
    page,
  }) => {
    await page.goto(`${PATIENT_BASE}/login`);
    const res = await submitAndCaptureLoginResponse(
      page,
      PROVIDER_CREDS.email,
      PROVIDER_CREDS.password
    );
    if (skipIfRateLimited(res)) return;

    expect(res.status()).toBe(403);
    await expect(page.getByText(/réservé aux patients/i)).toBeVisible({
      timeout: 10_000,
    });
    expect(new URL(page.url()).pathname).toBe("/login");
  });
});

test.describe("Auth scope — surface soignant (app.namipourlavie.com)", () => {
  test("PATIENT login → toast 'réservé aux soignants' + reste sur /login", async ({
    page,
  }) => {
    await page.goto(`${PROVIDER_BASE}/login`);
    const res = await submitAndCaptureLoginResponse(
      page,
      PATIENT_CREDS.email,
      PATIENT_CREDS.password
    );
    if (skipIfRateLimited(res)) return;

    expect(res.status()).toBe(403);
    await expect(page.getByText(/réservé aux soignants/i)).toBeVisible({
      timeout: 10_000,
    });
    expect(new URL(page.url()).pathname).toBe("/login");
  });

  test("PROVIDER login → redirige vers /aujourd-hui", async ({ page }) => {
    await page.goto(`${PROVIDER_BASE}/login`);
    const res = await submitAndCaptureLoginResponse(
      page,
      PROVIDER_CREDS.email,
      PROVIDER_CREDS.password
    );
    if (skipIfRateLimited(res)) return;

    expect(res.status()).toBe(200);
    // /aujourd-hui pour PROVIDER simple. PLATFORM_ADMIN/ORG_ADMIN pur sans
    // ProviderProfile partirait vers /structure/[id]/admin — pas ce compte.
    await page.waitForURL(/\/aujourd-hui(\?|$)/, { timeout: 20_000 });
    expect(page.url()).toContain("/aujourd-hui");
  });
});
