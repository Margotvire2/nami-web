"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import glossaireData from "@/lib/data/glossaire-tca.json"

const categories: Record<string, string> = {
  diagnostic: "Diagnostics",
  classification: "Classifications",
  clinique: "Clinique",
  outil: "Outils",
  complication: "Complications",
  traitement: "Traitements",
  institution: "Institutions",
  physiologie: "Physiologie",
}

export function Glossaire() {
  const [search, setSearch] = useState("")

  const query = search.toLowerCase().trim()

  const filtered = useMemo(() => {
    if (!query) return glossaireData
    return glossaireData.filter(
      (entry) =>
        entry.terme.toLowerCase().includes(query) ||
        entry.definition.toLowerCase().includes(query)
    )
  }, [query])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof glossaireData>()
    for (const entry of filtered) {
      const cat = entry.categorie
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(entry)
    }
    return map
  }, [filtered])

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un terme (SCOFF, SRI, PMBS…)"
          className="w-full rounded-lg border bg-muted/30 py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} termes</p>

      {/* Grouped list */}
      {Array.from(grouped.entries()).map(([cat, entries]) => (
        <div key={cat}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {categories[cat] || cat}
          </h3>
          <div className="space-y-1">
            {entries.map((entry) => (
              <div
                key={entry.terme}
                className="rounded-lg border p-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary">
                    {entry.terme}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground leading-relaxed">
                  {entry.definition}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
