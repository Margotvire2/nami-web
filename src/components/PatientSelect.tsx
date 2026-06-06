"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { apiWithToken, ApiError } from "@/lib/api"
import { Search, User, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

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

function norm(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}

export function PatientSelect({ value, onChange, placeholder = "Rechercher un patient...", className }: Props) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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

  // Source unique : on récupère les care cases du provider (même endpoint que l'agenda),
  // via le client API centralisé qui attache le Bearer + auto-refresh sur 401.
  // Puis on filtre les patients côté client sur la query string.
  const careCasesQ = useQuery({
    queryKey: ["patient-select-care-cases"],
    enabled: !!accessToken,
    queryFn: () => apiWithToken(accessToken!).careCases.list(),
    staleTime: 5 * 60_000,
  })

  const allPatients = useMemo<Patient[]>(() => {
    const map = new Map<string, Patient>()
    for (const cc of careCasesQ.data ?? []) {
      const p = cc.patient
      if (p && !map.has(p.id)) {
        map.set(p.id, {
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          birthDate: p.birthDate ?? null,
          sex: p.sex ?? null,
        })
      }
    }
    return Array.from(map.values())
  }, [careCasesQ.data])

  const results = useMemo<Patient[]>(() => {
    const q = norm(query.trim())
    if (q.length < 2) return []
    return allPatients
      .filter((p) => norm(`${p.firstName} ${p.lastName}`).includes(q))
      .slice(0, 10)
  }, [allPatients, query])

  const loading = careCasesQ.isLoading || careCasesQ.isFetching
  const authError = careCasesQ.error instanceof ApiError && careCasesQ.error.status === 401
  const otherError = careCasesQ.error && !authError

  const handleInput = (q: string) => {
    setQuery(q)
    setOpen(true)
  }

  const select = (patient: Patient) => {
    onChange(patient)
    setQuery("")
    setOpen(false)
  }

  const clear = () => {
    onChange(null)
    setQuery("")
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
          {authError ? (
            <div className="px-4 py-6 text-center">
              <User className="w-6 h-6 text-red-300 mx-auto mb-1.5" />
              <p className="text-xs text-red-600 font-medium">Session expirée</p>
              <p className="text-[10px] text-red-400 mt-0.5">Reconnectez-vous pour rechercher un patient.</p>
            </div>
          ) : otherError ? (
            <div className="px-4 py-6 text-center">
              <User className="w-6 h-6 text-amber-300 mx-auto mb-1.5" />
              <p className="text-xs text-amber-600 font-medium">Erreur de chargement</p>
              <p className="text-[10px] text-amber-400 mt-0.5">Impossible de récupérer vos patients.</p>
            </div>
          ) : query.trim().length < 2 ? (
            <div className="px-4 py-6 text-center">
              <User className="w-6 h-6 text-neutral-300 mx-auto mb-1.5" />
              <p className="text-[10px] text-neutral-400">Tapez au moins 2 caractères</p>
            </div>
          ) : results.length > 0 ? (
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
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
