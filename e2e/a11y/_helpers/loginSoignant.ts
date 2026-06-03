import type { Page } from "@playwright/test";

// Login soignant pour l'audit a11y du cockpit. Creds documentés dans
// nami-web/CLAUDE.md — peuvent être stales en prod. Retourne `true` si le
// login a réussi et que la redirection est sortie de `/login`.
//
// IMPORTANT : si ces creds bougent, mettre à jour ici ET dans CLAUDE.md.
const SOIGNANT_EMAIL =
  process.env.A11Y_SOIGNANT_EMAIL ?? "margot.vire@namihealth.com";
const SOIGNANT_PASSWORD = process.env.A11Y_SOIGNANT_PASSWORD ?? "Demo2024!";

export async function tryLoginAsSoignant(page: Page): Promise<boolean> {
  await page.goto("/login");
  await page.locator("#email").fill(SOIGNANT_EMAIL);
  await page.locator("#password").fill(SOIGNANT_PASSWORD);
  await page.getByRole("button", { name: /se connecter/i }).click();
  try {
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
      timeout: 15_000,
    });
    return true;
  } catch {
    return false;
  }
}
