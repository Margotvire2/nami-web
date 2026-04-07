"use client"

import { useState, useMemo } from "react"
import { SPECIALTY_CATEGORIES } from "@/lib/data/specialties"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"

const COLOR_MAP: Record<string, string> = {
  blue:   "bg-blue-100 text-blue-700 border-blue-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  green:  "bg-green-100 text-green-700 border-green-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  cyan:   "bg-cyan-100 text-cyan-700 border-cyan-200",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  pink:   "bg-pink-100 text-pink-700 border-pink-200",
  teal:   "bg-teal-100 text-teal-700 border-teal-200",
  lime:   "bg-lime-100 text-lime-700 border-lime-200",
}

interface Props {
  selected:   string[]
  onChange:   (ids: string[]) => void
  maxSelect?: number
}

export function SpecialtyPicker({ selected, onChange, maxSelect = 5 }: Props) {
  const [search, setSearch]                   = useState("")
  const [expandedCategory, setExpandedCategory] = useState<string | null>("medical")

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      if (selected.length >= maxSelect) return
      onChange([...selected, id])
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return SPECIALTY_CATEGORIES
    const q = search.toLowerCase()
    return SPECIALTY_CATEGORIES
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((s) =>
          s.label.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0)
  }, [search])

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une spécialité..."
          className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        )}
      </div>

      {/* Sélectionnées */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((id) => {
            const cat = SPECIALTY_CATEGORIES.find((c) =>
              c.items.some((s) => s.id === id)
            )
            const item = cat?.items.find((s) => s.id === id)
            return (
              <span
                key={id}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
                  cat ? COLOR_MAP[cat.color] : "bg-neutral-100 text-neutral-600"
                )}
              >
                {item?.label}
                <button onClick={() => toggle(id)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Compteur */}
      <p className="text-xs text-neutral-400">
        {selected.length}/{maxSelect} sélectionnée(s)
      </p>

      {/* Catégories */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {filtered.map((cat) => (
          <div key={cat.id} className="border border-neutral-100 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() =>
                setExpandedCategory(expandedCategory === cat.id ? null : cat.id)
              }
              className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 hover:bg-neutral-100 transition-colors"
            >
              <span className="text-sm font-medium text-neutral-700">
                {cat.label}
              </span>
              <span className="text-xs text-neutral-400">
                {cat.items.filter((s) => selected.includes(s.id)).length > 0
                  ? `${cat.items.filter((s) => selected.includes(s.id)).length} sélectionnée(s)`
                  : `${cat.items.length}`}
              </span>
            </button>

            {(expandedCategory === cat.id || search.trim()) && (
              <div className="p-3 flex flex-wrap gap-2">
                {cat.items.map((item) => {
                  const isSelected = selected.includes(item.id)
                  const isDisabled = !isSelected && selected.length >= maxSelect

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggle(item.id)}
                      disabled={isDisabled}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs border transition-all",
                        isSelected
                          ? cn("font-medium", COLOR_MAP[cat.color])
                          : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300",
                        isDisabled && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
