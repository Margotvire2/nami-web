"use client"

import { useState, useRef, useEffect } from "react"
import { useAuthStore } from "@/lib/store"
import { Search, User, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const API = process.env.NEXT_PUBLIC_API_URL || "https://nami-production-f268.up.railway.app"

interface Patient {
  id: string
  firstName: string
  lastName: string
  birthDate?: string | null
  sex?: string | null
}

interface Props {
  value: Patient | null
  onChange: (patient: Patient | null) => void
  placeholder?: string
  className?: string
}

export function PatientSelect({ value, onChange, placeholder = "Rechercher un patient...", className }: Props) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const search = async (q: string) => {
    if (!q.trim() || !accessToken) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API}/patients?q=${encodeURIComponent(q)}&limit=10`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.ok) {
        const data = await res.json()
        // L'API retourne soit { patients: [...] } soit directement [...]
        const patients = Array.isArray(data) ? data : (data.patients ?? data.results ?? [])
        setResults(
          patients.map((p: any) => ({
            id: p.id,
            firstName: p.firstName ?? p.person?.firstName ?? "",
            lastName: p.lastName ?? p.person?.lastName ?? "",
            birthDate: p.birthDate ?? p.person?.birthDate ?? null,
            sex: p.sex ?? p.person?.sex ?? null,
          }))
        )
      }
    } catch (err) {
      console.error("[PatientSelect] search error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleInput = (q: string) => {
    setQuery(q)
    setOpen(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(q), 250)
  }

  const select = (patient: Patient) => {
    onChange(patient)
    setQuery("")
    setOpen(false)
    setResults([])
  }

  const clear = () => {
    onChange(null)
    setQuery("")
    setResults([])
  }

  const formatAge = (birthDate: string | null | undefined) => {
    if (!birthDate) return null
    const birth = new Date(birthDate)
    const now = new Date()
    const age = now.getFullYear() - birth.getFullYear()
    const m = now.getMonth() - birth.getMonth()
    const corrected = m < 0 || (m === 0 && now.getDate() < birth.getDate()) ? age - 1 : age
    return `${corrected} ans`
  }

  // Si un patient est sélectionné, afficher son nom
  if (value) {
    return (
      <div className={cn(
        "flex items-center justify-between gap-2 px-3 py-2.5 border rounded-lg bg-teal-50 border-teal-200",
        className
      )}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-[10px] font-bold text-teal-700">
            {(value.firstName?.[0] ?? "").toUpperCase()}{(value.lastName?.[0] ?? "").toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-teal-800">
              {value.firstName} {value.lastName}
            </p>
            <p className="text-[10px] text-teal-600">
              {value.sex === "F" ? "♀" : value.sex === "M" ? "♂" : ""}
              {formatAge(value.birthDate) && ` · ${formatAge(value.birthDate)}`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-teal-500 hover:text-teal-700 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 animate-spin" />
        )}
      </div>

      {/* Dropdown résultats */}
      {open && (query.trim().length > 0) && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {results.length > 0 ? (
            results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => select(p)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-600 shrink-0">
                  {(p.firstName?.[0] ?? "").toUpperCase()}{(p.lastName?.[0] ?? "").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">
                    {p.firstName} {p.lastName}
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    {p.sex === "F" ? "♀ Femme" : p.sex === "M" ? "♂ Homme" : ""}
                    {formatAge(p.birthDate) && ` · ${formatAge(p.birthDate)}`}
                  </p>
                </div>
              </button>
            ))
          ) : !loading ? (
            <div className="px-4 py-6 text-center">
              <User className="w-6 h-6 text-neutral-300 mx-auto mb-1.5" />
              <p className="text-xs text-neutral-400">Aucun patient trouvé</p>
              <p className="text-[10px] text-neutral-300 mt-0.5">Tapez au moins 2 caractères</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
