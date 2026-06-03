import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * F-UX-DOUBLE-LOGO-PUBLIC-PAGES
 *
 * Doctrine : seul `PublicNavbar` (et son miroir footer `PublicFooter`) porte
 * le logo Nami sur les pages publiques. Toute page hébergée sous un layout
 * qui injecte `PublicNavbar` NE doit pas réinclure `<img src="/nami-mascot.png">`
 * dans son hero / son propre <nav> sticky.
 *
 * Test source-level (et non DOM-mount) : on lit les fichiers patchés et on
 * vérifie qu'ils ne réintroduisent pas une image logo ou un <nav sticky/fixed>
 * qui doublonnerait l'header global. Plus robuste qu'un snapshot React (ne
 * dépend pas du runtime ScrollReveal/Framer Motion).
 */

const ROOT = resolve(__dirname, "../..");

function read(rel: string): string {
  return readFileSync(resolve(ROOT, rel), "utf-8");
}

function countOccurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

describe("F-UX-DOUBLE-LOGO-PUBLIC-PAGES — single source of truth", () => {
  it("PublicNavbar reste l'unique propriétaire du logo header", () => {
    const src = read("components/public/PublicNavbar.tsx");
    expect(countOccurrences(src, "nami-mascot.png")).toBe(1);
  });

  it("LibHero ne réintroduit aucun logo (hero de /soignants-liberaux)", () => {
    const src = read("components/lib/LibHero.tsx");
    expect(src).not.toContain("nami-mascot.png");
    expect(src).not.toMatch(/\{\s*\/\*\s*Logo\s*\*\/\s*\}/);
  });

  it("PitchHero ne réintroduit aucun logo (hero de /pitch + /decouvrir)", () => {
    const src = read("components/pitch/PitchHero.tsx");
    expect(src).not.toContain("nami-mascot.png");
    expect(src).not.toMatch(/\{\s*\/\*\s*Logo\s*\*\/\s*\}/);
  });

  it("DemoWalkthroughClient ne réintroduit pas un <nav> sticky concurrent (/demo)", () => {
    const src = read("app/demo/DemoWalkthroughClient.tsx");
    // Le layout /demo injecte déjà <PublicNavbar />. Pas de second <nav>
    // position fixed top:0 dans le body de la page.
    expect(src).not.toMatch(/<nav[\s\S]{0,200}position:\s*["']fixed["']/);
  });

  it("PitchTcaClient ne réintroduit pas un <nav> sticky concurrent (/pitch-tca)", () => {
    const src = read("app/pitch-tca/PitchTcaClient.tsx");
    expect(src).not.toMatch(/<nav[\s\S]{0,200}position:\s*["']fixed["']/);
  });

  it("/demo-hap layout n'injecte plus PublicNavbar (HAPNav est le header contextuel)", () => {
    const src = read("app/demo-hap/layout.tsx");
    // Pas d'import ni de rendu JSX <PublicNavbar /> — les commentaires qui
    // mentionnent le nom pour expliquer le choix sont autorisés.
    expect(src).not.toMatch(/import\s*\{[^}]*PublicNavbar[^}]*\}/);
    expect(src).not.toMatch(/<PublicNavbar\s*\/?>/);
    // PublicFooter doit rester (footer logo OK, pas concurrent du HAPNav).
    expect(src).toContain("<PublicFooter");
  });
});
