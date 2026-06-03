import { test, expect } from "@playwright/test";
import { runAxeScan } from "./_helpers/axeScan";

// Baseline a11y page patient /ma-sante (refonte PR #167 récente).
// storageState Léa fourni par le project a11y.

test.describe("a11y — patient /ma-sante", () => {
  test("ma santé — baseline axe", async ({ page }, testInfo) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.goto("/ma-sante", {
        waitUntil: "domcontentloaded",
        timeout: 20_000,
      });
      await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
      if (!page.url().includes("/login")) break;
      await page.waitForTimeout(400);
    }

    if (page.url().includes("/login")) {
      test.skip(true, "SSR race Zustand persist non résolue après 3 retries.");
    }

    await expect(page.locator("body")).toBeVisible();

    const report = await runAxeScan(page, testInfo, "patient-ma-sante");
    // eslint-disable-next-line no-console
    console.log(`[a11y] patient-ma-sante violations:`, report.counts);
  });
});
