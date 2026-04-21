import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PATHOLOGIES, getPathologyBySlug, CATEGORY_LABELS } from "@/lib/data/pathologies"
import { ChevronRight, Stethoscope, BookOpen, HelpCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export const revalidate = 86400 // 24h

// SSG — génère toutes les pages au build
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
    keywords: p.keywords.join(", "),
    openGraph: {
      title: p.title + " | Nami",
      description: p.description,
      type: "article",
      siteName: "Nami",
      locale: "fr_FR",
    },
    alternates: { canonical: `/pathologies/${slug}` },
    robots: { index: true, follow: true },
  }
}

// ─── Types article retourné par l'API ────────────────────────────────────────

interface Article {
  title: string
  metaDescription?: string
  content: string
  excerpt?: string
  faqItems?: { question: string; answer: string }[]
  tags?: string[]
  sources?: string[]
  audience?: string
  publishedAt?: string
}

// ─── Fetch article publié ────────────────────────────────────────────────────

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || "https://nami-production-f268.up.railway.app"
    const res = await fetch(`${API}/blog/by-pathology/${slug}`, {
      next: { revalidate: 86400 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

// ─── Nettoyage du contenu avant rendu ────────────────────────────────────────
// Supprime le H1 (déjà affiché dans le header) et convertit **1.1 Titre** → ### Titre

function preprocessContent(md: string): string {
  // FAQ + Sources + signature sont affichés séparément — retirer du corps
  const faqIdx = md.search(/^## Questions fréquentes/m)
  const sourcesIdx = md.search(/^## Sources/m)
  const cutIdx = [faqIdx, sourcesIdx].filter((i) => i > 0).reduce((a, b) => Math.min(a, b), Infinity)
  const body = cutIdx < Infinity ? md.substring(0, cutIdx) : md

  return body
    // Supprimer les H1
    .replace(/^#\s+.+$/gm, "")
    // Convertir **N.N Titre** ou **N. Titre** en heading H3
    .replace(/^\*\*(\d+\.\d+\s+)(.+?)\*\*\s*$/gm, "### $2")
    .replace(/^\*\*(\d+\.\s+)(.+?)\*\*\s*$/gm, "### $2")
    // Supprimer les lignes vides multiples
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PathologyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const meta = getPathologyBySlug(slug)
  if (!meta) notFound()

  const categoryMeta = CATEGORY_LABELS[meta.category] ?? { label: "Pathologie", color: "slate" }
  const article = await getArticle(slug)

  // ── JSON-LD : MedicalWebPage + BreadcrumbList + FAQPage (si FAQ) ──────────
  const jsonLdPage = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: meta.title,
    description: meta.description,
    url: `https://namipourlavie.com/pathologies/${slug}`,
    inLanguage: "fr",
    medicalAudience: {
      "@type": "MedicalAudience",
      audienceType: "Clinician",
    },
    about: {
      "@type": "MedicalCondition",
      name: meta.shortTitle,
      ...(meta.cim11 && {
        code: { "@type": "MedicalCode", codeValue: meta.cim11, codingSystem: "ICD-11" },
      }),
    },
    publisher: {
      "@type": "Organization",
      name: "Nami",
      url: "https://namipourlavie.com",
      logo: { "@type": "ImageObject", url: "https://namipourlavie.com/logo.png" },
    },
    dateModified: new Date().toISOString().split("T")[0],
    isAccessibleForFree: true,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".article-intro", ".key-points"],
    },
  }

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Nami", item: "https://namipourlavie.com" },
      { "@type": "ListItem", position: 2, name: "Pathologies", item: "https://namipourlavie.com/pathologies" },
      { "@type": "ListItem", position: 3, name: meta.shortTitle, item: `https://namipourlavie.com/pathologies/${slug}` },
    ],
  }

  const faqItems = article?.faqItems?.length ? article.faqItems : null
  const jsonLdFaq = faqItems ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  } : null

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      {jsonLdFaq && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />
      )}

      {/* Navbar */}
      <nav className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold text-[#5B4EC4]">nami</Link>
          <div className="flex items-center gap-4">
            <Link href="/pathologies" className="hidden sm:block text-sm text-gray-500 hover:text-gray-700 transition-colors">Pathologies</Link>
            <Link href="/soignants" className="hidden sm:block text-sm text-gray-500 hover:text-gray-700 transition-colors">Annuaire</Link>
            <Link href="/login" className="rounded-lg bg-[#5B4EC4] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
              Se connecter
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-4 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-600 transition-colors">Nami</Link>
          <ChevronRight className="size-3" />
          <Link href="/pathologies" className="hover:text-gray-600 transition-colors">Pathologies</Link>
          <ChevronRight className="size-3" />
          <span className="text-gray-600">{meta.shortTitle}</span>
        </nav>

        {/* Header */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm mb-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl flex-shrink-0" aria-hidden="true">{meta.emoji}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#5B4EC4] bg-[#5B4EC4]/8 px-2 py-1 rounded-full">
                  {categoryMeta.label}
                </span>
                {meta.cim11 && (
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    CIM-11 : {meta.cim11}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-[#1A1A2E] leading-tight">{meta.shortTitle}</h1>
              <p className="article-intro text-sm text-gray-600 mt-2 leading-relaxed">{meta.description}</p>

              {/* Keywords pills — pour GEO / snippet */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {meta.keywords.slice(0, 6).map((kw) => (
                  <span key={kw} className="text-[10px] text-[#5B4EC4] bg-[#5B4EC4]/8 px-2 py-0.5 rounded-full font-medium">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {article ? (
          <>
            {/* Article content */}
            <article className="rounded-2xl border bg-white p-6 shadow-sm mb-6">
              {article.excerpt && (
                <p className="text-sm text-[#4A4A5A] leading-relaxed mb-5 pb-5 border-b border-gray-100 font-medium">
                  {article.excerpt}
                </p>
              )}
              <div className="article-body max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: () => null,
                    h2: ({ children }) => (
                      <h2 className="text-base font-bold text-[#1A1A2E] mt-8 mb-3 pb-2 border-b border-gray-100">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-semibold text-[#1A1A2E] mt-5 mb-2">{children}</h3>
                    ),
                    h4: ({ children }) => (
                      <h4 className="text-sm font-medium text-gray-700 mt-4 mb-1">{children}</h4>
                    ),
                    p: ({ children }) => (
                      <p className="text-sm text-gray-700 leading-relaxed my-2">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-[#1A1A2E]">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="text-gray-600 not-italic">{children}</em>
                    ),
                    ul: ({ children }) => (
                      <ul className="my-3 space-y-1.5 pl-4">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="my-3 space-y-1.5 pl-4 list-decimal">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-sm text-gray-700 leading-relaxed list-disc">{children}</li>
                    ),
                    hr: () => (
                      <hr className="my-6 border-gray-100" />
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#5B4EC4] hover:underline font-medium"
                      >
                        {children}
                      </a>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-[#5B4EC4]/30 pl-4 my-4 text-sm text-gray-600 italic">
                        {children}
                      </blockquote>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-5 rounded-xl border border-gray-100">
                        <table className="w-full text-sm border-collapse">{children}</table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-gray-50">{children}</thead>
                    ),
                    th: ({ children }) => (
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-3 py-2 text-sm text-gray-700 border-b border-gray-50">{children}</td>
                    ),
                    tr: ({ children }) => (
                      <tr className="hover:bg-gray-50/50 transition-colors">{children}</tr>
                    ),
                    code: ({ children }) => (
                      <code className="text-xs bg-gray-100 text-[#5B4EC4] px-1.5 py-0.5 rounded font-mono">{children}</code>
                    ),
                  }}
                >
                  {preprocessContent(article.content)}
                </ReactMarkdown>
              </div>

              {/* Sources */}
              {article.sources && article.sources.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">Sources</p>
                  <p className="text-[11px] text-gray-500">{article.sources.join(" · ")}</p>
                </div>
              )}
            </article>

            {/* FAQ — optimisée GEO (citée par les IA de recherche) */}
            {faqItems && faqItems.length > 0 && (
              <section className="rounded-2xl border bg-white p-6 shadow-sm mb-6">
                <div className="flex items-center gap-2 mb-5">
                  <HelpCircle className="size-4 text-[#5B4EC4]" />
                  <h2 className="text-base font-bold text-[#1A1A2E]">Questions fréquentes</h2>
                </div>
                <div className="space-y-4">
                  {faqItems.map((faq, i) => (
                    <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <p className="text-sm font-semibold text-[#1A1A2E] mb-1.5">{faq.question}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          /* État "fiche en préparation" — propre, sans contenu clinique IP */
          <div className="rounded-2xl border bg-white p-8 shadow-sm mb-6 text-center">
            <BookOpen className="size-10 text-[#5B4EC4]/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-[#1A1A2E] mb-1">
              Fiche en cours de rédaction
            </p>
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
              Notre équipe rédige actuellement le contenu détaillé de cette pathologie
              à partir des recommandations HAS, SFP et des sociétés savantes françaises.
            </p>
            <a
              href="https://www.has-sante.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#5B4EC4] hover:underline mt-4 font-medium"
            >
              Consulter les recommandations HAS →
            </a>
          </div>
        )}

        {/* Bloc expertise Nami — visible de tous, ne révèle pas l'IP */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm mb-6">
          <div className="flex items-start gap-3">
            <Stethoscope className="size-5 text-[#2BA89C] flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-[#1A1A2E] mb-1">
                Coordonnez ce parcours avec Nami
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                Nami aide les équipes pluridisciplinaires à structurer le suivi de leurs patients —
                partage d'informations entre soignants, organisation des consultations, centralisation du dossier.
                Utilisé par des diététiciens, psychiatres, médecins généralistes et pédiatres.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/signup"
                  className="rounded-lg bg-[#5B4EC4] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  Créer un compte soignant
                </Link>
                <Link
                  href="/trouver-un-soignant"
                  className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Trouver un soignant
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer légal */}
        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          Les informations de cette page sont destinées aux professionnels de santé et au grand public
          à titre informatif. Elles ne remplacent pas un avis médical.
          Nami n&apos;est pas un dispositif médical. Sources : HAS, SFP, sociétés savantes françaises.
        </p>

      </div>
    </div>
  )
}
