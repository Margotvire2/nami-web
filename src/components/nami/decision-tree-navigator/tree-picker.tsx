"use client"

import { useState } from "react"
import { Search, ChevronRight, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { decisionTrees, type DecisionTreeId } from "@/lib/data/decision-trees"
import { Badge } from "@/components/ui/badge"

interface TreePickerProps {
  onSelect: (treeId: DecisionTreeId) => void
}

const categories: { label: string; trees: DecisionTreeId[] }[] = [
  {
    label: "Diagnostic",
    trees: [
      "reperage-tca",
      "evaluation-centre-expert",
      "bilans-biologiques-tca",
      "sensations-alimentaires",
    ],
  },
  {
    label: "Traitement",
    trees: [
      "pec-initiale-tca",
      "protocole-renutrition-chiffres",
      "nutrition-renutrition-tca",
      "psychotherapies-tca",
      "tcd-detaillee",
      "groupes-therapeutiques",
      "pharmacologie-tca",
      "annonce-alliance-tca",
      "parcours-soins-qui-fait-quoi",
      "pec-hospitaliere-pratique",
    ],
  },
  {
    label: "Urgences",
    trees: ["urgences-somatiques-tca"],
  },
  {
    label: "Suivi",
    trees: [
      "suivi-ambulatoire-tca",
      "retablissement-chronicite",
    ],
  },
  {
    label: "Complications",
    trees: [
      "complications-somatiques-tca",
      "consequences-an-detaillees",
      "pec-dentaire-tca",
      "comorbidites-psychiatriques-tca",
    ],
  },
  {
    label: "Populations et contextes",
    trees: [
      "populations-specifiques-tca",
      "tca-obesite",
      "tca-mici-coeliaque",
    ],
  },
  {
    label: "Comprendre",
    trees: [
      "etiopathogenie-tca",
      "neurosciences-alimentaires",
      "psychopatho-adolescent-tca",
      "education-therapeutique-tca",
    ],
  },
  {
    label: "Vie quotidienne",
    trees: [
      "vie-quotidienne-tca",
    ],
  },
  {
    label: "Recherche",
    trees: [
      "recherche-pistes-tca",
    ],
  },
  {
    label: "Juridique et éthique",
    trees: [
      "aspects-juridiques-tca",
    ],
  },
]

export function TreePicker({ onSelect }: TreePickerProps) {
  const [search, setSearch] = useState("")

  const query = search.toLowerCase().trim()

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="border-b px-4 py-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un protocole…"
            className="w-full rounded-lg border bg-muted/30 py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Tree list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {categories.map((category) => {
          const filteredTrees = category.trees.filter((treeId) => {
            if (!query) return true
            const tree = decisionTrees[treeId]
            return (
              tree.title.toLowerCase().includes(query) ||
              tree.id.toLowerCase().includes(query)
            )
          })

          if (filteredTrees.length === 0) return null

          return (
            <div key={category.label}>
              <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {category.label}
                <Badge variant="outline" className="text-[10px]">
                  {filteredTrees.length}
                </Badge>
              </h3>
              <div className="space-y-1.5">
                {filteredTrees.map((treeId) => {
                  const tree = decisionTrees[treeId]
                  return (
                    <button
                      key={treeId}
                      onClick={() => onSelect(treeId)}
                      className="flex w-full items-center gap-3 rounded-xl border border-transparent p-3 text-left transition-all hover:border-primary/20 hover:bg-primary/5"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <BookOpen className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">
                          {tree.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Object.keys(tree.nodes).length} étapes · {tree.sources.length} sources
                        </p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
