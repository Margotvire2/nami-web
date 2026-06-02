import type { Page } from "@playwright/test";

/**
 * Contournement E2E pour la SSR race Zustand persist du layout patient.
 *
 * Bug connu : `src/app/(patient)/layout.tsx` fire son useEffect AVANT que
 * `useAuthStore.persist.onRehydrateStorage` ait fini de propager `accessToken`
 * depuis localStorage → `router.replace('/login')` à tort sur cold-load. Voir
 * mémoire `feedback_zustand_ssr_race.md` : pattern fix attendu côté app =
 * `hasHydrated` flag dans le layout. Tant que ce n'est pas fait, le layout
 * (patient) est fragile et fait perdre la 1ère navigation.
 *
 * Stratégie : retry jusqu'à 4 navigations. Sur les tentatives suivantes,
 * localStorage est déjà chaud, donc la fenêtre de race a plus de chances de se
 * résoudre dans le bon sens (Zustand hydraté avant useEffect).
 *
 * Si ce helper devient inutile (race fixée), le supprimer.
 */
export async function navigateToParcours(
  page: Page,
  careCaseId: string,
  attempts = 4,
): Promise<void> {
  let lastUrl = "";
  for (let i = 0; i < attempts; i++) {
    await page
      .goto(`/parcours/${careCaseId}`, {
        waitUntil: "domcontentloaded",
        timeout: 20_000,
      })
      .catch(() => {});
    // Laisser le React tree settler (un tick suffit en général pour résoudre
    // la race après cold-load).
    await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
    lastUrl = page.url();
    if (!lastUrl.includes("/login")) return;
    // Race perdue — petit délai pour laisser zustand persist finir, puis on
    // reload (cache HTTP chaud → moins de jitter).
    await page.waitForTimeout(400);
  }
  throw new Error(
    `[navigateToParcours] SSR race patient layout non résolue après ${attempts} tentatives (lastUrl=${lastUrl}). À fixer côté app : ajouter hasHydrated dans src/app/(patient)/layout.tsx (cf mémoire feedback_zustand_ssr_race).`,
  );
}
