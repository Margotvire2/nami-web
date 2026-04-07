"use client"

import { useState, useCallback } from "react"
import { Search, FileText, Loader2, BookOpen } from "lucide-react"
import { useAuthStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

interface FFABResult {
  slideId: number
  docTitle: string
  pageNumber: number
  excerpt: string
  rank: number
}

interface SearchResponse {
  query: string
  count: number
  source: string
  results: FFABResult[]
}

export function RechercheFFAB() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const token = useAuthStore((s) => s.accessToken)

  const search = useCallback(async () => {
    const q = query.trim()
    if (q.length < 2 || !token) return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${API_URL}/intelligence/search?q=${encodeURIComponent(q)}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Erreur ${res.status}`)
      }
      setResults(await res.json())
    } catch (err: any) {
      setError(err.message)
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, [query, token])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") search()
  }

  // Clean up the doc title (remove extension, truncate)
  const formatDocTitle = (filename: string) =>
    filename
      .replace(/\.(pdf|pptx?|docx?)$/i, "")
      .replace(/_/g, " ")
      .slice(0, 80)

  return (
    <div className="p-6 space-y-4">
      {/* Search input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher dans la base FFAB (ex: renutrition, potassium, HDJ...)"
            className="w-full rounded-xl border bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
          />
        </div>
        <button
          onClick={search}
          disabled={loading || query.trim().length < 2}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Rechercher"
          )}
        </button>
      </div>

      {/* Source badge */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-[10px] gap-1">
          <BookOpen className="size-3" />
          Source : DU TCA FFAB 2025-2026
        </Badge>
        <span className="text-[11px] text-muted-foreground">
          150 documents · 8 273 slides indexées
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {results.count} résultat{results.count > 1 ? "s" : ""} pour &laquo;{" "}
            {results.query} &raquo;
          </p>

          {results.results.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Aucun résultat. Essayez un autre terme.
            </div>
          )}

          {results.results.map((r, idx) => (
            <Card key={`${r.slideId}-${idx}`} className="hover:border-primary/20 hover:shadow-sm transition-all">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <FileText className="size-3.5 text-primary shrink-0" />
                      <p className="font-medium text-sm truncate">
                        {formatDocTitle(r.docTitle)}
                      </p>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        p. {r.pageNumber}
                      </Badge>
                    </div>
                    <p
                      className="mt-1.5 text-sm text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: r.excerpt }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!results && !error && (
        <div className="py-12 text-center space-y-2">
          <Search className="size-8 mx-auto text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Recherchez dans les 150 documents du DU TCA FFAB
          </p>
          <p className="text-xs text-muted-foreground/60">
            Critères d&apos;hospitalisation, seuils biologiques, protocoles de renutrition, comorbidités...
          </p>
        </div>
      )}
    </div>
  )
}
