import type { MetadataRoute } from "next"
import { PATHOLOGIES } from "@/lib/data/pathologies"

const BASE = "https://namipourlavie.com"

// Dates de dernière mise à jour réelles — mettre à jour à chaque refonte significative
const LAST = {
  home:       "2026-04-21",
  pathologies:"2026-04-24",
  blog:       "2026-04-21",
  annuaire:   "2026-04-14",
  soignants:  "2026-04-21",
  professions:"2026-04-21",
  legal:      "2026-04-24",
}

const PROFESSION_SLUGS = [
  "allergologue", "cardiologue", "chirurgien-bariatrique", "dermatologue",
  "dieteticien", "endocrinologue", "ergotherapeute", "gastro-enterologue",
  "geriatre", "gynecologue", "infectiologue", "infirmier", "kinesitherapeute",
  "medecin-generaliste", "medecin-nutritionniste", "nephrologue", "neurologue",
  "oncologue", "orthophoniste", "pediatre", "pneumologue", "podologue",
  "psychiatre", "psychologue", "rhumatologue", "sage-femme",
]

const ANNUAIRE_SPECIALTIES = [
  "medecin-generaliste", "pediatre", "cardiologue", "psychiatre", "dieteticien",
  "orthophoniste", "masseur-kinesitherapeute", "infirmier", "ophtalmologiste",
  "gynecologiste", "dermatologue", "gastro-enterologue", "endocrinologue",
  "pneumologue", "sage-femme", "psychologue",
]

const ANNUAIRE_CITIES = [
  "paris", "lyon", "marseille", "toulouse", "bordeaux",
  "lille", "nantes", "strasbourg", "montpellier", "nice",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Pages statiques ──────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                                    lastModified: LAST.home,        changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/trouver-un-soignant`,           lastModified: LAST.annuaire,    changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/pathologies`,                   lastModified: LAST.pathologies, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/blog`,                          lastModified: LAST.blog,        changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE}/annuaire-public`,               lastModified: LAST.annuaire,    changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/soignants`,                     lastModified: LAST.soignants,   changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/professions`,                   lastModified: LAST.professions, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/signup`,                        lastModified: LAST.legal,       changeFrequency: "yearly",  priority: 0.5 },
    { url: `${BASE}/methodologie-editoriale`,       lastModified: LAST.legal,       changeFrequency: "yearly",  priority: 0.4 },
    { url: `${BASE}/mentions-legales`,              lastModified: LAST.legal,       changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE}/confidentialite`,               lastModified: LAST.legal,       changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE}/cgu`,                           lastModified: LAST.legal,       changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE}/login`,                         lastModified: LAST.legal,       changeFrequency: "yearly",  priority: 0.2 },
  ]

  // ── Pathologies ──────────────────────────────────────────────────────────────
  const pathologyPages: MetadataRoute.Sitemap = PATHOLOGIES.map((p) => ({
    url: `${BASE}/pathologies/${p.slug}`,
    lastModified: LAST.pathologies,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }))

  // ── Professions ──────────────────────────────────────────────────────────────
  const professionPages: MetadataRoute.Sitemap = PROFESSION_SLUGS.map((s) => ({
    url: `${BASE}/professions/${s}`,
    lastModified: LAST.professions,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  // ── Annuaire spécialités × villes ────────────────────────────────────────────
  const annuairePages: MetadataRoute.Sitemap = [
    ...ANNUAIRE_SPECIALTIES.map((s) => ({
      url: `${BASE}/annuaire-public/${s}`,
      lastModified: LAST.annuaire,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...ANNUAIRE_SPECIALTIES.flatMap((s) =>
      ANNUAIRE_CITIES.map((c) => ({
        url: `${BASE}/annuaire-public/${s}-${c}`,
        lastModified: LAST.annuaire,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }))
    ),
  ]

  // ── Profils soignants publics ─────────────────────────────────────────────────
  let providerPages: MetadataRoute.Sitemap = []
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const res = await fetch(`${API}/providers/public`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      const providers: { slug: string; updatedAt?: string }[] = data.results ?? []
      providerPages = providers.map((p) => ({
        url: `${BASE}/soignants/${p.slug}`,
        lastModified: p.updatedAt ?? LAST.soignants,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
    }
  } catch {}

  // ── Blog articles ─────────────────────────────────────────────────────────────
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const blogRes = await fetch(`${API}/blog/sitemap`, { next: { revalidate: 3600 } })
    if (blogRes.ok) {
      const articles: { slug: string; publishedAt: string; updatedAt?: string }[] = await blogRes.json()
      blogPages = articles.map((a) => ({
        url: `${BASE}/blog/${a.slug}`,
        lastModified: a.updatedAt ?? a.publishedAt ?? LAST.blog,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      }))
    }
  } catch {}

  return [
    ...staticPages,
    ...pathologyPages,
    ...blogPages,
    ...annuairePages,
    ...professionPages,
    ...providerPages,
  ]
}
