import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, ArrowRight, Search } from "lucide-react"

export const revalidate = 300 // 5 min

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

interface ArticleSummary {
  slug: string; title: string; excerpt: string | null;
  category: string; audience: string; tags: string[];
  publishedAt: string | null; authorName: string;
  metaTitle: string | null; viewCount: number;
}

async function getArticles(): Promise<{ articles: ArticleSummary[]; total: number }> {
  try {
    const res = await fetch(`${API_URL}/blog/articles?limit=50`, { next: { revalidate: 300 } })
    if (!res.ok) return { articles: [], total: 0 }
    return res.json()
  } catch { return { articles: [], total: 0 } }
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  patient_guide: { label: "Guide patient", emoji: "👨‍👩‍👧", color: "bg-blue-50 text-blue-700" },
  clinical_practice: { label: "Pratique clinique", emoji: "🩺", color: "bg-emerald-50 text-emerald-700" },
  case_study: { label: "Cas clinique", emoji: "📋", color: "bg-amber-50 text-amber-700" },
  algorithm_explained: { label: "Algorithme expliqué", emoji: "🔀", color: "bg-purple-50 text-purple-700" },
  news: { label: "Actualité", emoji: "📰", color: "bg-gray-100 text-gray-700" },
  glossary: { label: "Glossaire", emoji: "📖", color: "bg-indigo-50 text-indigo-700" },
}

const AUDIENCE_LABELS: Record<string, string> = {
  patient: "Pour les patients & familles",
  professional: "Pour les soignants",
  both: "Patients & soignants",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Blog Santé Nami",
  description: "Guides cliniques et conseils validés pour patients et soignants.",
  url: "https://nami-web-orpin.vercel.app/blog",
  publisher: { "@type": "Organization", name: "Nami", url: "https://nami-web-orpin.vercel.app" },
}

export default async function BlogPage() {
  const { articles, total } = await getArticles()

  return (
    <div className="min-h-screen bg-[#F0F2FA]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold text-[#4F46E5]">nami</Link>
          <div className="flex items-center gap-4">
            <Link href="/pathologies" className="text-sm text-gray-500 hover:text-gray-700">Pathologies</Link>
            <Link href="/annuaire-public" className="text-sm text-gray-500 hover:text-gray-700">Annuaire</Link>
            <Link href="/login" className="rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
              Se connecter
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Blog Sant&eacute;</h1>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            Guides cliniques, conseils pour patients et familles, algorithmes d&eacute;cisionnels expliqu&eacute;s.
            Contenu valid&eacute; par des professionnels de sant&eacute;.
          </p>
          <p className="text-xs text-gray-400 mt-2">{total} article{total > 1 ? "s" : ""} publi&eacute;{total > 1 ? "s" : ""}</p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="size-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Les articles arrivent bient&ocirc;t.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {articles.map((a) => {
              const cat = CATEGORY_LABELS[a.category] ?? CATEGORY_LABELS.news
              return (
                <Link
                  key={a.slug}
                  href={`/blog/${a.slug}`}
                  className="group rounded-xl border bg-white p-5 shadow-sm hover:shadow-md hover:border-[#4F46E5]/20 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.color}`}>
                      {cat.emoji} {cat.label}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {AUDIENCE_LABELS[a.audience] ?? ""}
                    </span>
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900 group-hover:text-[#4F46E5] transition-colors line-clamp-2">
                    {a.title}
                  </h2>
                  {a.excerpt && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{a.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex flex-wrap gap-1">
                      {a.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                    <ArrowRight className="size-3.5 text-gray-300 group-hover:text-[#4F46E5] transition-colors" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        <div className="mt-12 rounded-xl border bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Vous &ecirc;tes professionnel de sant&eacute; ?</h2>
          <p className="text-sm text-gray-500 mt-1">
            Coordonnez vos parcours de soins complexes avec Nami.
          </p>
          <Link href="/signup" className="inline-block mt-4 rounded-lg bg-[#4F46E5] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90">
            Cr&eacute;er mon compte
          </Link>
        </div>
      </div>
    </div>
  )
}
