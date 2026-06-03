import { test, expect } from "@playwright/test";
import { runAxeScan } from "./_helpers/axeScan";
import { tryLoginAsSoignant } from "./_helpers/loginSoignant";

// Baseline a11y cockpit principal : page /evenements (V3-C, refonte
// 2026-06-01). Nécessite un compte soignant — si les creds documentés ne
// fonctionnent plus en prod, on skip plutôt que de bloquer le baseline.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("a11y — cockpit /evenements", () => {
  test("événements cockpit — baseline axe", async ({ page }, testInfo) => {
    const ok = await tryLoginAsSoignant(page);
    test.skip(
      !ok,
      "Login soignant échoué (creds CLAUDE.md potentiellement stales). Définir A11Y_SOIGNANT_EMAIL/A11Y_SOIGNANT_PASSWORD pour réactiver.",
    );

    await page.goto("/evenements", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});

    // Si le rôle ne donne pas accès à /evenements, on est redirigé hors
    // cockpit — on skip dans ce cas.
    if (!page.url().includes("/evenements")) {
      test.skip(true, `Redirigé hors /evenements vers ${page.url()} (rôle non-soignant ?).`);
    }

    await expect(page.locator("body")).toBeVisible();

    const report = await runAxeScan(page, testInfo, "cockpit-evenements");
    // eslint-disable-next-line no-console
    console.log(`[a11y] cockpit-evenements violations:`, report.counts);
  });
});
