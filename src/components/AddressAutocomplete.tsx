"use client"

import { useState, useRef, useEffect } from "react"
import { MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const BAN_API = "https://api-adresse.data.gouv.fr/search"

export interface AddressResult {
  label: string
  name: string
  postcode: string
  city: string
  context: string
  lat: number
  lng: number
}

interface Props {
  onSelect: (result: AddressResult) => void
  placeholder?: string
  defaultValue?: string
  className?: string
}

export function AddressAutocomplete({
  onSelect,
  placeholder = "Commencez à taper une adresse...",
  defaultValue,
  className,
}: Props) {
  const [query, setQuery] = useState(defaultValue ?? "")
  const [results, setResults] = useState<AddressResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

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
    if (q.trim().length < 3) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(
        `${BAN_API}?q=${encodeURIComponent(q)}&limit=5&type=housenumber&autocomplete=1`
      )
      const data = await res.json()
      setResults(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data.features ?? []).map((f: any) => ({
          label:    f.properties.label,
          name:     f.properties.name,
          postcode: f.properties.postcode,
          city:     f.properties.city,
          context:  f.properties.context,
          lat:      f.geometry.coordinates[1],
          lng:      f.geometry.coordinates[0],
        }))
      )
    } catch {
      setResults([])
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

  const select = (result: AddressResult) => {
    setQuery(result.name)
    setOpen(false)
    setResults([])
    onSelect(result)
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => query.length >= 3 && setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-300"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 animate-spin pointer-events-none" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => e.preventDefault()} // keep focus on input
              onClick={() => select(r)}
              className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              <MapPin className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">{r.name}</p>
                <p className="text-[11px] text-neutral-400">
                  {r.postcode} {r.city} — {r.context}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
