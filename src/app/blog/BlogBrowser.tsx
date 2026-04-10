"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { Search, X, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Article {
  slug: string
  title: string
  excerpt: string | null
  category: string
  audience: string
  tags: string[]
  viewCount: number
}

interface Suggestion {
  slug: string
  title: string
  tags: string[]
}

// ─── Config ───────────────────────────────────────────────────────────────────

const DOMAINS = [
  { key: "all",       label: "Tout",        emoji: "🏥" },
  { key: "pediatrie", label: "Pédiatrie",   emoji: "👶" },
  { key: "tca",       label: "TCA",         emoji: "🧠" },
  { key: "obesite",   label: "Obésité",     emoji: "⚖️" },
]

const AUDIENCE_FILTERS = [
  { key: "all",         label: "Tous" },
  { key: "parent",      label: "Parents" },
  { key: "patient",     label: "Patients" },
]

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  patient_guide:       { label: "Guide patient",   color: "bg-blue-50 text-blue-700" },
  clinical_practice:   { label: "Pratique clinique", color: "bg-emerald-50 text-emerald-700" },
  algorithm_explained: { label: "Algorithme",       color: "bg-purple-50 text-purple-700" },
  news:                { label: "Actualité",         color: "bg-gray-100 text-gray-600" },
  glossary:            { label: "Glossaire",         color: "bg-indigo-50 text-indigo-700" },
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BlogBrowser({
  initialArticles,
  initialTotal,
  apiUrl,
  pageSize,
}: {
  initialArticles: Article[]
  initialTotal: number
  apiUrl: string
  pageSize: number
}) {
  const [query, setQuery]             = useState("")
  const [domain, setDomain]           = useState("all")
  const [audience, setAudience]       = useState("all")
  const [page, setPage]               = useState(1)
  const [articles, setArticles]       = useState<Article[]>(initialArticles)
  const [total, setTotal]             = useState(initialTotal)
  const [loading, setLoading]         = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSug, setShowSug]         = useState(false)
  const searchRef  = useRef<HTMLInputElement>(null)
  const sugRef     = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Fetch articles ──────────────────────────────────────────────────────────

  const fetchArticles = useCallback(async (q: string, dom: string, aud: string, pg: number) => {
    setLoading(true)
    const params = new URLSearchParams({
      limit: String(pageSize),
      offset: String((pg - 1) * pageSize),
    })
    if (q)           params.set("q", q)
    if (dom !== "all") params.set("domain", dom)
    if (aud !== "all") params.set("audience", aud)

    try {
      const res = await fetch(`${apiUrl}/blog/articles?${params}`)
      if (!res.ok) return
      const data = await res.json()
      setArticles(data.articles)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }, [apiUrl, pageSize])

  // ── Suggestions autocomplete ────────────────────────────────────────────────

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return }
    const res = await fetch(`${apiUrl}/blog/suggestions?q=${encodeURIComponent(q)}`)
    if (res.ok) setSuggestions(await res.json())
  }, [apiUrl])

  // ── Debounce query → fetch ──────────────────────────────────────────────────

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      fetchArticles(query, domain, audience, 1)
      if (query.length >= 2) fetchSuggestions(query)
      else setSuggestions([])
    }, 280)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, domain, audience]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Page change ─────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchArticles(query, domain, audience, page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Close suggestions on click outside ─────────────────────────────────────

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        sugRef.current && !sugRef.current.contains(e.target as Node) &&
        searchRef.current && !searchRef.current.contains(e.target as Node)
      ) setShowSug(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const pickSuggestion = (s: Suggestion) => {
    setQuery(s.title)
    setShowSug(false)
    fetchArticles(s.title, domain, audience, 1)
  }

  const resetSearch = () => {
    setQuery("")
    setSuggestions([])
    setPage(1)
    fetchArticles("", domain, audience, 1)
    searchRef.current?.focus()
  }

  const totalPages = Math.ceil(total / pageSize)

  // ── Sections mode (no active search/filter) ─────────────────────────────────
  // Quand pas de filtre actif, on regroupe par domaine pour l'affichage éditorial

  const isFiltered = query !== "" || domain !== "all" || audience !== "all"

  const sections = !isFiltered ? buildSections(articles) : null

  return (
    <div className="space-y-6">

      {/* ── Barre de recherche ── */}
      <div className="relative">
        <div className="flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 shadow-sm focus-within:border-[#4F46E5] focus-within:shadow-md transition-all">
          <Search className="size-4 text-gray-400 shrink-0" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSug(true) }}
            onFocus={() => { if (suggestions.length) setShowSug(true) }}
            placeholder="Rechercher : boulimie, fièvre enfant, chirurgie bariatrique…"
            className="flex-1 text-sm text-gray-800 placeholder:text-gray-400 outline-none bg-transparent"
          />
          {query && (
            <button onClick={resetSearch} className="text-gray-300 hover:text-gray-500 transition-colors">
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSug && suggestions.length > 0 && (
          <div
            ref={sugRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg z-30 overflow-hidden"
          >
            {suggestions.map((s) => (
              <button
                key={s.slug}
                onClick={() => pickSuggestion(s)}
                className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-indigo-50 transition-colors text-left"
              >
                <Search className="size-3.5 text-gray-300 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 line-clamp-1">{highlightMatch(s.title, query)}</p>
                  {s.tags.slice(0, 2).map((t) => (
                    <span key={t} className="text-[10px] text-indigo-400 mr-1.5">{t}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Filtres domaine + audience ── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5 flex-wrap">
          {DOMAINS.map((d) => (
            <button
              key={d.key}
              onClick={() => { setDomain(d.key); setPage(1) }}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${
                domain === d.key
                  ? "bg-[#4F46E5] text-white border-[#4F46E5] shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#4F46E5]/40 hover:text-[#4F46E5]"
              }`}
            >
              <span>{d.emoji}</span> {d.label}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />

        <div className="flex gap-1.5">
          {AUDIENCE_FILTERS.map((a) => (
            <button
              key={a.key}
              onClick={() => { setAudience(a.key); setPage(1) }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${
                audience === a.key
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        {isFiltered && (
          <button
            onClick={() => { setQuery(""); setDomain("all"); setAudience("all"); setPage(1) }}
            className="ml-auto text-xs text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors"
          >
            <X className="size-3" /> Effacer les filtres
          </button>
        )}
      </div>

      {/* ── Résultats ── */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-white p-5 h-32 animate-pulse" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-gray-400">Aucun article pour cette recherche.</p>
          <button onClick={resetSearch} className="mt-3 text-sm text-[#4F46E5] hover:underline">
            Effacer la recherche
          </button>
        </div>
      ) : sections ? (
        // Mode éditorial — sections par domaine
        <div className="space-y-10">
          {sections.map((sec) => (
            <section key={sec.domain}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">{sec.emoji}</span>
                <h2 className="text-base font-bold text-gray-900">{sec.title}</h2>
                <span className="text-xs text-gray-400 ml-1">{sec.articles.length} articles</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sec.articles.map((a) => <ArticleCard key={a.slug} article={a} />)}
              </div>
            </section>
          ))}
        </div>
      ) : (
        // Mode liste — résultats filtrés/recherche
        <>
          <p className="text-xs text-gray-400">
            {total} résultat{total > 1 ? "s" : ""}
            {query && <> pour <strong className="text-gray-600">« {query} »</strong></>}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {articles.map((a) => <ArticleCard key={a.slug} article={a} />)}
          </div>
        </>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && !sections && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-lg border bg-white px-3 py-2 text-sm text-gray-600 hover:border-[#4F46E5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="size-4" /> Précédent
          </button>
          <span className="text-sm text-gray-400 px-2">Page {page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 rounded-lg border bg-white px-3 py-2 text-sm text-gray-600 hover:border-[#4F46E5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Suivant <ChevronRight className="size-4" />
          </button>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="mt-8 rounded-xl border bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Vous êtes professionnel de santé ?</h2>
        <p className="text-sm text-gray-500 mt-1">Coordonnez vos parcours de soins complexes avec Nami.</p>
        <Link href="/signup" className="inline-block mt-4 rounded-lg bg-[#4F46E5] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90">
          Créer mon compte
        </Link>
      </div>
    </div>
  )
}

// ─── Article card ─────────────────────────────────────────────────────────────

function ArticleCard({ article: a }: { article: Article }) {
  const cat = CATEGORY_META[a.category] ?? CATEGORY_META.news
  return (
    <Link
      href={`/blog/${a.slug}`}
      className="group rounded-xl border bg-white p-4 shadow-sm hover:shadow-md hover:border-[#4F46E5]/30 transition-all flex flex-col"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.color}`}>
          {cat.label}
        </span>
        {a.audience === "parent" && (
          <span className="text-[10px] text-gray-400">Parents</span>
        )}
      </div>
      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#4F46E5] transition-colors line-clamp-2 flex-1">
        {a.title}
      </h3>
      {a.excerpt && (
        <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{a.excerpt}</p>
      )}
      <div className="flex items-center justify-between mt-3">
        <div className="flex flex-wrap gap-1">
          {a.tags.slice(0, 2).map((t) => (
            <span key={t} className="text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{t}</span>
          ))}
        </div>
        <ArrowRight className="size-3.5 text-gray-300 group-hover:text-[#4F46E5] transition-colors shrink-0" />
      </div>
    </Link>
  )
}

// ─── Build editorial sections ─────────────────────────────────────────────────

const SECTION_DEFS = [
  {
    domain: "pediatrie",
    emoji: "👶",
    title: "Pédiatrie & santé de l'enfant",
    tags: ["pédiatrie", "enfant", "santé enfant", "parents", "nourrisson"],
  },
  {
    domain: "tca",
    emoji: "🧠",
    title: "Troubles du comportement alimentaire",
    tags: ["TCA", "troubles alimentaires", "anorexie", "boulimie", "hyperphagie", "ARFID"],
  },
  {
    domain: "obesite",
    emoji: "⚖️",
    title: "Obésité & poids",
    tags: ["obésité", "poids", "bariatrique", "métabolisme", "nutrition"],
  },
]

function buildSections(articles: Article[]) {
  const used = new Set<string>()
  const sections = SECTION_DEFS.map((def) => {
    const matched = articles
      .filter((a) => !used.has(a.slug) && a.tags.some((t) => def.tags.includes(t)))
      .slice(0, 6)
    matched.forEach((a) => used.add(a.slug))
    return { ...def, articles: matched }
  }).filter((s) => s.articles.length > 0)

  // Articles non classifiés
  const rest = articles.filter((a) => !used.has(a.slug))
  if (rest.length > 0) {
    sections.push({ domain: "autres", emoji: "📋", title: "Autres guides santé", tags: [], articles: rest.slice(0, 6) })
  }

  return sections
}

// ─── Highlight match ──────────────────────────────────────────────────────────

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <strong className="text-[#4F46E5] font-semibold">{text.slice(idx, idx + query.length)}</strong>
      {text.slice(idx + query.length)}
    </>
  )
}
