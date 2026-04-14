"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useCockpitHeader } from "@/contexts/CockpitHeaderContext"
import { cn } from "@/lib/utils"
import { ActivityFeedBell } from "@/components/ui/ActivityFeed"

// ─── Breadcrumb labels ────────────────────────────────────────────────────────

const ROUTE_LABELS: Record<string, string> = {
  "aujourd-hui": "Aujourd'hui",
  agenda: "Agenda",
  facturation: "Facturation",
  patients: "Patients",
  alertes: "Rappels",
  taches: "Tâches",
  protocoles: "Références",
  intelligence: "Base documentaire",
  documents: "Documents",
  adressages: "Adressages",
  collaboration: "Réseau",
  equipe: "Équipe",
  annuaire: "Annuaire",
  reglages: "Réglages",
  admin: "Admin",
  upgrade: "Upgrade",
}

function buildCrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean)
  const crumbs: { label: string; href: string }[] = []

  for (let i = 0; i < parts.length; i++) {
    const segment = parts[i]
    const href = "/" + parts.slice(0, i + 1).join("/")
    const label = ROUTE_LABELS[segment] ?? segment
    crumbs.push({ label, href })
  }

  return crumbs
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CockpitHeader() {
  const pathname = usePathname()
  const { title, action } = useCockpitHeader()
  const crumbs = buildCrumbs(pathname)

  const actionVariant = action?.variant ?? "primary"

  return (
    <header className="h-14 shrink-0 sticky top-0 z-30 flex items-center justify-between gap-4 px-6 bg-white/95 backdrop-blur-sm border-b border-[#E8ECF4]">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm min-w-0" aria-label="Breadcrumb">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <span key={crumb.href} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && <ChevronRight size={13} className="text-[#CBD5E1] shrink-0" />}
              {isLast ? (
                <span className="font-semibold text-[#0F172A] truncate" style={{ fontFamily: "var(--font-jakarta)" }}>
                  {title ?? crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-[#94A3B8] hover:text-[#5B4EC4] transition-colors truncate"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          )
        })}
      </nav>

      {/* Activity bell */}
      <ActivityFeedBell />

      {/* ⌘K hint */}
      <button
        onClick={() => {
          const e = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
          window.dispatchEvent(e)
        }}
        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8ECF4] text-[#8A8A96] text-xs hover:border-[#5B4EC4] hover:text-[#5B4EC4] transition-colors shrink-0"
        title="Recherche rapide (⌘K)"
      >
        <span className="text-xs">🔍</span>
        <span className="font-medium" style={{ fontFamily: "var(--font-jakarta)" }}>Recherche</span>
        <kbd className="text-[9px] bg-[#F1F5F9] border border-[#E2E8F0] rounded px-1 font-mono">⌘K</kbd>
      </button>

      {/* Primary action */}
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shrink-0 transition-all duration-150",
            actionVariant === "primary" && "bg-[#5B4EC4] text-white hover:bg-[#4A3DB3] shadow-sm hover:shadow-md",
            actionVariant === "danger"  && "bg-red-500 text-white hover:bg-red-600",
            actionVariant === "ghost"   && "bg-transparent border border-[#E2E8F0] text-[#4A4A5A] hover:bg-[#F8F9FA]",
          )}
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          {action.icon && <span className="shrink-0">{action.icon}</span>}
          {action.label}
        </button>
      )}
    </header>
  )
}
