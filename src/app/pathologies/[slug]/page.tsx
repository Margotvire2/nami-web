import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PATHOLOGIES, getPathologyBySlug, CATEGORY_LABELS } from "@/lib/data/pathologies"
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react"

export const revalidate = 86400 // 24h

// SSG — genère toutes les pages au build
export function generateStaticParams() {
  return PATHOLOGIES.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const p = getPathologyBySlug(slug)
  if (!p) return { title: "Pathologie introuvable" }

  return {
    title: p.title,
    description: p.description,
    keywords: p.keywords,
    openGraph: {
      title: p.title + " | Nami",
      description: p.description,
      type: "article",
      siteName: "Nami",
      locale: "fr_FR",
    },
    alternates: {
      canonical: `/pathologies/${slug}`,
    },
  }
}

async function getMarkdownContent(slug: string): Promise<string | null> {
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const res = await fetch(`${API}/intelligence/pathology-content/${slug}`, {
      next: { revalidate: 86400 },
    })
    if (res.ok) {
      const data = await res.json()
      return data.content ?? null
    }
  } catch { /* fallback below */ }

  // Fallback : contenu statique minimal
  return null
}

// Simple markdown-to-HTML (headings, bold, lists, tables, horizontal rules)
function renderMarkdown(md: string): string {
  let html = md
    // Escape HTML entities
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-6 border-gray-200" />')

  // Headers
  html = html.replace(/^#### (.+)$/gm, '<h4 class="text-sm font-semibold text-gray-700 mt-6 mb-2">$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-gray-800 mt-8 mb-3">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-gray-900 mt-10 mb-4 pb-2 border-b border-gray-100">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-gray-900 mb-2">$1</h1>')

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Simple tables
  html = html.replace(/^\|(.+)\|$/gm, (match) => {
    const cells = match.split("|").filter(Boolean).map((c) => c.trim())
    if (cells.every((c) => /^[-:]+$/.test(c))) {
      return "" // separator row
    }
    const isHeader = match.includes("---")
    const tag = isHeader ? "th" : "td"
    const cellClass = isHeader
      ? 'class="px-3 py-2 text-left text-xs font-semibold text-gray-600 bg-gray-50"'
      : 'class="px-3 py-2 text-sm text-gray-700 border-t border-gray-100"'
    return `<tr>${cells.map((c) => `<${tag} ${cellClass}>${c}</${tag}>`).join("")}</tr>`
  })
  // Wrap consecutive tr in table
  html = html.replace(/((?:<tr>.*<\/tr>\n?)+)/g, '<div class="overflow-x-auto my-4"><table class="w-full text-left border border-gray-200 rounded-lg overflow-hidden">$1</table></div>')

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="text-sm text-gray-700 ml-4 list-disc">$1</li>')
  html = html.replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul class="my-3 space-y-1">$1</ul>')

  // Paragraphs (lines that aren't already HTML)
  html = html.replace(/^(?!<[a-z/])(.+)$/gm, (match) => {
    if (match.trim() === "") return ""
    return `<p class="text-sm text-gray-700 leading-relaxed my-2">${match}</p>`
  })

  // Clean empty paragraphs
  html = html.replace(/<p[^>]*>\s*<\/p>/g, "")

  return html
}

export default async function PathologyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const meta = getPathologyBySlug(slug)
  if (!meta) notFound()

  const categoryMeta = CATEGORY_LABELS[meta.category]
  const content = await getMarkdownContent(slug)

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: meta.title,
    description: meta.description,
    url: `https://nami-web-orpin.vercel.app/pathologies/${slug}`,
    inLanguage: "fr",
    medicalAudience: {
      "@type": "MedicalAudience",
      audienceType: "Clinician",
    },
    about: {
      "@type": "MedicalCondition",
      name: meta.shortTitle,
      code: meta.cim11
        ? { "@type": "MedicalCode", codeValue: meta.cim11, codingSystem: "ICD-11" }
        : undefined,
    },
    publisher: {
      "@type": "Organization",
      name: "Nami",
      url: "https://nami-web-orpin.vercel.app",
    },
    dateModified: new Date().toISOString().split("T")[0],
    isAccessibleForFree: true,
  }

  return (
    <div className="min-h-screen bg-[#F0F2FA]">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navbar */}
      <nav className="border-b bg-white sticky top-0 z-10">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold text-[#4F46E5]">nami</Link>
          <div className="flex items-center gap-4">
            <Link href="/pathologies" className="text-sm text-gray-500 hover:text-gray-700">Pathologies</Link>
            <Link href="/soignants" className="text-sm text-gray-500 hover:text-gray-700">Annuaire</Link>
            <Link href="/login" className="rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
              Se connecter
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Back */}
        <Link
          href="/pathologies"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="size-4" /> Toutes les pathologies
        </Link>

        {/* Header card */}
        <div className="rounded-xl border bg-white p-6 shadow-sm mb-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">{meta.emoji}</span>
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                {categoryMeta.label}
              </span>
              <h1 className="text-2xl font-bold text-gray-900">{meta.shortTitle}</h1>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{meta.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {meta.cim11 && (
                  <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    CIM-11 : {meta.cim11}
                  </span>
                )}
                {meta.keywords.slice(0, 5).map((kw) => (
                  <span key={kw} className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {content ? (
          <article className="rounded-xl border bg-white p-6 shadow-sm prose-sm">
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
          </article>
        ) : (
          <div className="rounded-xl border bg-white p-8 shadow-sm text-center">
            <BookOpen className="size-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Le contenu d&eacute;taill&eacute; de cette fiche est en cours de r&eacute;daction.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Consultez les recommandations HAS pour les informations les plus r&eacute;centes.
            </p>
            <a
              href="https://www.has-sante.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-3"
            >
              <ExternalLink className="size-3" /> has-sante.fr
            </a>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm text-center">
          <h2 className="text-base font-semibold text-gray-900">
            Vous coordonnez un parcours de soins pour cette pathologie ?
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Nami vous aide &agrave; orchestrer le suivi pluridisciplinaire.
          </p>
          <div className="flex justify-center gap-3 mt-4">
            <Link
              href="/signup"
              className="rounded-lg bg-[#4F46E5] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Cr&eacute;er un compte soignant
            </Link>
            <Link
              href="/trouver-un-soignant"
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Trouver un soignant
            </Link>
          </div>
        </div>

        {/* Legal */}
        <p className="text-[10px] text-gray-400 text-center mt-8">
          Sources : HAS, FFAB, ESPGHAN, SFP, OMS. Cette fiche est destin&eacute;e aux professionnels de sant&eacute;
          et ne remplace pas une consultation m&eacute;dicale. Derni&egrave;re mise &agrave; jour : avril 2026.
        </p>
      </div>
    </div>
  )
}
