import { defineConfig, devices } from "@playwright/test";

// E2E Phase E (Entity Hub drawers) — cible la prod par défaut. Override possible
// via PLAYWRIGHT_BASE_URL (ex: tunnel Vercel preview ou localhost:3001).
//
// Pourquoi prod ? Les specs sont lecture seule (login + navigation). La cible
// stable est `namipourlavie.com` (vercel-orpin.vercel.app retourne 404). Pas de
// webServer car on n'a pas besoin de booter Next.js local.

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ?? "https://namipourlavie.com";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  timeout: 45_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/lea.json",
      },
      dependencies: ["setup"],
    },
  ],
});
