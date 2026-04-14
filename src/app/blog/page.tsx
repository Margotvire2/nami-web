import type { Metadata } from "next"
import Link from "next/link"
import BlogBrowser from "./BlogBrowser"
import { PublicNavbar } from "@/components/public/PublicNavbar"
import { PublicFooter } from "@/components/public/PublicFooter"

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

      <PublicNavbar />

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blog Santé</h1>
          <p className="mt-2 text-gray-500 max-w-2xl mx-auto text-sm">
            Guides cliniques, conseils pour patients et familles, algorithmes décisionnels expliqués.
            Contenu validé par des professionnels de santé.
          </p>
          <p className="text-xs text-gray-400 mt-1">{total} articles publiés</p>
        </div>

        <BlogBrowser initialArticles={articles} initialTotal={total} apiUrl={API_URL} pageSize={PAGE_SIZE} />
      </div>
      <PublicFooter />
    </div>
  )
}
