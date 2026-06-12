"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Search } from "lucide-react"
import { useCockpitHeader } from "@/contexts/CockpitHeaderContext"
import { cn } from "@/lib/utils"
import { StructureSwitcher } from "@/components/header/StructureSwitcher"
import { NotificationBell } from "@/components/cockpit/notifications/NotificationBell"

// ─── Breadcrumb labels ────────────────────────────────────────────────────────

// INIT-682 : règle des 4 surfaces (sidebar ↔ breadcrumb ↔ titre ↔ URL).
// - "alertes" retiré : entrée sidebar « Rappels »→/alertes supprimée
//   (la route redirigeait déjà 308 vers /taches → doublon retiré).
const ROUTE_LABELS: Record<string, string> = {
  "aujourd-hui": "Aujourd'hui",
  agenda: "Agenda",
  facturation: "Facturation",
  patients: "Patients",
  taches: "Tâches",
  intelligence: "Base documentaire",
  documents: "Documents",
  adressages: "Adressages",
  messages: "Messages",
  communications: "Communications",
  collaboration: "Réseau",
  reseau: "Vue réseau",
  evenements: "Événements",
  equipe: "Équipe",
  annuaire: "Annuaire",
  reglages: "Réglages",
  admin: "Admin",
  upgrade: "Upgrade",
}

// IDs internes (>15 chars alphanumériques) → masqués pour UX + confidentialité
function isInternalId(segment: string): boolean {
  return segment.length > 15 && /^[a-z0-9]+$/i.test(segment)
}

function buildCrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean)
  const crumbs: { label: string; href: string }[] = []

  for (let i = 0; i < parts.length; i++) {
    const segment = parts[i]
    if (isInternalId(segment)) continue  // ne pas afficher l'ID brut
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

      <div className="flex items-center gap-2 shrink-0">
        {/* Switcher multi-casquette — masqué automatiquement si pas pertinent */}
        <StructureSwitcher />

        <NotificationBell />

        {/* ⌘K — barre de recherche visible (déclenche CommandPalette via keydown synthétique) */}
        <button
          onClick={() => {
            const e = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
            window.dispatchEvent(e)
          }}
          className="hidden sm:flex items-center gap-2 w-[240px] px-3 py-2 rounded-lg bg-[#F5F3FF] border border-[#E8ECF4] text-[#5B4EC4] text-sm hover:bg-[#EEEBFA] hover:border-[#5B4EC4] transition-colors"
          aria-label="Ouvrir la recherche rapide (⌘K)"
          title="Recherche rapide (⌘K)"
        >
          <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="flex-1 text-left font-medium text-[#5B4EC4]" style={{ fontFamily: "var(--font-jakarta)" }}>Rechercher</span>
          <kbd className="text-[10px] bg-white border border-[#E2E8F0] text-[#5B4EC4] rounded px-1.5 py-0.5 font-mono shrink-0">⌘K</kbd>
        </button>
      </div>

      {/* Primary action */}
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shrink-0 transition-all duration-150",
            actionVariant === "primary" && "bg-[#5B4EC4] text-white hover:bg-[#4A3DB3] shadow-sm hover:shadow-md",
            actionVariant === "danger"  && "bg-red-500 text-white hover:bg-red-600",
            actionVariant === "ghost"   && "bg-transparent border border-[#E2E8F0] text-[#374151] hover:bg-[#F8F9FA]",
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
