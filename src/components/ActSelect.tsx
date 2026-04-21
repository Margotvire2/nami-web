"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { Search, Plus, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { BillingTariff } from "@/lib/api"

const API = process.env.NEXT_PUBLIC_API_URL || "https://nami-production-f268.up.railway.app"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActToAdd {
  tariffId: string
  code: string
  label: string
  unitPrice: number
  quantity: number
  depassement: number
}

interface Props {
  profession: string
  sector: "1" | "2" | "3"
  isOPTAM: boolean
  onAdd: (act: ActToAdd) => void
  className?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<
  BillingTariff["category"],
  { label: string; badge: string; activeChip: string }
> = {
  CONSULTATION: {
    label: "Consultations",
    badge: "bg-indigo-100 text-indigo-700",
    activeChip: "border-indigo-300 bg-indigo-50 text-indigo-700 font-medium",
  },
  VISIT: {
    label: "Visites",
    badge: "bg-violet-100 text-violet-700",
    activeChip: "border-violet-300 bg-violet-50 text-violet-700 font-medium",
  },
  TECHNICAL: {
    label: "Actes techniques",
    badge: "bg-teal-100 text-teal-700",
    activeChip: "border-teal-300 bg-teal-50 text-teal-700 font-medium",
  },
  MAJORATION: {
    label: "Majorations",
    badge: "bg-amber-100 text-amber-700",
    activeChip: "border-amber-300 bg-amber-50 text-amber-700 font-medium",
  },
  FORFAIT: {
    label: "Forfaits",
    badge: "bg-emerald-100 text-emerald-700",
    activeChip: "border-emerald-300 bg-emerald-50 text-emerald-700 font-medium",
  },
}

const CATEGORY_ORDER: BillingTariff["category"][] = [
  "CONSULTATION",
  "VISIT",
  "TECHNICAL",
  "MAJORATION",
  "FORFAIT",
]

// Professions médicales — les actes sans spécialité explicite leur sont visibles
const MEDICAL_PROFESSIONS = new Set([
  "medecin_generaliste",
  "medecin_specialiste",
  "pediatre",
  "psychiatre",
  "pedopsychiatre",
  "ophtalmologue",
  "gynecologue",
  "endocrinologue",
  "cardiologue",
  "dermatologue",
  "neurologue",
])

// ─── Helpers ─────────────────────────────────────────────────────────────────

function matchesProfession(t: BillingTariff, profession: string): boolean {
  // Téléexpertise toujours visible (toutes professions)
  if (t.code === "RQD" || t.code === "TE2") return true
  // Acte avec spécialités explicites
  if (t.specialties.length > 0) return t.specialties.includes(profession)
  // Actes sans spécialité = contexte médical uniquement
  return MEDICAL_PROFESSIONS.has(profession)
}

function matchesSector(t: BillingTariff, sector: string, isOPTAM: boolean): boolean {
  if (!t.sector1Only) return true
  return sector === "1" || isOPTAM
}

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " €"
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ActSelect({ profession, sector, isOPTAM, onAdd, className }: Props) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<BillingTariff["category"] | null>(null)
  const [modal, setModal] = useState<BillingTariff | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [depassement, setDepassement] = useState(0)

  // Charge tous les tarifs une seule fois (5 min cache)
  const { data: allTariffs = [], isLoading } = useQuery({
    queryKey: ["billing-tariffs-all"],
    queryFn: async () => {
      const res = await fetch(`${API}/billing/tariffs?limit=500`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })
      if (!res.ok) throw new Error("Erreur chargement tarifs")
      return res.json() as Promise<BillingTariff[]>
    },
    staleTime: 5 * 60 * 1000,
  })

  // Actes de la profession + secteur
  const professionTariffs = useMemo(
    () => allTariffs.filter((t) => matchesProfession(t, profession) && matchesSector(t, sector, isOPTAM)),
    [allTariffs, profession, sector, isOPTAM]
  )

  // Compteurs par catégorie (avant filtre catégorie actif)
  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<BillingTariff["category"], number>> = {}
    for (const t of professionTariffs) {
      counts[t.category] = (counts[t.category] ?? 0) + 1
    }
    return counts
  }, [professionTariffs])

  // Liste finale filtrée
  const filtered = useMemo(() => {
    let list = professionTariffs
    if (activeCategory) list = list.filter((t) => t.category === activeCategory)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((t) => t.code.toLowerCase().includes(q) || t.label.toLowerCase().includes(q))
    }
    return list
  }, [professionTariffs, activeCategory, query])

  function openModal(t: BillingTariff) {
    setModal(t)
    setQuantity(1)
    setDepassement(0)
  }

  function confirmAdd() {
    if (!modal) return
    onAdd({
      tariffId: modal.id,
      code: modal.code,
      label: modal.label,
      unitPrice: modal.priceMetropole,
      quantity,
      depassement: sector !== "1" && !isOPTAM ? depassement : 0,
    })
    setModal(null)
  }

  const showDepassement = sector !== "1" && !isOPTAM
  const total = modal ? (modal.priceMetropole + depassement) * quantity : 0

  return (
    <div className={cn("space-y-2.5", className)}>
      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Acte NGAP/CCAM… (ex: G, AMK, déglutition)"
          className="w-full pl-9 pr-8 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 animate-spin" />
        )}
      </div>

      {/* Chips catégories */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "text-[11px] px-2.5 py-1 rounded-full border transition-colors",
            !activeCategory
              ? "border-[#5B4EC4] bg-[#EEEDFB] text-[#5B4EC4] font-medium"
              : "border-[#E8ECF4] text-muted-foreground hover:border-[#5B4EC4]/50"
          )}
        >
          Tous ({professionTariffs.length})
        </button>
        {CATEGORY_ORDER.filter((cat) => (categoryCounts[cat] ?? 0) > 0).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={cn(
              "text-[11px] px-2.5 py-1 rounded-full border transition-colors",
              activeCategory === cat
                ? CATEGORY_META[cat].activeChip
                : "border-[#E8ECF4] text-muted-foreground hover:border-[#5B4EC4]/50"
            )}
          >
            {CATEGORY_META[cat].label} {categoryCounts[cat]}
          </button>
        ))}
      </div>

      {/* Liste actes */}
      <div className="rounded-xl border border-[#E8ECF4] divide-y divide-[#F1F5F9] max-h-72 overflow-y-auto">
        {!isLoading && filtered.length === 0 && (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Aucun acte pour cette profession / recherche
          </div>
        )}
        {filtered.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-3 py-2.5 bg-white hover:bg-[#F8FAFF] transition-colors"
          >
            <span
              className={cn(
                "shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono whitespace-nowrap",
                CATEGORY_META[t.category].badge
              )}
            >
              {t.code}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-[#0F172A] truncate">{t.label}</p>
              {t.cumulRules && (
                <p className="text-[10px] text-[#5B4EC4]/70 truncate mt-0.5">⟳ {t.cumulRules}</p>
              )}
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-[12px] font-semibold text-[#0F172A] tabular-nums">
                {fmt(t.priceMetropole)}
              </span>
              <button
                onClick={() => openModal(t)}
                className="w-6 h-6 rounded-full bg-[#EEEDFB] hover:bg-[#5B4EC4] text-[#5B4EC4] hover:text-white flex items-center justify-center transition-colors"
                title={`Ajouter ${t.code}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal d'ajout */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            {/* En-tête */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded font-mono",
                      CATEGORY_META[modal.category].badge
                    )}
                  >
                    {modal.code}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{modal.nomenclature}</span>
                </div>
                <p className="text-[13px] font-semibold text-[#0F172A] leading-snug">{modal.label}</p>
              </div>
              <button
                onClick={() => setModal(null)}
                className="text-muted-foreground hover:text-foreground mt-0.5 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conditions / règles cumul */}
            {(modal.conditions || modal.cumulRules) && (
              <div className="bg-[#F8FAFF] rounded-lg px-3 py-2.5 space-y-1.5">
                {modal.conditions && (
                  <p className="text-[11px] text-[#475569]">
                    <span className="font-semibold text-[#5B4EC4]">Conditions : </span>
                    {modal.conditions}
                  </p>
                )}
                {modal.cumulRules && (
                  <p className="text-[11px] text-[#475569]">
                    <span className="font-semibold text-[#5B4EC4]">Cumul : </span>
                    {modal.cumulRules}
                  </p>
                )}
              </div>
            )}

            {/* Quantité + prix unitaire */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Quantité</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="mt-1 w-full h-9 border border-neutral-200 rounded-lg px-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Prix unitaire</label>
                <div className="mt-1 h-9 border border-[#E8ECF4] rounded-lg px-3 flex items-center text-sm font-medium text-[#0F172A] bg-[#F8FAFF]">
                  {fmt(modal.priceMetropole)}
                </div>
              </div>
            </div>

            {/* Dépassement — secteur 2/3 sans OPTAM uniquement */}
            {showDepassement && (
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Dépassement{" "}
                  <span className="text-amber-600">(secteur {sector}, sans OPTAM)</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={depassement}
                    onChange={(e) => setDepassement(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full h-9 border border-amber-200 rounded-lg px-3 pr-7 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground pointer-events-none">
                    €
                  </span>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between pt-1 border-t border-[#F1F5F9]">
              <span className="text-[12px] text-muted-foreground">
                Total ({quantity} × {fmt(modal.priceMetropole + depassement)})
              </span>
              <span className="text-[15px] font-bold text-[#0F172A]">{fmt(total)}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9 text-xs"
                onClick={() => setModal(null)}
              >
                Annuler
              </Button>
              <Button size="sm" className="flex-1 h-9 text-xs gap-1" onClick={confirmAdd}>
                <Plus className="w-3.5 h-3.5" />
                Ajouter l&apos;acte
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
