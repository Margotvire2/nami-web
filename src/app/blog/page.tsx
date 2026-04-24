import type { Metadata } from "next"
import Link from "next/link"
import BlogBrowser from "./BlogBrowser"

export const revalidate = 300

export const metadata: Metadata = {
  title: "Blog Santé — Guides cliniques et conseils pour patients et soignants",
  description:
    "Articles de santé validés par des professionnels : pédiatrie, TCA, obésité, nutrition, algorithmes cliniques, guides pour patients et soignants. Sources HAS, ESPGHAN, FFAB.",
  keywords: [
    "blog santé", "guide clinique", "pédiatrie", "TCA", "anorexie", "obésité enfant",
    "APLV", "fièvre enfant", "retard langage", "parcours de soins",
  ],
  openGraph: {
    title: "Blog Santé | Nami",
    description: "Guides cliniques et conseils validés pour patients et soignants.",
  },
  alternates: { canonical: "/blog" },
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

const PAGE_SIZE = 60

async function getInitialArticles() {
  try {
    const res = await fetch(`${API_URL}/blog/articles?limit=${PAGE_SIZE}&offset=0`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return { articles: [], total: 0 }
    return res.json()
  } catch {
    return { articles: [], total: 0 }
  }
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Blog Santé Nami",
  description: "Guides cliniques et conseils validés pour patients et soignants.",
  url: "https://namipourlavie.com/blog",
  publisher: { "@type": "Organization", name: "Nami", url: "https://namipourlavie.com" },
}

export default async function BlogPage() {
  const { articles, total } = await getInitialArticles()

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="text-center mb-12" style={{ paddingTop: 80 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
            style={{ background: "rgba(43,168,156,0.07)", color: "#2BA89C", border: "1px solid rgba(43,168,156,0.15)", letterSpacing: "0.08em" }}>
            RESSOURCES
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5"
            style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)", lineHeight: 1.08 }}>
            Connaissances, coordination,<br className="hidden md:block" /> pratique.
          </h1>
          <p className="text-lg leading-relaxed max-w-xl mx-auto mb-3"
            style={{ color: "#374151" }}>
            Articles de référence pour les professionnels de la coordination de soins.
          </p>
          <p className="text-sm font-medium" style={{ color: "#6B7280" }}>{total} articles publiés</p>
        </div>

        <BlogBrowser initialArticles={articles} initialTotal={total} apiUrl={API_URL} pageSize={PAGE_SIZE} />
      </div>
    </div>
  )
}
