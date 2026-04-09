"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { annuaireApi, type DirectoryEntry, type DirectorySearchResult } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import {
  Search, Phone, MapPin, CreditCard, Building2, User,
  ChevronLeft, ChevronRight, Filter, X,
} from "lucide-react"

const SPECIALTIES = [
  "Médecin généraliste", "Pédiatre", "Cardiologue", "Psychiatre", "Psychologue",
  "Diététicien", "Orthophoniste", "Masseur-kinésithérapeute", "Infirmier",
  "Endocrinologue", "Gastro-entérologue", "Gynécologue / Obstétricien",
  "Dermatologue", "Ophtalmologiste", "ORL", "Pneumologue", "Rhumatologue",
  "Neurologue", "Chirurgien-dentiste", "Sage-femme",
]

const CONVENTIONS = [
  { code: "1", label: "Secteur 1" },
  { code: "2", label: "Secteur 2" },
  { code: "3", label: "Non conventionné" },
]

export default function AnnuairePage() {
  const { accessToken } = useAuthStore()
  const [q, setQ] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [convention, setConvention] = useState("")
  const [offset, setOffset] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTrigger, setSearchTrigger] = useState(0)
  const limit = 20

  const hasSearch = q || specialty || city || postalCode || convention

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["annuaire-search", q, specialty, city, postalCode, convention, offset, searchTrigger],
    queryFn: () => annuaireApi.search(accessToken!, { q, specialty, city, postalCode, convention, limit, offset }),
    enabled: !!accessToken && searchTrigger > 0,
    staleTime: 60_000,
  })

  function handleSearch() {
    setOffset(0)
    setSearchTrigger((s) => s + 1)
  }

  function clearFilters() {
    setQ(""); setSpecialty(""); setCity(""); setPostalCode(""); setConvention("")
    setOffset(0)
  }

  const results = data?.results ?? []
  const total = data?.total ?? 0

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold">Annuaire Santé</h1>
        <p className="text-sm text-muted-foreground mt-1">
          564 000+ professionnels de sant&eacute; en France — Source : Ameli (data.gouv.fr)
        </p>
      </div>

      {/* Search bar */}
      <div className="rounded-xl border bg-card p-4 mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Nom, sp&eacute;cialit&eacute;, ville..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9 h-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={!hasSearch} className="h-10 gap-2">
            <Search size={14} /> Rechercher
          </Button>
          <Button variant="outline" className="h-10 gap-1.5" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={14} /> Filtres
            {(specialty || convention || postalCode) && (
              <span className="ml-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                {[specialty, convention, postalCode].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Sp&eacute;cialit&eacute;</label>
              <select
                className="w-full border rounded-md p-2 text-xs h-9"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              >
                <option value="">Toutes</option>
                {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Ville</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Paris, Lyon..." className="h-9 text-xs" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Code postal / D&eacute;pt</label>
              <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="75, 92300..." className="h-9 text-xs" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Convention</label>
              <select
                className="w-full border rounded-md p-2 text-xs h-9"
                value={convention}
                onChange={(e) => setConvention(e.target.value)}
              >
                <option value="">Tous secteurs</option>
                {CONVENTIONS.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
            {(specialty || convention || postalCode || city) && (
              <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 col-span-full">
                <X size={12} /> R&eacute;initialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick specialty chips */}
      {!searchTrigger && (
        <div className="flex flex-wrap gap-2 mb-6">
          {["Pédiatre", "Cardiologue", "Psychiatre", "Diététicien", "Orthophoniste", "Endocrinologue", "Gastro-entérologue"].map((s) => (
            <button
              key={s}
              onClick={() => { setSpecialty(s); setSearchTrigger((t) => t + 1) }}
              className="px-3 py-1.5 rounded-full bg-primary/5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {isLoading || isFetching ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : searchTrigger > 0 && results.length > 0 ? (
        <>
          <p className="text-xs text-muted-foreground mb-3">
            {total.toLocaleString()} r&eacute;sultat{total > 1 ? "s" : ""} trouv&eacute;{total > 1 ? "s" : ""}
            {offset > 0 && ` — page ${Math.floor(offset / limit) + 1}`}
          </p>

          <div className="space-y-2">
            {results.map((r) => (
              <DirectoryCard key={r.id} entry={r} />
            ))}
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={offset === 0}
                onClick={() => { setOffset(Math.max(0, offset - limit)); setSearchTrigger((s) => s + 1) }}
                className="gap-1"
              >
                <ChevronLeft size={14} /> Pr&eacute;c&eacute;dent
              </Button>
              <span className="text-xs text-muted-foreground">
                {offset + 1}–{Math.min(offset + limit, total)} sur {total.toLocaleString()}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={offset + limit >= total}
                onClick={() => { setOffset(offset + limit); setSearchTrigger((s) => s + 1) }}
                className="gap-1"
              >
                Suivant <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </>
      ) : searchTrigger > 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search size={28} className="text-muted-foreground/20 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Aucun r&eacute;sultat</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Essayez avec d&apos;autres crit&egrave;res de recherche.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
            <Building2 size={28} className="text-primary/40" />
          </div>
          <p className="text-sm font-semibold">Recherchez un professionnel de sant&eacute;</p>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-md leading-relaxed">
            Trouvez n&apos;importe quel m&eacute;decin, param&eacute;dical ou centre de sant&eacute; en France
            parmi 564 000+ professionnels r&eacute;f&eacute;renc&eacute;s.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Card component ─────────────────────────────────────────────────────────

function DirectoryCard({ entry }: { entry: DirectoryEntry }) {
  const isCDS = entry.type === "CDS"
  const initials = isCDS
    ? "CDS"
    : `${(entry.firstName ?? "?")[0]}${entry.lastName[0]}`.toUpperCase()

  return (
    <Link
      href={`/annuaire/${entry.id}`}
      className="block rounded-xl border bg-card p-4 hover:shadow-[0_2px_12px_rgba(79,70,229,0.08)] transition-all hover:border-primary/20"
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
          isCDS ? "bg-emerald-50 text-emerald-700" : "bg-primary/5 text-primary"
        }`}>
          {isCDS ? <Building2 size={16} /> : initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{entry.name}</p>
          <p className="text-[11px] text-muted-foreground">{entry.specialty}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {entry.city && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <MapPin size={9} /> {entry.city} {entry.postalCode ? `(${entry.postalCode.slice(0, 2)})` : ""}
              </span>
            )}
            {entry.convention && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                entry.conventionCode === "1" ? "bg-emerald-50 text-emerald-700"
                  : entry.conventionCode === "2" ? "bg-amber-50 text-amber-700"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {entry.convention}
              </span>
            )}
            {entry.option && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                {entry.option}
              </span>
            )}
            {entry.carteVitale && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <CreditCard size={9} /> Carte Vitale
              </span>
            )}
          </div>
        </div>

        {/* Phone */}
        {entry.phone && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            <Phone size={12} />
            <span>{entry.phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5")}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
