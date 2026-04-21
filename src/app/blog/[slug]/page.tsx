import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, User, Tag, ExternalLink, BookOpen } from "lucide-react"

export const revalidate = 3600 // 1h

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

interface Article {
  id: string; slug: string; title: string; metaTitle: string | null;
  metaDescription: string | null; excerpt: string | null;
  content: string; contentHtml: string | null;
  category: string; audience: string; tags: string[];
  keywords: string[]; faqItems: { question: string; answer: string }[] | null;
  sources: string[]; sourceUrls: string[];
  publishedAt: string | null; authorName: string; authorRole: string | null;
  reviewedBy: string | null; pathologySlug: string | null;
  viewCount: number;
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API_URL}/blog/articles/${slug}`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

async function getArticleSlugs(): Promise<{ slug: string }[]> {
  try {
    const res = await fetch(`${API_URL}/blog/sitemap`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export async function generateStaticParams() {
  const slugs = await getArticleSlugs()
  return slugs.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: "Article introuvable" }

  return {
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.excerpt ?? undefined,
    keywords: article.keywords,
    openGraph: {
      title: (article.metaTitle ?? article.title) + " | Nami",
      description: article.metaDescription ?? article.excerpt ?? undefined,
      type: "article",
      publishedTime: article.publishedAt ?? undefined,
      authors: [article.authorName],
      tags: article.tags,
    },
    alternates: { canonical: `/blog/${slug}` },
  }
}

function preprocessContent(md: string): string {
  const faqIdx = md.search(/^## Questions fréquentes/m)
  const sourcesIdx = md.search(/^## Sources/m)
  const cutIdx = [faqIdx, sourcesIdx].filter((i) => i > 0).reduce((a, b) => Math.min(a, b), Infinity)
  return cutIdx < Infinity ? md.substring(0, cutIdx).trim() : md.trim()
}

function renderMarkdown(md: string): string {
  let html = md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  html = html.replace(/^---$/gm, '<hr class="my-6 border-gray-200" />')
  html = html.replace(/^#### (.+)$/gm, '<h4 class="text-sm font-semibold text-gray-700 mt-6 mb-2">$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-gray-800 mt-8 mb-3">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-gray-900 mt-10 mb-4 pb-2 border-b border-gray-100">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-gray-900 mb-2">$1</h1>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/^\|(.+)\|$/gm, (match) => {
    const cells = match.split("|").filter(Boolean).map((c) => c.trim())
    if (cells.every((c) => /^[-:]+$/.test(c))) return ""
    return `<tr>${cells.map((c) => `<td class="px-3 py-2 text-sm text-gray-700 border-t border-gray-100">${c}</td>`).join("")}</tr>`
  })
  html = html.replace(/((?:<tr>.*<\/tr>\n?)+)/g, '<div class="overflow-x-auto my-4"><table class="w-full text-left border border-gray-200 rounded-lg overflow-hidden">$1</table></div>')
  html = html.replace(/^- (.+)$/gm, '<li class="text-sm text-gray-700 ml-4 list-disc">$1</li>')
  html = html.replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul class="my-3 space-y-1">$1</ul>')
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="text-sm text-gray-700 ml-4 list-decimal">$2</li>')
  html = html.replace(/^(?!<[a-z/])(.+)$/gm, (match) => {
    if (match.trim() === "") return ""
    return `<p class="text-sm text-gray-700 leading-relaxed my-2">${match}</p>`
  })
  html = html.replace(/<p[^>]*>\s*<\/p>/g, "")
  return html
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const faq = (article.faqItems ?? []) as { question: string; answer: string }[]

  // JSON-LD Article
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    headline: article.title,
    description: article.metaDescription ?? article.excerpt,
    url: `https://nami-web-orpin.vercel.app/blog/${slug}`,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: { "@type": "Organization", name: article.authorName },
    publisher: { "@type": "Organization", name: "Nami", url: "https://nami-web-orpin.vercel.app" },
    inLanguage: "fr",
    isAccessibleForFree: true,
    keywords: article.keywords.join(", "),
    medicalAudience: article.audience === "professional"
      ? { "@type": "MedicalAudience", audienceType: "Clinician" }
      : { "@type": "MedicalAudience", audienceType: "Patient" },
  }

  // JSON-LD FAQ
  const faqJsonLd = faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  } : null

  const publishDate = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : null

  return (
    <div className="min-h-screen bg-[#F0F2FA]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="size-4" /> Tous les articles
        </Link>

        {/* Article header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
            {publishDate && <span className="flex items-center gap-1"><Calendar className="size-3" /> {publishDate}</span>}
            <span className="flex items-center gap-1"><User className="size-3" /> {article.authorName}{article.authorRole ? ` — ${article.authorRole}` : ""}</span>
            {article.reviewedBy && <span className="text-emerald-600">Relu par {article.reviewedBy}</span>}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {article.tags.map((t) => (
              <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded hover:bg-indigo-100">
                {t}
              </Link>
            ))}
          </div>
        </header>

        {/* Article content */}
        <article className="rounded-xl border bg-white p-6 shadow-sm">
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(preprocessContent(article.content)) }} />
        </article>

        {/* FAQ */}
        {faq.length > 0 && (
          <div className="rounded-xl border bg-white p-6 shadow-sm mt-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Questions fr&eacute;quentes</h2>
            <div className="space-y-4">
              {faq.map((f, i) => (
                <details key={i} className="group">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-800 hover:text-[#4F46E5] list-none flex items-start gap-2">
                    <span className="text-[#4F46E5] shrink-0 mt-0.5">Q.</span>
                    {f.question}
                  </summary>
                  <p className="text-sm text-gray-600 mt-2 ml-5 leading-relaxed">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        {article.sources.length > 0 && (
          <div className="rounded-xl border bg-gray-50 p-4 mt-4">
            <h3 className="text-xs font-semibold text-gray-500 mb-2">Sources</h3>
            <ul className="space-y-1">
              {article.sources.map((s, i) => (
                <li key={i} className="text-xs text-gray-500 flex items-start gap-1">
                  <BookOpen className="size-3 shrink-0 mt-0.5" /> {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Related pathology */}
        {article.pathologySlug && (
          <Link
            href={`/pathologies/${article.pathologySlug}`}
            className="block rounded-xl border bg-white p-4 mt-4 shadow-sm hover:border-[#4F46E5]/20 transition-all"
          >
            <p className="text-xs text-gray-400">Fiche clinique associ&eacute;e</p>
            <p className="text-sm font-semibold text-[#4F46E5] mt-1 flex items-center gap-1">
              Voir la fiche compl&egrave;te <ArrowLeft className="size-3 rotate-180" />
            </p>
          </Link>
        )}

        {/* CTA */}
        <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm text-center">
          <h2 className="text-base font-semibold text-gray-900">Coordonnez vos parcours de soins avec Nami</h2>
          <p className="text-sm text-gray-500 mt-1">564 000+ professionnels dans l&apos;annuaire. Adressage, suivi, coordination.</p>
          <div className="flex justify-center gap-3 mt-4">
            <Link href="/signup" className="rounded-lg bg-[#4F46E5] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90">
              Cr&eacute;er un compte
            </Link>
            <Link href="/trouver-un-soignant" className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Trouver un soignant
            </Link>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 text-center mt-8">
          Cet article ne remplace pas une consultation m&eacute;dicale. Sources cit&eacute;es dans l&apos;article.
          &copy; {new Date().getFullYear()} Nami
        </p>
      </div>
    </div>
  )
}
