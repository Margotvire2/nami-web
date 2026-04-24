"use client"

import { Search } from "lucide-react"
import { AnimatedCounter } from "@/components/ui/AnimatedCounter"

const RESULTS = [
  {
    source: "HAS",
    sourceColor: "#2563EB",
    sourceBg: "rgba(37,99,235,0.08)",
    title: "Épilepsies de l'enfant — Parcours de soins",
    meta: "Haute Autorité de Santé · 2023 · 48 pages",
  },
  {
    source: "ILAE",
    sourceColor: "#7C3AED",
    sourceBg: "rgba(124,58,237,0.08)",
    title: "Classification des crises épileptiques — ILAE 2017",
    meta: "International League Against Epilepsy · 2017 · Révisé 2022",
  },
  {
    source: "NAMI",
    sourceColor: "#5B4EC4",
    sourceBg: "rgba(91,78,196,0.10)",
    title: "Épilepsie pédiatrique — Parcours structuré (14 métriques)",
    meta: "Fiche Nami · Synthèse terrain · Mise à jour janv. 2025",
  },
]

const BADGES = ["HAS", "FFAB", "ESPGHAN", "ILAE", "Consensus internationaux"]

export function KnowledgeSearch() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Search bar mockup */}
      <div style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid rgba(26,26,46,0.08)",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(26,26,46,0.06)",
      }}>
        {/* Input row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 18px",
          borderBottom: "1px solid rgba(26,26,46,0.06)",
        }}>
          <Search size={16} color="#6B7280" />
          <span style={{
            fontSize: 14,
            color: "#1A1A2E",
            fontWeight: 500,
            flex: 1,
          }}>
            épilepsie enfant protocole
          </span>
          <span style={{
            fontSize: 11,
            color: "#fff",
            background: "#5B4EC4",
            padding: "4px 12px",
            borderRadius: 100,
            fontWeight: 600,
          }}>
            Rechercher
          </span>
        </div>

        {/* Results */}
        <div>
          {RESULTS.map((r, i) => (
            <div key={r.source} style={{
              padding: "12px 18px",
              borderBottom: i < RESULTS.length - 1 ? "1px solid rgba(26,26,46,0.04)" : "none",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: r.sourceBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: r.sourceColor, letterSpacing: "0.04em" }}>
                  {r.source}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E", lineHeight: 1.4, marginBottom: 3 }}>
                  {r.title}
                </div>
                <div style={{ fontSize: 11, color: "#6B7280" }}>
                  {r.meta}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Counter row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#5B4EC4" }}>
          <AnimatedCounter target={22308} duration={2000} /> sources
        </span>
        <span style={{ fontSize: 13, color: "#6B7280" }}>·</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#5B4EC4" }}>
          <AnimatedCounter target={116000} duration={2200} /> liens
        </span>
        <span style={{ fontSize: 13, color: "#6B7280" }}>·</span>
        <span style={{ fontSize: 13, color: "#6B7280" }}>Recherche &lt; 200ms</span>
      </div>

      {/* Source badges */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        {BADGES.map((b) => (
          <span key={b} style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#6B7280",
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid rgba(26,26,46,0.08)",
          }}>
            {b}
          </span>
        ))}
      </div>
    </div>
  )
}
