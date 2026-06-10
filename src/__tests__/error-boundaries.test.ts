import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * F-WEB-PAGES-404-500-CUSTOM-ERROR-BOUNDARIES
 *
 * Tests source-level (pas de DOM mount) sur les pages d'erreur Next.js
 * App Router. On vérifie :
 *  1. Présence des fichiers attendus
 *  2. Wording MDR safe (mots interdits absents)
 *  3. Sentry.captureException présent sur chaque boundary
 *  4. Tags Sentry (`boundary=...`) cohérents
 *  5. Pas de stack trace exposée en prod (NODE_ENV guarded)
 *  6. CTAs corrects (Réessayer, accueil contextuel)
 *
 * Pattern aligné avec `src/components/__tests__/public-logo-single-source.test.tsx`.
 */

const APP = resolve(__dirname, "../app");

function read(rel: string): string {
  return readFileSync(resolve(APP, rel), "utf-8");
}

// Mots interdits (CLAUDE.md nami-web — risque requalification MDR/DM)
const MDR_FORBIDDEN = [
  "alerte clinique",
  "alerte santé",
  "surveiller",
  "détecter",
  "risque clinique",
  "anormal",
  "signaux",
  "vigilance",
  "drapeaux rouges",
];

function expectNoMdrWording(source: string, file: string) {
  for (const word of MDR_FORBIDDEN) {
    if (source.toLowerCase().includes(word.toLowerCase())) {
      throw new Error(`MDR forbidden wording "${word}" found in ${file}`);
    }
  }
}

describe("F-WEB-PAGES-404-500 — files exist", () => {
  it("not-found.tsx exists", () => {
    expect(existsSync(resolve(APP, "not-found.tsx"))).toBe(true);
  });
  it("error.tsx (root) exists", () => {
    expect(existsSync(resolve(APP, "error.tsx"))).toBe(true);
  });
  it("global-error.tsx exists", () => {
    expect(existsSync(resolve(APP, "global-error.tsx"))).toBe(true);
  });
  it("(cockpit)/error.tsx exists", () => {
    expect(existsSync(resolve(APP, "(cockpit)/error.tsx"))).toBe(true);
  });
  it("(patient)/error.tsx exists", () => {
    expect(existsSync(resolve(APP, "(patient)/error.tsx"))).toBe(true);
  });
  it("(secretariat)/error.tsx exists", () => {
    expect(existsSync(resolve(APP, "(secretariat)/error.tsx"))).toBe(true);
  });
  it("structure/error.tsx exists", () => {
    expect(existsSync(resolve(APP, "structure/error.tsx"))).toBe(true);
  });
});

describe("F-WEB-PAGES-404-500 — not-found.tsx", () => {
  const src = read("not-found.tsx");

  it("affiche le mascot Nami", () => {
    expect(src).toContain("/nami-mascot.png");
  });

  it("contient le wording 'Cette page n'existe pas ou a été déplacée'", () => {
    expect(src).toContain("Cette page n");
    expect(src).toMatch(/n(?:'|&apos;|.)existe pas ou a été déplacée/);
  });

  it("propose CTA 'Retour à mon accueil'", () => {
    expect(src).toMatch(/Retour à mon accueil/);
  });

  it("propose CTA 'Contact support'", () => {
    expect(src).toMatch(/Contact support/);
  });

  it("wording safe (pas de mot MDR interdit)", () => {
    expectNoMdrWording(src, "not-found.tsx");
  });

  it("est noindex (robots: false)", () => {
    expect(src).toMatch(/index:\s*false/);
  });
});

describe("F-WEB-PAGES-404-500 — error.tsx (root)", () => {
  const src = read("error.tsx");

  it('est un Client Component ("use client")', () => {
    expect(src.split("\n")[0]).toContain("use client");
  });

  it("importe Sentry depuis @sentry/nextjs", () => {
    expect(src).toMatch(/from "@sentry\/nextjs"/);
  });

  it("appelle Sentry.captureException(error)", () => {
    expect(src).toContain("Sentry.captureException(error)");
  });

  it("tag Sentry boundary=root", () => {
    expect(src).toMatch(/setTag\(\s*"boundary"\s*,\s*"root"\s*\)/);
  });

  it("expose la stack uniquement en NODE_ENV=development", () => {
    expect(src).toMatch(/process\.env\.NODE_ENV\s*===\s*"development"/);
  });

  it("propose un bouton 'Réessayer' branché sur reset()", () => {
    expect(src).toContain("Réessayer");
    expect(src).toMatch(/onClick=\{reset\}/);
  });

  it("propose un lien 'Contact support'", () => {
    expect(src).toMatch(/Contact support/);
    expect(src).toMatch(/href="\/contact"/);
  });

  it("UI fallback patient-friendly", () => {
    expect(src).toMatch(/Une erreur inattendue est survenue/);
  });

  it("wording safe (pas de mot MDR interdit)", () => {
    expectNoMdrWording(src, "error.tsx");
  });
});

describe("F-WEB-PAGES-404-500 — global-error.tsx", () => {
  const src = read("global-error.tsx");

  it('est un Client Component ("use client")', () => {
    expect(src.split("\n")[0]).toContain("use client");
  });

  it("inclut <html> et <body> (fallback du root layout)", () => {
    expect(src).toMatch(/<html/);
    expect(src).toMatch(/<body/);
  });

  it("appelle Sentry.captureException", () => {
    expect(src).toContain("Sentry.captureException(error)");
  });

  it("tag Sentry boundary=global-root", () => {
    expect(src).toMatch(/setTag\(\s*"boundary"\s*,\s*"global-root"\s*\)/);
  });

  it("bouton Réessayer", () => {
    expect(src).toContain("Réessayer");
  });

  it("wording safe", () => {
    expectNoMdrWording(src, "global-error.tsx");
  });
});

describe("F-WEB-PAGES-404-500 — (cockpit)/error.tsx", () => {
  const src = read("(cockpit)/error.tsx");

  it("tag Sentry boundary=cockpit", () => {
    expect(src).toMatch(/setTag\(\s*"boundary"\s*,\s*"cockpit"\s*\)/);
  });

  it("lien retour /aujourd-hui (accueil soignant)", () => {
    expect(src).toMatch(/href="\/aujourd-hui"/);
  });

  it("stack masquée hors dev", () => {
    expect(src).toMatch(/NODE_ENV\s*===\s*"development"/);
  });

  it("wording safe (pas de 'risque clinique' / 'détecter')", () => {
    expectNoMdrWording(src, "(cockpit)/error.tsx");
  });
});

describe("F-WEB-PAGES-404-500 — (patient)/error.tsx", () => {
  const src = read("(patient)/error.tsx");

  it("tag Sentry boundary=patient", () => {
    expect(src).toMatch(/setTag\(\s*"boundary"\s*,\s*"patient"\s*\)/);
  });

  it("bannière urgence vitale 15/112 visible (règle CLAUDE.md)", () => {
    expect(src).toMatch(/15.*SAMU/);
    expect(src).toContain("112");
    expect(src).toMatch(/urgence vitale/i);
  });

  it("lien /accueil (espace patient)", () => {
    expect(src).toMatch(/href="\/accueil"/);
  });

  it("lien /aide (support patient)", () => {
    expect(src).toMatch(/href="\/aide"/);
  });

  it("PAS de pre/stack visible côté patient (même en dev)", () => {
    // Sur patient, on ne montre PAS la stack même en dev — UX/RGPD.
    expect(src).not.toMatch(/error\?\.stack/);
  });

  it("wording safe + ton rassurant ('Vos données sont en sécurité')", () => {
    expectNoMdrWording(src, "(patient)/error.tsx");
    expect(src).toMatch(/Vos données sont en sécurité/);
  });
});

describe("F-WEB-PAGES-404-500 — (secretariat)/error.tsx", () => {
  const src = read("(secretariat)/error.tsx");

  it("tag Sentry boundary=secretariat", () => {
    expect(src).toMatch(/setTag\(\s*"boundary"\s*,\s*"secretariat"\s*\)/);
  });

  it("lien retour /secretariat (agenda)", () => {
    expect(src).toMatch(/href="\/secretariat"/);
  });

  it("wording safe", () => {
    expectNoMdrWording(src, "(secretariat)/error.tsx");
  });
});

describe("F-WEB-PAGES-404-500 — structure/error.tsx", () => {
  const src = read("structure/error.tsx");

  it("tag Sentry boundary=structure", () => {
    expect(src).toMatch(/setTag\(\s*"boundary"\s*,\s*"structure"\s*\)/);
  });

  it("wording safe", () => {
    expectNoMdrWording(src, "structure/error.tsx");
  });
});

describe("F-WEB-PAGES-404-500 — cohérence transverse", () => {
  const files = [
    "error.tsx",
    "global-error.tsx",
    "(cockpit)/error.tsx",
    "(patient)/error.tsx",
    "(secretariat)/error.tsx",
    "structure/error.tsx",
  ];

  it("toutes les boundaries déclarent un tag Sentry distinct", () => {
    const tags = new Set<string>();
    for (const f of files) {
      const src = read(f);
      const m = src.match(/setTag\(\s*"boundary"\s*,\s*"([^"]+)"\s*\)/);
      expect(m, `boundary tag missing in ${f}`).toBeTruthy();
      tags.add(m![1]);
    }
    // Un tag unique par boundary
    expect(tags.size).toBe(files.length);
  });

  it("aucun fichier ne loggue la stack en production via console.error inconditionnel", () => {
    for (const f of files) {
      const src = read(f);
      if (src.includes("console.error")) {
        // OK si gardé derrière process.env.NODE_ENV !== "production"
        expect(src, `${f} logs without prod guard`).toMatch(
          /NODE_ENV\s*!==\s*"production"|NODE_ENV\s*===\s*"development"/,
        );
      }
    }
  });
});
