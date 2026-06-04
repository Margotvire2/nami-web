/**
 * SEO landings — metadata generation tests
 * --------------------------------------------------------------------------
 * Vérifie que chaque landing publique critique (patient + pro + légales)
 * expose une metadata complète : openGraph + twitter card + canonical +
 * robots index/follow, avec un wording compatible MDR (mots interdits absents).
 *
 * Ces tests protègent contre toute régression SEO/social-share et toute
 * réintroduction de wording risquant la requalification DM (voir CLAUDE.md).
 */

import { describe, it, expect } from "vitest";

import { metadata as homeMetadata } from "@/app/page";
import { metadata as patientMetadata } from "@/app/patient/page";
import { metadata as proMetadata } from "@/app/soignants-liberaux/page";
import { metadata as faqMetadata } from "@/app/(public)/faq/page";
import { metadata as contactMetadata } from "@/app/contact/page";
import { metadata as commentMetadata } from "@/app/comment-ca-marche/page";
import { metadata as tarifsMetadata } from "@/app/tarifs/page";
import { buildPageMetadata } from "@/lib/seo";

// Wording strictement interdit en marketing/UI (CLAUDE.md §"Mots interdits")
const FORBIDDEN_WORDING = [
  "surveillance",
  "monitoring",
  "alerte clinique",
  "alerte santé",
  "drapeaux rouges",
  "care gaps",
  "détecter",
  "prévenir",
  "sécuriser",
  "anormal",
  "risque clinique",
  "à surveiller",
  "non observance",
];

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "default" in value) {
    return String((value as { default: string }).default);
  }
  return JSON.stringify(value ?? "");
}

function metadataToText(meta: Record<string, unknown>): string {
  // Aplatit titre + description + openGraph + twitter en chaîne unique pour scan
  return [
    asString(meta.title),
    asString(meta.description),
    JSON.stringify(meta.openGraph ?? {}),
    JSON.stringify(meta.twitter ?? {}),
  ]
    .join(" ")
    .toLowerCase();
}

describe("SEO landings — metadata structure", () => {
  const LANDINGS = [
    { name: "home", meta: homeMetadata, canonical: "/" },
    { name: "patient", meta: patientMetadata, canonical: "/patient" },
    { name: "soignants-liberaux", meta: proMetadata, canonical: "/soignants-liberaux" },
    { name: "faq", meta: faqMetadata, canonical: "/faq" },
    { name: "contact", meta: contactMetadata, canonical: "/contact" },
    { name: "comment-ca-marche", meta: commentMetadata, canonical: "/comment-ca-marche" },
    { name: "tarifs", meta: tarifsMetadata, canonical: "/tarifs" },
  ];

  it.each(LANDINGS)("$name expose un canonical absolu vers $canonical", ({ meta, canonical }) => {
    const alt = meta.alternates as { canonical?: string } | undefined;
    expect(alt?.canonical).toBe(canonical);
  });

  it.each(LANDINGS)("$name a un openGraph complet (title + description + image)", ({ meta }) => {
    const og = meta.openGraph as
      | {
          title?: string;
          description?: string;
          images?: Array<{ url: string; width: number; height: number }>;
        }
      | undefined;
    expect(og).toBeDefined();
    expect(og?.title).toBeTruthy();
    expect(og?.description).toBeTruthy();
    expect(og?.images?.[0]?.url).toMatch(/^\/og-/);
    expect(og?.images?.[0]?.width).toBe(1200);
    expect(og?.images?.[0]?.height).toBe(630);
  });

  it.each(LANDINGS)("$name a une twitter card summary_large_image avec image", ({ meta }) => {
    const tw = meta.twitter as
      | { card?: string; title?: string; description?: string; images?: string[] }
      | undefined;
    expect(tw).toBeDefined();
    expect(tw?.card).toBe("summary_large_image");
    expect(tw?.title).toBeTruthy();
    expect(tw?.description).toBeTruthy();
    expect(tw?.images?.[0]).toMatch(/^\/og-/);
  });

  it.each(LANDINGS)("$name est explicitement index/follow", ({ meta }) => {
    const robots = meta.robots as { index?: boolean; follow?: boolean } | undefined;
    expect(robots?.index).toBe(true);
    expect(robots?.follow).toBe(true);
  });

  it.each(LANDINGS)("$name ne contient pas de wording MDR interdit", ({ meta }) => {
    const text = metadataToText(meta as Record<string, unknown>);
    for (const forbidden of FORBIDDEN_WORDING) {
      expect(text, `wording interdit présent : "${forbidden}"`).not.toContain(forbidden);
    }
  });

  it("patient utilise l'OG image dédiée patient", () => {
    const og = patientMetadata.openGraph as { images?: Array<{ url: string }> };
    expect(og.images?.[0]?.url).toBe("/og-image-patient.svg");
  });

  it("soignants-liberaux utilise l'OG image dédiée pro", () => {
    const og = proMetadata.openGraph as { images?: Array<{ url: string }> };
    expect(og.images?.[0]?.url).toBe("/og-image-pro.svg");
  });
});

describe("buildPageMetadata helper", () => {
  it("génère une metadata complète (canonical, OG, twitter, robots)", () => {
    const meta = buildPageMetadata({
      title: "Test page",
      description: "Description test",
      path: "/test-path",
    });

    expect(meta.alternates?.canonical).toBe("/test-path");

    const og = meta.openGraph as {
      title: string;
      description: string;
      url: string;
      images: Array<{ url: string; width: number; height: number }>;
    };
    expect(og.url).toBe("https://namipourlavie.com/test-path");
    expect(og.images[0].width).toBe(1200);
    expect(og.images[0].height).toBe(630);

    const tw = meta.twitter as { card: string; images: string[] };
    expect(tw.card).toBe("summary_large_image");
    expect(tw.images[0]).toBeTruthy();

    expect(meta.robots).toEqual({ index: true, follow: true });
  });

  it("respecte le flag noIndex pour les pages internes", () => {
    const meta = buildPageMetadata({
      title: "Internal",
      description: "Page interne",
      path: "/internal",
      noIndex: true,
    });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });
});
