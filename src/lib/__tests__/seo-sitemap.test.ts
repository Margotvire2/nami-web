/**
 * Sitemap — règles d'inclusion / exclusion
 * --------------------------------------------------------------------------
 * Lock contract sur les landings critiques (patient + pro + légales) et sur
 * les routes privées qui ne doivent JAMAIS apparaître dans le sitemap public.
 *
 * Les tests mockent fetch() pour découpler le sitemap des appels backend
 * (providers/public, blog/sitemap) — ces blocs sont protégés par try/catch
 * dans sitemap.ts donc un mock vide retombe sur les pages statiques.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

import type { MetadataRoute } from "next";
import sitemap from "@/app/sitemap";

const PUBLIC_REQUIRED = [
  "https://namipourlavie.com",
  "https://namipourlavie.com/patient",
  "https://namipourlavie.com/soignants-liberaux",
  "https://namipourlavie.com/soignants",
  "https://namipourlavie.com/fonctionnalites",
  "https://namipourlavie.com/tarifs",
  "https://namipourlavie.com/faq",
  "https://namipourlavie.com/comment-ca-marche",
  "https://namipourlavie.com/contact",
  "https://namipourlavie.com/cgu",
  "https://namipourlavie.com/confidentialite",
  "https://namipourlavie.com/mentions-legales",
];

const FORBIDDEN_SUBSTRINGS = [
  "/api/",
  "/admin",
  "/cockpit",
  "/login",
  "/signup",
  "/invite/",
  "/pitch",
  "/demo",
  "/decouvrir",
];

describe("sitemap.ts", () => {
  let result: MetadataRoute.Sitemap;

  beforeAll(async () => {
    // Mock fetch pour éviter d'appeler le backend Railway durant les tests
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false }) as unknown as Response),
    );
    result = await sitemap();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("retourne un tableau non vide", () => {
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(20);
  });

  it.each(PUBLIC_REQUIRED)("contient l'URL publique %s", (url) => {
    const found = result.find((entry) => entry.url === url);
    expect(found, `sitemap manque l'entrée ${url}`).toBeDefined();
  });

  it.each(FORBIDDEN_SUBSTRINGS)("n'expose JAMAIS d'URL contenant %s", (forbidden) => {
    const leak = result.find((entry) => entry.url.includes(forbidden));
    expect(leak, `route privée exposée : ${leak?.url}`).toBeUndefined();
  });

  it("toutes les entrées ont une URL absolue avec le domaine canonique", () => {
    for (const entry of result) {
      expect(entry.url).toMatch(/^https:\/\/namipourlavie\.com/);
    }
  });

  it("toutes les entrées ont une priority dans [0, 1]", () => {
    for (const entry of result) {
      if (entry.priority !== undefined) {
        expect(entry.priority).toBeGreaterThanOrEqual(0);
        expect(entry.priority).toBeLessThanOrEqual(1);
      }
    }
  });
});
