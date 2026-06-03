import { test, expect } from "@playwright/test";
import { runAxeScan } from "./_helpers/axeScan";

// Baseline a11y page patient principale `/parcours/[id]` (Léa Rousseau,
// careCaseId démo). storageState lea.json fourni par le project a11y.

const LEA_CARE_CASE_ID = "cmnypqxsx00dxt0p7fh3hqnjb";

test.describe("a11y — patient /parcours", () => {
  test("parcours patient — baseline axe", async ({ page }, testInfo) => {
    // Retry simple pour la SSR race Zustand persist du layout patient
    // (cf navigateToParcours helper existant).
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.goto(`/parcours/${LEA_CARE_CASE_ID}`, {
        waitUntil: "domcontentloaded",
        timeout: 20_000,
      });
      await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
      if (!page.url().includes("/login")) break;
      await page.waitForTimeout(400);
    }

    await expect(
      page.getByRole("heading", { name: /mon équipe soignante/i }),
    ).toBeVisible({ timeout: 20_000 });

    const report = await runAxeScan(page, testInfo, "patient-parcours");
    // eslint-disable-next-line no-console
    console.log(`[a11y] patient-parcours violations:`, report.counts);
  });
});
