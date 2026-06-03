import { test, expect } from "@playwright/test";
import { runAxeScan } from "./_helpers/axeScan";

// Baseline a11y EntityHubDrawer (PR #154 — fiche document patient).
// Le drawer s'ouvre depuis /parcours/[id] sur clic d'un document listé.
// Scope du scan : page entière (drawer + backdrop + main), pour capter
// les régressions de focus trap et de contraste sur l'overlay.
// storageState Léa fourni par le project a11y.

const LEA_CARE_CASE_ID = "cmnypqxsx00dxt0p7fh3hqnjb";

test.describe("a11y — drawer Entity Hub", () => {
  test("drawer document ouvert — baseline axe", async ({ page }, testInfo) => {
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

    const documentButton = page
      .getByRole("button", { name: /^Voir la fiche du document / })
      .first();

    const documentCount = await documentButton.count();
    test.skip(
      documentCount === 0,
      "Aucun document listé pour Léa — vérifier seed démo.",
    );

    await documentButton.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    // Laisser le drawer settler (animations + chargement content async)
    await page.waitForTimeout(800);

    const report = await runAxeScan(page, testInfo, "drawer-entity-hub");
    // eslint-disable-next-line no-console
    console.log(`[a11y] drawer-entity-hub violations:`, report.counts);
  });
});
