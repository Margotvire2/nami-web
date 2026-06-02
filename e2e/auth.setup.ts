import { test as setup, expect } from "@playwright/test";
import path from "node:path";

// Login Léa Rousseau (patiente démo) puis sauvegarde du storageState pour
// réutilisation par les autres specs. Creds confirmés en prod 2026-06-03.

const LEA_EMAIL = "lea.rousseau@nami-demo.fr";
const LEA_PASSWORD = "nami1234demo";

const authFile = path.join(__dirname, "..", "playwright", ".auth", "lea.json");

setup("authenticate as lea.rousseau", async ({ page }) => {
  await page.goto("/login");

  await page.locator("#email").fill(LEA_EMAIL);
  await page.locator("#password").fill(LEA_PASSWORD);
  await page.getByRole("button", { name: /se connecter/i }).click();

  // Attendre la sortie de /login (redirection vers /accueil ou /parcours).
  // L'auth store hydrate via cookie httpOnly + localStorage (zustand persist).
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 20_000,
  });

  // Sanity check : on ne reste pas bloqué sur une étape MFA imprévue.
  await expect(page.locator("#email")).toHaveCount(0);

  await page.context().storageState({ path: authFile });
});
