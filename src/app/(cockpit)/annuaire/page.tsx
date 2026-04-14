"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { annuaireApi, apiWithToken, type DirectoryEntry, type DirectorySearchResult, type CreateInvitationInput } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ShimmerCard } from "@/components/ui/shimmer"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import Link from "next/link"
import {
  Search, Phone, MapPin, CreditCard, Building2, User,
  ChevronLeft, ChevronRight, Filter, X, UserPlus, Check, Loader2,
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
  const api = apiWithToken(accessToken!)
  const qc = useQueryClient()
  const [q, setQ] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [convention, setConvention] = useState("")
  const [offset, setOffset] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTrigger, setSearchTrigger] = useState(0)
  const [inviteEntry, setInviteEntry] = useState<DirectoryEntry | null>(null)
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
          {[...Array(5)].map((_, i) => <ShimmerCard key={i} />)}
        </div>
      ) : searchTrigger > 0 && results.length > 0 ? (
        <>
          <p className="text-xs text-muted-foreground mb-3">
            {total.toLocaleString()} r&eacute;sultat{total > 1 ? "s" : ""} trouv&eacute;{total > 1 ? "s" : ""}
            {offset > 0 && ` — page ${Math.floor(offset / limit) + 1}`}
          </p>

          <div className="space-y-2">
            {results.map((r) => (
              <DirectoryCard key={r.id} entry={r} onInvite={() => setInviteEntry(r)} />
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

      {/* Modal invitation depuis l'annuaire */}
      <InviteFromDirectoryModal
        entry={inviteEntry}
        onClose={() => setInviteEntry(null)}
        api={api}
        qc={qc}
      />
    </div>
  )
}

// ─── Modal invitation ────────────────────────────────────────────────────────

function InviteFromDirectoryModal({
  entry,
  onClose,
  api,
  qc,
}: {
  entry: DirectoryEntry | null
  onClose: () => void
  api: ReturnType<typeof apiWithToken>
  qc: ReturnType<typeof useQueryClient>
}) {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [done, setDone] = useState(false)

  const name = entry ? (entry.firstName ? `${entry.firstName} ${entry.lastName}` : entry.name) : ""

  // Préremplir le message quand entry change
  const open = !!entry
  const defaultMessage = entry
    ? `Bonjour${entry.firstName ? ` ${entry.firstName}` : ""},\n\nJe vous invite à rejoindre Nami pour faciliter notre coordination.\n\nÀ bientôt !`
    : ""

  function handleOpenChange(v: boolean) {
    if (!v) { onClose(); setEmail(""); setMessage(""); setDone(false) }
  }

  const mutation = useMutation({
    mutationFn: (data: CreateInvitationInput) => api.invitations.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invitations-mine"] })
      setDone(true)
      toast.success("Invitation envoyée !")
    },
    onError: () => toast.error("Erreur lors de l'envoi"),
  })

  function handleSend() {
    if (!email.trim()) { toast.error("Email requis"); return }
    mutation.mutate({ email: email.trim(), message: (message || defaultMessage) || undefined })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={16} className="text-primary" />
            Inviter sur Nami
          </DialogTitle>
          <DialogDescription>
            {name} n&apos;est pas encore sur Nami. Envoyez-lui une invitation par email.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <Check size={22} className="text-emerald-600" />
            </div>
            <p className="text-sm font-medium">Invitation envoyée à {email}</p>
            <p className="text-xs text-muted-foreground text-center">
              {name} recevra un lien valable 7 jours pour rejoindre Nami.
            </p>
            <Button variant="outline" size="sm" onClick={onClose}>Fermer</Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Email professionnel <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="dr.nom@cabinet.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Message (optionnel)
                </label>
                <Textarea
                  rows={4}
                  placeholder={defaultMessage}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="text-sm resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Annuler</Button>
              <Button onClick={handleSend} disabled={mutation.isPending} className="gap-2">
                {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                Envoyer l&apos;invitation
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Card component ─────────────────────────────────────────────────────────

function DirectoryCard({ entry, onInvite }: { entry: DirectoryEntry; onInvite: () => void }) {
  const isCDS = entry.type === "CDS"
  const initials = isCDS
    ? "CDS"
    : `${(entry.firstName ?? "?")[0]}${entry.lastName[0]}`.toUpperCase()

  return (
    <div className="nami-card-interactive p-4">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
          isCDS ? "bg-emerald-50 text-emerald-700" : "bg-primary/5 text-primary"
        }`}>
          {isCDS ? <Building2 size={16} /> : initials}
        </div>

        {/* Info */}
        <Link href={`/annuaire/${entry.id}`} className="flex-1 min-w-0 hover:underline underline-offset-2">
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
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {entry.phone && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone size={12} />
              {entry.phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5")}
            </span>
          )}
          {!isCDS && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              onClick={(e) => { e.preventDefault(); onInvite() }}
            >
              <UserPlus size={13} />
              <span className="hidden sm:inline">Inviter</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
