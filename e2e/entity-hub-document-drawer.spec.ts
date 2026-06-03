import { test, expect } from "@playwright/test";
import { navigateToParcours } from "./_helpers/navigateToParcours";

// Phase E — fiche document (drawer Document).
//
// Post-hotfix backend PR #144 (defensive guard getSignedDocumentUrl +
// partial payload) : le backend ne renvoie plus 500 même quand
// l'URL signée échoue côté Storage. Il retourne un payload (complet ou
// partiel) que le drawer rend normalement, ce qui transforme cette spec
// en anti-régression happy-path : on vérifie que le drawer s'ouvre et
// affiche les sections clés sans crash.

const CARE_CASE_ID = "cmnypqxsx00dxt0p7fh3hqnjb";

test.describe("Entity Hub — Document drawer", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToParcours(page, CARE_CASE_ID);
    await expect(
      page.getByRole("heading", { name: /mon équipe soignante/i }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("ouvre le drawer document et affiche les sections clés (anti-régression post-hotfix #144)", async ({
    page,
  }) => {
    const documentButton = page
      .getByRole("button", { name: /^Voir la fiche du document / })
      .first();

    // Sanity : il faut au moins un document listé dans le hub patient pour
    // pouvoir tester. Si la seed démo bouge, on saute la spec proprement.
    const documentCount = await documentButton.count();
    test.skip(
      documentCount === 0,
      "Aucun document listé pour Léa — vérifier seed démo.",
    );

    await documentButton.click();

    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(/Fiche document/i)).toBeVisible();

    // Happy-path post hotfix #144 : le guard défensif côté backend garantit
    // un payload (complet ou partiel), donc le drawer rend le contenu métier
    // au lieu d'un fallback d'erreur. On vérifie la CTA "Ouvrir le document"
    // et la section "Origine" qui identifient la fiche.
    await expect(
      drawer.getByRole("button", { name: /Ouvrir le document/i }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(drawer.getByText(/Origine/i)).toBeVisible();
  });

  test("fermeture via Escape vide la pile", async ({ page }) => {
    const documentButton = page
      .getByRole("button", { name: /^Voir la fiche du document / })
      .first();
    const documentCount = await documentButton.count();
    test.skip(documentCount === 0, "Aucun document listé pour Léa.");

    await documentButton.click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});
