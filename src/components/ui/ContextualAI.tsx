"use client"

import { useState, useRef, useCallback, useId } from "react"
import { useAuthStore } from "@/lib/store"
import { apiWithToken } from "@/lib/api"
import { X } from "lucide-react"

interface ContextualAIProps {
  /** La query envoyée à la base documentaire */
  query: string
  /** Le contenu à wrapper */
  children: React.ReactNode
  /** Si false, le bouton n'est pas rendu (tiers non-Intelligence) */
  enabled?: boolean
}

export function ContextualAI({ query, children, enabled = true }: ContextualAIProps) {
  const [hovered, setHovered] = useState(false)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ title: string; excerpt: string; source: string; score: number } | null>(null)
  const { accessToken } = useAuthStore()
  const popoverId = useId()
  const containerRef = useRef<HTMLSpanElement>(null)

  const fetchInsight = useCallback(async () => {
    if (!accessToken || !query.trim() || result) {
      setOpen(true)
      return
    }
    setLoading(true)
    setOpen(true)
    try {
      const api = apiWithToken(accessToken)
      const data = await api.intelligence.knowledgeSearch(query, { limit: 1 })
      const first = data.results?.[0]
      if (first) {
        const cat = first.slug.startsWith("algo_") ? "Algorithme"
          : first.slug.startsWith("pcr-") ? "PCR"
          : first.slug.startsWith("ke_") ? "Référence"
          : "Fiche"
        setResult({
          title: first.sectionTitle || first.slug,
          excerpt: first.content.replace(/\n+/g, " ").trim().slice(0, 200),
          source: cat,
          score: first.score,
        })
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [accessToken, query, result])

  if (!enabled) return <>{children}</>

  const SOURCE_COLOR: Record<string, string> = {
    Fiche:      "#059669",
    Algorithme: "#D97706",
    PCR:        "#7C3AED",
    Référence:  "#2563EB",
  }

  return (
    <span
      ref={containerRef}
      style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 3 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false) }}
    >
      {children}

      {/* ✨ button */}
      {hovered && !open && (
        <button
          onClick={(e) => { e.stopPropagation(); fetchInsight() }}
          title="Info documentaire"
          style={{
            width: 18, height: 18,
            borderRadius: "50%",
            background: "rgba(91,78,196,0.08)",
            border: "1px solid rgba(91,78,196,0.15)",
            cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, lineHeight: 1,
            padding: 0,
            animation: "sparkleIn 120ms ease forwards",
            flexShrink: 0,
          }}
        >
          <style>{`@keyframes sparkleIn { from { opacity:0; transform:scale(0.6) } to { opacity:1; transform:scale(1) } }`}</style>
          ✨
        </button>
      )}

      {/* Popover */}
      {open && (
        <div
          id={popoverId}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            width: 260,
            background: "#1A1A2E",
            borderRadius: 12,
            padding: "12px 14px",
            zIndex: 200,
            boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
            animation: "popoverIn 180ms cubic-bezier(0.16,1,0.3,1) forwards",
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseLeave={() => setOpen(false)}
        >
          <style>{`@keyframes popoverIn { from { opacity:0; transform:scale(0.92) translateY(-4px) } to { opacity:1; transform:scale(1) translateY(0) } }`}</style>

          {/* Close */}
          <button
            onClick={() => setOpen(false)}
            style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: "#6B7280", padding: 2 }}
          >
            <X size={11} />
          </button>

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6B7280", fontSize: 12 }}>
              <div style={{ width: 10, height: 10, border: "1.5px solid #5B4EC4", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 600ms linear infinite" }} />
              <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
              Recherche documentaire…
            </div>
          )}

          {!loading && result && (
            <>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#FAFAF8", lineHeight: 1.3, marginBottom: 6, paddingRight: 16 }}>
                {result.title}
              </div>
              <p style={{ fontSize: 11, color: "#C4C4CC", lineHeight: 1.5, marginBottom: 8 }}>
                {result.excerpt}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 4,
                    background: `${SOURCE_COLOR[result.source] ?? "#5B4EC4"}20`,
                    color: SOURCE_COLOR[result.source] ?? "#8B7FD9",
                    border: `1px solid ${SOURCE_COLOR[result.source] ?? "#5B4EC4"}40`,
                  }}>
                    {result.source}
                  </span>
                  <span style={{ fontSize: 9, color: "#6B7280" }}>{Math.round(result.score * 100)}%</span>
                </div>
              </div>
              <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 9, color: "#374151" }}>
                Info documentaire — non clinique
              </div>
            </>
          )}

          {!loading && !result && (
            <p style={{ fontSize: 12, color: "#6B7280" }}>Aucun résultat pour cette requête.</p>
          )}
        </div>
      )}
    </span>
  )
}
