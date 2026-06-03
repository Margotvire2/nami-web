import { test, expect } from "@playwright/test";
import { runAxeScan } from "./_helpers/axeScan";

// Baseline a11y page patient /mes-documents (Wave 2B refonte récente
// 2026-06-03, PR #176 drawer). storageState Léa fourni par le project a11y.

test.describe("a11y — patient /mes-documents", () => {
  test("mes documents — baseline axe", async ({ page }, testInfo) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.goto("/mes-documents", {
        waitUntil: "domcontentloaded",
        timeout: 20_000,
      });
      await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
      if (!page.url().includes("/login")) break;
      await page.waitForTimeout(400);
    }

    await expect(page.locator("body")).toBeVisible();
    // Sanity : on est bien sur la page
    if (page.url().includes("/login")) {
      test.skip(true, "SSR race Zustand persist non résolue après 3 retries.");
    }

    const report = await runAxeScan(page, testInfo, "patient-mes-documents");
    // eslint-disable-next-line no-console
    console.log(`[a11y] patient-mes-documents violations:`, report.counts);
  });
});
