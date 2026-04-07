"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { RotateCcw, ChevronLeft, ChevronRight, Shuffle, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import flashcardsData from "@/lib/data/flashcards-tca.json"

const categories: Record<string, string> = {
  seuils: "Seuils critiques",
  renutrition: "Renutrition",
  diagnostic: "Diagnostic",
  traitement: "Traitement",
  epidemio: "Épidémiologie",
  biologie: "Biologie",
}

export function Flashcards() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showVerso, setShowVerso] = useState(false)
  const [shuffled, setShuffled] = useState(false)

  const cards = useMemo(() => {
    let filtered = categoryFilter
      ? flashcardsData.filter((c) => c.categorie === categoryFilter)
      : flashcardsData
    if (shuffled) {
      filtered = [...filtered].sort(() => Math.random() - 0.5)
    }
    return filtered
  }, [categoryFilter, shuffled])

  const card = cards[currentIdx]

  function next() {
    setShowVerso(false)
    setCurrentIdx((i) => (i + 1) % cards.length)
  }

  function prev() {
    setShowVerso(false)
    setCurrentIdx((i) => (i - 1 + cards.length) % cards.length)
  }

  function shuffle() {
    setShuffled((s) => !s)
    setCurrentIdx(0)
    setShowVerso(false)
  }

  if (!card) return <p className="text-sm text-muted-foreground">Aucune carte dans cette catégorie.</p>

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => { setCategoryFilter(null); setCurrentIdx(0); setShowVerso(false) }}
          className={cn(
            "rounded-lg border px-2.5 py-1 text-xs font-medium transition-all",
            !categoryFilter ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted/50"
          )}
        >
          Toutes ({flashcardsData.length})
        </button>
        {Object.entries(categories).map(([key, label]) => {
          const count = flashcardsData.filter((c) => c.categorie === key).length
          return (
            <button
              key={key}
              onClick={() => { setCategoryFilter(key); setCurrentIdx(0); setShowVerso(false) }}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-xs font-medium transition-all",
                categoryFilter === key ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted/50"
              )}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{currentIdx + 1} / {cards.length}</span>
        <div className="flex-1 h-1.5 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((currentIdx + 1) / cards.length) * 100}%` }}
          />
        </div>
        <Badge variant="secondary" className="text-[10px]">
          {categories[card.categorie] || card.categorie}
        </Badge>
      </div>

      {/* Card */}
      <button
        onClick={() => setShowVerso(!showVerso)}
        className="w-full min-h-[200px] rounded-xl border-2 border-dashed p-6 text-left transition-all hover:border-primary/30 hover:bg-primary/5 flex flex-col justify-center"
      >
        {!showVerso ? (
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Eye className="size-3" /> Cliquez pour voir la réponse
            </p>
            <p className="text-base font-semibold leading-relaxed">{card.recto}</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, rotateX: 10 }}
            animate={{ opacity: 1, rotateX: 0 }}
          >
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <EyeOff className="size-3" /> Réponse
            </p>
            <p className="text-sm leading-relaxed whitespace-pre-line">{card.verso}</p>
          </motion.div>
        )}
      </button>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon-sm" onClick={prev}>
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={shuffle} className="flex-1">
          <Shuffle className="size-4" />
          {shuffled ? "Ordre original" : "Mélanger"}
        </Button>
        <Button variant="outline" size="icon-sm" onClick={next}>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
