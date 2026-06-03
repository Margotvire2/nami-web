import { test, expect } from "@playwright/test";
import { navigateToParcours } from "./_helpers/navigateToParcours";

// Phase E — back-stack cross-navigation entre drawers.
//
// Stratégie adaptée aux écueils prod (2026-06-03) :
//   - pastConsultations: [] pour Léa → on ne peut pas partir depuis
//     HubCycleConsultationSection
//   - GET document/:id retourne 500 → on ne peut pas suivre le lien
//     "Consultation liée" dans le payload document (jamais reçu)
//
// Path testé : Provider drawer → click document partagé (depuis section
// "Documents partagés" du provider hub) → Document drawer stacké → back
// arrow revient au Provider drawer. Le canGoBack du contexte (stack > 1)
// expose le bouton "Revenir à la fiche précédente".
//
// Quand le 500 sera fixé, ajouter un test 3 niveaux : Provider → Document →
// Consultation liée → back → back.

const CARE_CASE_ID = "cmnypqxsx00dxt0p7fh3hqnjb";

test.describe("Entity Hub — back-stack cross-navigation", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToParcours(page, CARE_CASE_ID);
    await expect(
      page.getByRole("heading", { name: /mon équipe soignante/i }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("Provider → Document (stack=2) → back → Provider (stack=1)", async ({
    page,
  }) => {
    // Étape 1 — ouvre Provider drawer (niveau 1).
    const providerButton = page
      .getByRole("button", { name: /^Voir la fiche de / })
      .first();
    await providerButton.click();

    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(/Fiche soignant/i)).toBeVisible();

    // Pas de back arrow à ce stade (canGoBack=false, stack=1).
    await expect(
      drawer.getByRole("button", { name: /revenir à la fiche précédente/i }),
    ).toHaveCount(0);

    // Étape 2 — cherche un item "document partagé" dans le drawer provider.
    // Le payload provider expose documents.sentByMe[] + sharedByThem[]. Si
    // le provider sélectionné n'en a aucun (rare en seed démo), on skip.
    const docInDrawer = drawer
      .getByRole("button", { name: /^Voir la fiche du document / })
      .first();
    const docInDrawerCount = await docInDrawer.count();
    test.skip(
      docInDrawerCount === 0,
      "Provider sélectionné n'a aucun document partagé dans le hub — choisir un autre seed ou patcher le test.",
    );

    await docInDrawer.click();

    // Étape 3 — Document drawer stacké (niveau 2).
    await expect(drawer.getByText(/Fiche document/i)).toBeVisible({
      timeout: 15_000,
    });

    // Back arrow MAINTENANT visible (canGoBack=true, stack=2).
    const backButton = drawer.getByRole("button", {
      name: /revenir à la fiche précédente/i,
    });
    await expect(backButton).toBeVisible();

    // Étape 4 — back revient au Provider drawer (niveau 1).
    await backButton.click();
    await expect(drawer.getByText(/Fiche soignant/i)).toBeVisible();

    // Back arrow re-disparu (stack=1 à nouveau).
    await expect(
      drawer.getByRole("button", { name: /revenir à la fiche précédente/i }),
    ).toHaveCount(0);

    // Étape 5 — Escape ferme tout.
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
  });
});
