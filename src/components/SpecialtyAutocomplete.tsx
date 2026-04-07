"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, X } from "lucide-react"

// ─── Data ───────────────────────────────────────────────────────────────────

const SPECIALTIES = [
  // Médecins
  { value: "medecine_generale", label: "Médecine générale", category: "Médecins" },
  { value: "endocrinologie", label: "Endocrinologie & Diabétologie", category: "Médecins" },
  { value: "cardiologie", label: "Cardiologie", category: "Médecins" },
  { value: "pediatrie", label: "Pédiatrie", category: "Médecins" },
  { value: "psychiatrie", label: "Psychiatrie", category: "Médecins" },
  { value: "psychiatrie_enfant", label: "Psychiatrie enfant & adolescent", category: "Médecins" },
  { value: "gynecologie", label: "Gynécologie médicale", category: "Médecins" },
  { value: "gastro", label: "Gastro-entérologie", category: "Médecins" },
  { value: "medecine_interne", label: "Médecine interne", category: "Médecins" },
  { value: "rhumatologie", label: "Rhumatologie", category: "Médecins" },
  // Santé mentale
  { value: "psychologue", label: "Psychologue", category: "Santé mentale" },
  { value: "psychologue_enfant", label: "Psychologue enfant & adolescent", category: "Santé mentale" },
  { value: "psychotherapeute", label: "Psychothérapeute", category: "Santé mentale" },
  { value: "neuropsychologue", label: "Neuropsychologue", category: "Santé mentale" },
  { value: "psychomotricien", label: "Psychomotricien(ne)", category: "Santé mentale" },
  // Paramédicaux
  { value: "dieteticien", label: "Diététicien(ne)", category: "Paramédicaux" },
  { value: "dieteticien_sport", label: "Diététicien(ne) sportif", category: "Paramédicaux" },
  { value: "infirmier", label: "Infirmier(ère)", category: "Paramédicaux" },
  { value: "infirmier_psy", label: "Infirmier(ère) en psychiatrie", category: "Paramédicaux" },
  { value: "sage_femme", label: "Sage-femme", category: "Paramédicaux" },
  { value: "orthophoniste", label: "Orthophoniste", category: "Paramédicaux" },
  { value: "ergotherapeute", label: "Ergothérapeute", category: "Paramédicaux" },
  // Rééducation
  { value: "kine", label: "Kinésithérapeute", category: "Rééducation" },
  { value: "osteopathe", label: "Ostéopathe", category: "Rééducation" },
  { value: "podologue", label: "Podologue", category: "Rééducation" },
  // Autres
  { value: "apa", label: "Enseignant APA", category: "Sport & bien-être" },
  { value: "coach_sante", label: "Coach santé", category: "Sport & bien-être" },
  { value: "assistante_sociale", label: "Assistant(e) social(e)", category: "Social" },
] as const

// ─── Component ──────────────────────────────────────────────────────────────

interface Props {
  value: string[]
  onChange: (v: string[]) => void
  max?: number
  placeholder?: string
}

export function SpecialtyAutocomplete({
  value,
  onChange,
  max = 3,
  placeholder = "Rechercher une spécialité...",
}: Props) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const atMax = value.length >= max

  // Filter
  const filtered = query.length > 0
    ? SPECIALTIES.filter(
        (s) =>
          !value.includes(s.label) &&
          (s.label.toLowerCase().includes(query.toLowerCase()) ||
            s.category.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8)
    : []

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Reset highlight when filtered changes
  useEffect(() => { setHighlightIdx(0) }, [filtered.length])

  const select = useCallback(
    (label: string) => {
      if (atMax) return
      onChange([...value, label])
      setQuery("")
      setOpen(false)
      inputRef.current?.focus()
    },
    [value, onChange, atMax]
  )

  const remove = useCallback(
    (label: string) => {
      onChange(value.filter((v) => v !== label))
      inputRef.current?.focus()
    },
    [value, onChange]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && filtered[highlightIdx]) {
      e.preventDefault()
      select(filtered[highlightIdx].label)
    } else if (e.key === "Escape") {
      setOpen(false)
    } else if (e.key === "Backspace" && query === "" && value.length > 0) {
      remove(value[value.length - 1])
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-medium"
              style={{ background: "#EEEDFE", color: "#534AB7" }}
            >
              {label}
              <button
                type="button"
                onClick={() => remove(label)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-[#D8D6F5] transition-colors"
                aria-label={`Retirer ${label}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => { if (query.length > 0) setOpen(true) }}
          onKeyDown={handleKeyDown}
          disabled={atMax}
          placeholder={atMax ? `Maximum ${max} spécialités` : placeholder}
          className="w-full h-12 rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]/20 focus:border-[#534AB7]/40 disabled:opacity-50 disabled:bg-neutral-50"
          role="combobox"
          aria-expanded={open && filtered.length > 0}
          aria-haspopup="listbox"
          aria-label="Rechercher une spécialité"
        />
      </div>

      {/* Dropdown */}
      {open && query.length > 0 && (
        <div
          className="absolute z-50 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-lg overflow-hidden"
          role="listbox"
          aria-label="Spécialités"
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-neutral-400">
              Aucune spécialité trouvée pour &laquo; {query} &raquo;
              <a
                href={`mailto:margot@nami.health?subject=Suggestion spécialité: ${encodeURIComponent(query)}`}
                className="block mt-1 text-xs text-[#534AB7] hover:underline"
              >
                Suggérer une spécialité
              </a>
            </div>
          ) : (
            filtered.map((s, idx) => (
              <button
                key={s.value}
                type="button"
                onClick={() => select(s.label)}
                onMouseEnter={() => setHighlightIdx(idx)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                  idx === highlightIdx ? "bg-[#F6F5FF]" : "hover:bg-neutral-50"
                }`}
                role="option"
                aria-selected={idx === highlightIdx}
              >
                <span className="font-medium text-neutral-800">{s.label}</span>
                <span className="text-[11px] text-neutral-400">{s.category}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
