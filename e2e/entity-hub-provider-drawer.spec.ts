import { test, expect } from "@playwright/test";
import { navigateToParcours } from "./_helpers/navigateToParcours";

// Phase E — fiche soignant (drawer Provider).
// careCaseId stable confirmé en prod (Léa Rousseau — parcours pédiatrique TCA).

const CARE_CASE_ID = "cmnypqxsx00dxt0p7fh3hqnjb";

test.describe("Entity Hub — Provider drawer", () => {
  // ⚠️ SSR race patient layout — voir _helpers/navigateToParcours.ts.
  // Le layout src/app/(patient)/layout.tsx fire useEffect avant rehydratation
  // Zustand persist → router.replace('/login') systématique sur cold-load.
  // À activer dès que hasHydrated est ajouté dans (patient)/layout.tsx
  // (mémoire feedback_zustand_ssr_race). Scaffold E2E prêt + sélecteurs validés.
  test.fixme(
    true,
    "Bloqué par SSR race Zustand persist dans (patient)/layout.tsx — fix hasHydrated requis avant activation.",
  );

  test.beforeEach(async ({ page }) => {
    await navigateToParcours(page, CARE_CASE_ID);
    // Attendre que la section "Mon équipe soignante" soit montée — c'est le
    // signal que le hub principal a fini de charger.
    await expect(
      page.getByRole("heading", { name: /mon équipe soignante/i }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("ouvre le drawer, affiche identité + CTA Envoyer un message", async ({
    page,
  }) => {
    // Clic sur le premier soignant listé (aria-label déterministe côté code).
    const providerButton = page
      .getByRole("button", { name: /^Voir la fiche de / })
      .first();
    await expect(providerButton).toBeVisible();
    await providerButton.click();

    // Drawer = Sheet base-ui (role=dialog), titre "Fiche soignant".
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(/Fiche soignant/i)).toBeVisible();

    // Section Identité présente — sanity check du payload.
    await expect(drawer.getByText(/Identité/i)).toBeVisible();

    // CTA "Envoyer un message" : présent uniquement si actions.canDM=true.
    // Pour Léa, le hub provider renvoie canDM=true (vérifié Phase 0).
    const dmButton = drawer.getByRole("button", { name: /envoyer un message/i });
    await expect(dmButton).toBeVisible();

    await dmButton.click();

    // Navigation vers /mes-messages/dm:{personId} — pattern stable.
    await expect(page).toHaveURL(/\/mes-messages\/dm:[a-z0-9]+/i, {
      timeout: 15_000,
    });
  });
});
