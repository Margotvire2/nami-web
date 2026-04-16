"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { apiWithToken } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { getCareTypeLabel } from "@/lib/caseType"
import {
  Search, X, User, Calendar, CheckSquare,
  MessageSquare, FileText, Settings, Mic,
  ChevronRight, Stethoscope,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type PaletteItem = {
  id: string
  type: "patient" | "action" | "nav"
  label: string
  sublabel?: string
  icon: React.ReactNode
  onSelect: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CommandPalette() {
  const { accessToken } = useAuthStore()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const api = apiWithToken(accessToken ?? "")

  const { data: cases } = useQuery({
    queryKey: ["care-cases", "all"],
    queryFn: () => api.careCases.list(),
    enabled: !!accessToken && open,
    staleTime: 2 * 60_000,
  })

  // ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((o) => !o)
        setQuery("")
        setActiveIdx(0)
      }
      if (e.key === "Escape" && open) setOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40)
  }, [open])

  const close = useCallback(() => {
    setOpen(false)
    setQuery("")
    setActiveIdx(0)
  }, [])

  const go = useCallback((href: string) => {
    close()
    router.push(href)
  }, [close, router])

  // Reset index on query change
  useEffect(() => { setActiveIdx(0) }, [query])

  // ─── Build items ──────────────────────────────────────────────────────────

  const q = query.toLowerCase()

  const patientItems: PaletteItem[] = (cases ?? [])
    .filter((c) => {
      if (!query) return true
      return (
        c.patient.firstName.toLowerCase().includes(q) ||
        c.patient.lastName.toLowerCase().includes(q) ||
        c.caseTitle.toLowerCase().includes(q) ||
        getCareTypeLabel(c.caseType).toLowerCase().includes(q)
      )
    })
    .slice(0, query ? 8 : 3)
    .map((c) => ({
      id: `patient-${c.id}`,
      type: "patient" as const,
      label: `${c.patient.firstName} ${c.patient.lastName}`,
      sublabel: c.caseTitle,
      icon: <User size={14} style={{ color: "#5B4EC4" }} />,
      onSelect: () => go(`/patients/${c.id}`),
    }))

  const ACTIONS: PaletteItem[] = [
    {
      id: "dictate",
      type: "action",
      label: "Dicter une consultation",
      sublabel: "Ouvrir l'enregistrement vocal",
      icon: <Mic size={14} style={{ color: "#5B4EC4" }} />,
      onSelect: close,
    },
    {
      id: "new-patient",
      type: "action",
      label: "Nouveau patient",
      icon: <User size={14} style={{ color: "#5B4EC4" }} />,
      onSelect: () => go("/patients"),
    },
    {
      id: "new-rdv",
      type: "action",
      label: "Nouveau rendez-vous",
      icon: <Calendar size={14} style={{ color: "#5B4EC4" }} />,
      onSelect: () => go("/agenda"),
    },
    {
      id: "knowledge",
      type: "action",
      label: "Chercher dans la base documentaire",
      sublabel: "HAS · FFAB · Orphanet · Algorithmes",
      icon: <FileText size={14} style={{ color: "#5B4EC4" }} />,
      onSelect: () => go("/intelligence"),
    },
  ]

  const NAV: PaletteItem[] = [
    { id: "nav-today",    type: "nav", label: "Aujourd'hui",    icon: <Calendar size={13} style={{ color: "#8A8A96" }} />,    onSelect: () => go("/aujourd-hui") },
    { id: "nav-patients", type: "nav", label: "Patients",       icon: <Stethoscope size={13} style={{ color: "#8A8A96" }} />, onSelect: () => go("/patients") },
    { id: "nav-messages", type: "nav", label: "Messages",       icon: <MessageSquare size={13} style={{ color: "#8A8A96" }} />, onSelect: () => go("/messages") },
    { id: "nav-tasks",    type: "nav", label: "Tâches",         icon: <CheckSquare size={13} style={{ color: "#8A8A96" }} />,   onSelect: () => go("/taches") },
    { id: "nav-settings", type: "nav", label: "Réglages",       icon: <Settings size={13} style={{ color: "#8A8A96" }} />,     onSelect: () => go("/reglages") },
  ]

  const actionItems = ACTIONS.filter((a) =>
    !query || a.label.toLowerCase().includes(q) || (a.sublabel?.toLowerCase().includes(q) ?? false)
  )
  const navItems = NAV.filter((n) =>
    !query || n.label.toLowerCase().includes(q)
  )

  const sections: { title?: string; items: PaletteItem[] }[] = query
    ? [{ items: [...patientItems, ...actionItems, ...navItems] }]
    : [
        ...(patientItems.length ? [{ title: "RÉCENTS", items: patientItems }] : []),
        { title: "ACTIONS RAPIDES", items: actionItems },
        { title: "NAVIGATION", items: navItems },
      ]

  const allItems = sections.flatMap((s) => s.items)

  // ─── Key nav ──────────────────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, allItems.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      allItems[activeIdx]?.onSelect()
    }
  }

  if (!open) return null

  let runningIdx = -1

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(15,10,30,0.48)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "10vh",
        animation: "cmdBgIn 160ms ease forwards",
      }}
      onClick={close}
    >
      <style>{`
        @keyframes cmdBgIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cmdIn { from { opacity: 0; transform: scale(0.96) translateY(-8px) } to { opacity: 1; transform: scale(1) translateY(0) } }
        @keyframes cmdItem { from { opacity: 0; transform: translateX(-3px) } to { opacity: 1; transform: translateX(0) } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(640px, 94vw)",
          background: "#FFFFFF",
          borderRadius: 20,
          boxShadow: "0 32px 80px rgba(15,10,30,0.22), 0 0 0 1px rgba(91,78,196,0.1)",
          overflow: "hidden",
          animation: "cmdIn 200ms cubic-bezier(0.16,1,0.3,1) forwards",
          maxHeight: "68vh",
          display: "flex", flexDirection: "column",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* Search bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 20px",
          borderBottom: "1px solid #F1F5F9",
        }}>
          <Search size={17} style={{ color: "#5B4EC4", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Chercher un patient, une action, une page…"
            style={{
              flex: 1, border: "none", outline: "none",
              fontSize: 15, color: "#1A1A2E",
              background: "transparent", fontFamily: "inherit",
            }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: "#8A8A96" }}>
              <X size={14} />
            </button>
          )}
          <kbd style={{ fontSize: 10, color: "#8A8A96", border: "1px solid #E8ECF4", borderRadius: 6, padding: "2px 6px", background: "#F8F9FA", fontFamily: "inherit" }}>
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {allItems.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "#8A8A96", fontSize: 13 }}>
              Aucun résultat pour « {query} »
            </div>
          ) : (
            sections.map((section, si) => {
              if (section.items.length === 0) return null
              return (
                <div key={si} style={{ paddingBottom: 4 }}>
                  {section.title && (
                    <div style={{
                      padding: "10px 20px 4px",
                      fontSize: 10, fontWeight: 700, color: "#8A8A96",
                      letterSpacing: "0.08em", textTransform: "uppercase",
                    }}>
                      {section.title}
                    </div>
                  )}
                  {section.items.map((item) => {
                    const idx = ++runningIdx
                    const isActive = idx === activeIdx
                    return (
                      <button
                        key={item.id}
                        onClick={item.onSelect}
                        onMouseEnter={() => setActiveIdx(idx)}
                        style={{
                          width: "100%", textAlign: "left", border: "none",
                          padding: "9px 20px",
                          display: "flex", alignItems: "center", gap: 12,
                          cursor: "pointer", fontFamily: "inherit",
                          background: isActive ? "rgba(91,78,196,0.06)" : "transparent",
                          transition: "background 80ms",
                          animation: `cmdItem 160ms ${Math.min(idx * 25, 160)}ms both`,
                        }}
                      >
                        <span style={{ flexShrink: 0, width: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {item.icon}
                        </span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#1A1A2E", lineHeight: 1.3 }}>
                            {item.label}
                          </span>
                          {item.sublabel && (
                            <span style={{ display: "block", fontSize: 11, color: "#8A8A96", lineHeight: 1.3, marginTop: 1 }}>
                              {item.sublabel}
                            </span>
                          )}
                        </span>
                        {isActive && (
                          <ChevronRight size={13} style={{ color: "#5B4EC4", flexShrink: 0 }} />
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div style={{
          padding: "8px 20px",
          borderTop: "1px solid #F1F5F9",
          display: "flex", alignItems: "center", gap: 16,
        }}>
          {[["↑↓", "naviguer"], ["↵", "sélectionner"], ["Esc", "fermer"]].map(([key, hint]) => (
            <span key={key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#8A8A96" }}>
              <kbd style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 4, padding: "1px 5px", fontFamily: "inherit", fontSize: 10 }}>
                {key}
              </kbd>
              {hint}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
