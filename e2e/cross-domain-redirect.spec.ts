import { test, expect } from "@playwright/test";

// F-UX-PATIENT-V1-LAUNCH-1 — smoke E2E des rewrites cross-domain.
//
// Le middleware Next.js (src/middleware.ts) effectue deux rewrites quand le
// host est `app.namipourlavie.com` :
//   - `/` ou ``         → `/soignants-liberaux`
//   - `/signup`         → `/signup/professional`
//
// On vérifie côté UI :
//   1. app.namipourlavie.com/signup affiche le wizard soignant 7 étapes
//      (h1 "Créez votre espace soignant." + stepper "Étape 1 / 7 — Identité").
//   2. namipourlavie.com/ ne dérive pas vers un contenu soignant —
//      le nombre d'occurrences de "soignant" dans le body (hors footer)
//      doit rester sous une borne anti-régression. La cible Chantier 1 est 0,
//      la borne actuelle protège contre un retour de copy mixte.

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Cross-domain rewrites — Doctolib pattern", () => {
  test("app.namipourlavie.com/signup affiche le wizard soignant", async ({
    page,
  }) => {
    await page.goto("https://app.namipourlavie.com/signup");

    await expect(
      page.getByRole("heading", { name: /créez votre espace soignant/i })
    ).toBeVisible({ timeout: 15_000 });

    await expect(page.getByText(/Étape 1 \/ 7 — Identité/i)).toBeVisible();

    // L'URL reste /signup (rewrite, pas redirect) — comportement Doctolib.
    expect(new URL(page.url()).pathname).toBe("/signup");
  });

  test("namipourlavie.com homepage — soignant cantonné au footer (anti-régression)", async ({
    page,
  }) => {
    await page.goto("https://namipourlavie.com/");
    await page.waitForLoadState("networkidle");

    // On exclut le footer du DOM puis on compte les mentions restantes.
    // Cible Chantier 1 (post-purge copy patient) : 0 mention dans le body.
    // Borne actuelle (2026-06-03) : 26 mentions visibles dans le body.
    // Cap = 30 → empêche un retour majeur de copy mixte sans bloquer la
    // baseline d'aujourd'hui. À resserrer au fur et à mesure que la copy
    // patient/soignant est séparée par domaine.
    const mentionsInBody = await page.evaluate(() => {
      const clone = document.body.cloneNode(true) as HTMLElement;
      clone.querySelectorAll("footer").forEach((f) => f.remove());
      const text = clone.innerText ?? "";
      return (text.match(/[Ss]oignant[s]?/g) ?? []).length;
    });

    expect(
      mentionsInBody,
      `soignant mentions in homepage body (excl. footer) — Chantier 1 target = 0, anti-régression cap = 30`
    ).toBeLessThanOrEqual(30);
  });
});
