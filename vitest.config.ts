import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // Legacy tests `src/lib/__tests__/ragContentCleanup.test.ts` utilisent
    // `node:test` natif (Phase 3.B.2). Ils sont exécutés via
    // `npx tsx --test src/lib/__tests__/ragContentCleanup.test.ts` et préservés
    // à part — non inclus dans le runner Vitest pour éviter le conflit.
    exclude: ["node_modules", "dist", ".next", "**/ragContentCleanup.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
