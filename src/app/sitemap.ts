import type { MetadataRoute } from "next"

const BASE = "https://nami-web-orpin.vercel.app"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString()

  // Pages statiques publiques
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/soignants`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/trouver-un-soignant`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ]

  // Pages profils soignants publics
  let providerPages: MetadataRoute.Sitemap = []
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const res = await fetch(`${API}/providers/public`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      const providers = data.results ?? []
      providerPages = providers.map((p: { slug: string }) => ({
        url: `${BASE}/soignants/${p.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
    }
  } catch {
    // Silent fail — sitemap still works without provider pages
  }

  return [...staticPages, ...providerPages]
}
