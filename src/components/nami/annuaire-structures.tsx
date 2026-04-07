"use client"

import { useState, useMemo } from "react"
import { Search, MapPin, Building2, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import structuresData from "@/lib/data/structures-tca.json"

export function AnnuaireStructures() {
  const [search, setSearch] = useState("")
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set())

  const query = search.toLowerCase().trim()

  const filteredRegions = useMemo(() => {
    const entries = Object.entries(structuresData.regions) as [
      string,
      { ville: string; structure: string }[]
    ][]

    if (!query) return entries

    return entries
      .map(([region, structures]) => {
        const filtered = structures.filter(
          (s) =>
            s.ville.toLowerCase().includes(query) ||
            s.structure.toLowerCase().includes(query) ||
            region.toLowerCase().includes(query)
        )
        return [region, filtered] as [string, typeof structures]
      })
      .filter(([, structures]) => structures.length > 0)
  }, [query])

  const totalFiltered = filteredRegions.reduce(
    (acc, [, s]) => acc + s.length,
    0
  )

  function toggleRegion(region: string) {
    setExpandedRegions((prev) => {
      const next = new Set(prev)
      if (next.has(region)) next.delete(region)
      else next.add(region)
      return next
    })
  }

  // Auto-expand all when searching
  const isSearching = query.length > 0

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par ville, structure ou région…"
          className="w-full rounded-lg border bg-muted/30 py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Building2 className="size-3.5" />
        <span>
          {totalFiltered} structure{totalFiltered > 1 ? "s" : ""} · {filteredRegions.length} région{filteredRegions.length > 1 ? "s" : ""}
        </span>
        <span className="text-[10px]">Source : Annuaire FFAB</span>
      </div>

      {/* Regions */}
      <div className="space-y-1.5">
        {filteredRegions.map(([region, structures]) => {
          const isExpanded = isSearching || expandedRegions.has(region)
          return (
            <div key={region} className="rounded-xl border overflow-hidden">
              <button
                onClick={() => toggleRegion(region)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                )}
                <MapPin className="size-4 shrink-0 text-primary" />
                <span className="flex-1 text-sm font-medium">{region}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {structures.length}
                </Badge>
              </button>

              {isExpanded && (
                <div className="border-t bg-muted/20 px-3 py-2 space-y-1">
                  {structures.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm"
                    >
                      <Building2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/50" />
                      <div>
                        <p className="font-medium text-foreground/90">
                          {s.structure}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.ville}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
