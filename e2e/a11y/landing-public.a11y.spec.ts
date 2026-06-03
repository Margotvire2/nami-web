import { test, expect } from "@playwright/test";
import { runAxeScan } from "./_helpers/axeScan";

// Baseline a11y pour les pages publiques accessibles sans login. On audite
// la landing patient (`/`) et la landing soignant libéral (`/soignants-liberaux`)
// — les deux entrées principales du funnel public pre-launch C9.
// Anonyme : pas de storageState, contexte fraîchement isolé.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("a11y — pages publiques", () => {
  test("landing patient / — baseline axe", async ({ page }, testInfo) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
    await expect(page.locator("body")).toBeVisible();

    const report = await runAxeScan(page, testInfo, "landing-patient");

    // Rapport informatif — on log la sévérité pour faciliter le tri.
    // eslint-disable-next-line no-console
    console.log(`[a11y] landing-patient violations:`, report.counts);
  });

  test("landing soignant /soignants-liberaux — baseline axe", async ({
    page,
  }, testInfo) => {
    await page.goto("/soignants-liberaux", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
    await expect(page.locator("body")).toBeVisible();

    const report = await runAxeScan(page, testInfo, "landing-soignant");

    // eslint-disable-next-line no-console
    console.log(`[a11y] landing-soignant violations:`, report.counts);
  });
});
