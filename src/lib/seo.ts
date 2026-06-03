/**
 * SEO helpers — Schema.org JSON-LD + Next Metadata.
 *
 * Centralise la génération des structures Schema.org pour rich snippets
 * Google + helpers pour Next.js Metadata. Respect du wording MDR (pas
 * de "surveillance", "alerte clinique", etc. — voir CLAUDE.md).
 *
 * Domaine canonique : https://namipourlavie.com
 */

import type { Metadata } from "next"

export const SITE_URL = "https://namipourlavie.com"
export const SITE_NAME = "Nami"
export const SITE_LOGO = `${SITE_URL}/og-default.png`
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`

// ─── Organization (used in root layout) ──────────────────────────────────────
export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_LOGO,
    description:
      "Plateforme de coordination des parcours de soins complexes pluridisciplinaires entre professionnels de santé.",
    sameAs: [
      "https://www.linkedin.com/company/nami-coordination",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "contact@namipourlavie.com",
        availableLanguage: ["French"],
        areaServed: "FR",
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "FR",
    },
  } as const
}

// ─── MedicalBusiness (homepage, /pour-structures, etc.) ──────────────────────
export function buildMedicalOrganizationJsonLd(opts?: {
  name?: string
  url?: string
  description?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: opts?.name ?? SITE_NAME,
    url: opts?.url ?? SITE_URL,
    logo: SITE_LOGO,
    description:
      opts?.description ??
      "Coordination des parcours de soins complexes : TCA, obésité, pédiatrie, nutrition pluridisciplinaire.",
    medicalSpecialty: [
      "Dietetics",
      "Nutrition",
      "Endocrine",
      "Pediatric",
      "Psychiatric",
    ],
    areaServed: { "@type": "Country", name: "France" },
  } as const
}

// ─── Service (profession pages, /pour-structures) ────────────────────────────
export function buildServiceJsonLd(opts: {
  name: string
  description: string
  url: string
  providerName?: string
  serviceType?: string
  areaServed?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    serviceType: opts.serviceType ?? "Coordination des soins",
    provider: {
      "@type": "Organization",
      name: opts.providerName ?? SITE_NAME,
      url: SITE_URL,
    },
    areaServed: { "@type": "Country", name: opts.areaServed ?? "France" },
  } as const
}

// ─── Article (blog) ──────────────────────────────────────────────────────────
export function buildArticleJsonLd(opts: {
  title: string
  description: string
  url: string
  imageUrl?: string
  datePublished: string
  dateModified?: string
  authorName?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    image: opts.imageUrl ?? DEFAULT_OG_IMAGE,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    author: {
      "@type": "Organization",
      name: opts.authorName ?? SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: SITE_LOGO },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": opts.url },
  } as const
}

// ─── FAQPage ─────────────────────────────────────────────────────────────────
export function buildFaqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.answer,
      },
    })),
  } as const
}

// ─── BreadcrumbList ──────────────────────────────────────────────────────────
export function buildBreadcrumbJsonLd(crumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  } as const
}

// ─── HowTo (/comment-ca-marche) ──────────────────────────────────────────────
export function buildHowToJsonLd(opts: {
  name: string
  description: string
  steps: Array<{ name: string; text: string }>
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  } as const
}

// ─── Next.js Metadata helper ─────────────────────────────────────────────────
type BuildPageMetadataOpts = {
  title: string
  description: string
  path: string // e.g. "/professions/dieteticien" — sans le domaine
  keywords?: string[]
  ogImage?: string
  noIndex?: boolean
}

export function buildPageMetadata(opts: BuildPageMetadataOpts): Metadata {
  const url = `${SITE_URL}${opts.path}`
  const image = opts.ogImage ?? DEFAULT_OG_IMAGE

  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords,
    alternates: { canonical: opts.path },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      type: "website",
      siteName: SITE_NAME,
      locale: "fr_FR",
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [image],
    },
    robots: opts.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}

// ─── JSON-LD <script> renderer helper (server components) ────────────────────
export function jsonLdScript(data: object): { __html: string } {
  return { __html: JSON.stringify(data) }
}
