"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import {
  appointmentsApi,
  locationsApi,
  type ConsultationTypeDTO,
  type AvailabilitySlotDTO,
  type ConsultationLocation,
  type CreateLocationInput,
} from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { X, Clock, CalendarDays, Settings, Trash2, Plus, Loader2, MapPin } from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────────────

type Tab = "locations" | "slots" | "types" | "rules"

const WEEKDAY_LABEL: Record<number, string> = {
  0: "Dimanche", 1: "Lundi", 2: "Mardi", 3: "Mercredi",
  4: "Jeudi", 5: "Vendredi", 6: "Samedi",
}

const DURATION_OPTIONS = [15, 30, 45, 60, 90]

const LOCATION_COLORS = [
  { name: "indigo", hex: "#4F46E5" },
  { name: "teal", hex: "#0F6E56" },
  { name: "amber", hex: "#D97706" },
  { name: "purple", hex: "#7C3AED" },
  { name: "pink", hex: "#DB2777" },
  { name: "blue", hex: "#1D4ED8" },
  { name: "green", hex: "#059669" },
  { name: "coral", hex: "#DC2626" },
]

const LOCATION_TYPES = [
  { value: "PHYSICAL", label: "Présentiel" },
  { value: "VIDEO", label: "Vidéo" },
  { value: "PHONE", label: "Téléphone" },
  { value: "HOME_VISIT", label: "Visite à domicile" },
] as const

// ─── Component ──────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onClose: () => void
}

export function AgendaSettings({ open, onClose }: Props) {
  const { accessToken, user } = useAuthStore()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>("locations")
  const providerId = user?.providerProfile?.id

  const { data: slots, isLoading: loadingSlots } = useQuery({
    queryKey: ["availability-slots", providerId],
    queryFn: () => appointmentsApi.slots(accessToken!, providerId),
    enabled: open && !!accessToken && !!providerId,
  })

  const { data: types, isLoading: loadingTypes } = useQuery({
    queryKey: ["consultation-types", providerId],
    queryFn: () => appointmentsApi.consultationTypes(accessToken!, providerId!),
    enabled: open && !!accessToken && !!providerId,
  })

  const { data: locations, isLoading: loadingLocations } = useQuery({
    queryKey: ["locations"],
    queryFn: () => locationsApi.list(accessToken!),
    enabled: open && !!accessToken,
  })

  if (!open) return null

  const tabs: { key: Tab; label: string; icon: typeof MapPin }[] = [
    { key: "locations", label: "Lieux", icon: MapPin },
    { key: "slots", label: "Créneaux", icon: CalendarDays },
    { key: "types", label: "Consultations", icon: Clock },
    { key: "rules", label: "Règles", icon: Settings },
  ]

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[480px] bg-card shadow-xl z-50 flex flex-col border-l">
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Settings size={14} /> Paramétrage de l&apos;agenda
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex border-b shrink-0">
          {tabs.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex-1 text-xs font-medium py-2.5 flex items-center justify-center gap-1.5 transition-colors border-b-2",
                  tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={12} />
                {t.label}
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === "locations" && (
            <LocationsTab locations={locations ?? []} loading={loadingLocations} token={accessToken!} qc={qc} />
          )}
          {tab === "slots" && (
            <SlotsTab slots={slots ?? []} loading={loadingSlots} token={accessToken!} qc={qc} providerId={providerId} />
          )}
          {tab === "types" && (
            <TypesTab types={types ?? []} loading={loadingTypes} token={accessToken!} qc={qc} providerId={providerId} />
          )}
          {tab === "rules" && <RulesTab />}
        </div>
      </div>
    </>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB — LIEUX
// ═════════════════════════════════════════════════════════════════════════════

function LocationsTab({
  locations, loading, token, qc,
}: {
  locations: ConsultationLocation[]; loading: boolean; token: string; qc: ReturnType<typeof useQueryClient>
}) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<CreateLocationInput>({
    name: "", locationType: "PHYSICAL", color: LOCATION_COLORS[0].hex,
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleAdd() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await locationsApi.create(token, form)
      qc.invalidateQueries({ queryKey: ["locations"] })
      setForm({ name: "", locationType: "PHYSICAL", color: LOCATION_COLORS[0].hex })
      setAdding(false)
      toast.success("Lieu ajouté")
    } catch {
      toast.error("Erreur")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await locationsApi.remove(token, id)
      qc.invalidateQueries({ queryKey: ["locations"] })
      toast.success("Lieu supprimé")
    } catch {
      toast.error("Erreur")
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <div className="text-xs text-muted-foreground">Chargement…</div>

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Vos lieux de consultation. Chaque lieu a sa couleur dans l&apos;agenda.
      </p>

      {locations.length === 0 && !adding && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-11 h-11 rounded-xl bg-primary/5 flex items-center justify-center mb-3">
            <MapPin size={20} className="text-primary/40" />
          </div>
          <p className="text-xs font-semibold">Configurez vos lieux de consultation</p>
          <p className="text-[10px] text-muted-foreground mt-1 max-w-xs">
            Ajoutez vos cabinets pour organiser votre agenda.
          </p>
        </div>
      )}

      {/* List */}
      {locations.map((loc) => (
        <div key={loc.id} className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: loc.color ?? "#7C3AED" }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{loc.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {loc.locationType === "PHYSICAL" ? "Présentiel" : loc.locationType === "VIDEO" ? "Vidéo" : loc.locationType === "PHONE" ? "Téléphone" : "Visite"}
                {loc.city && ` · ${loc.city}`}
              </p>
              {loc.address && <p className="text-[10px] text-muted-foreground">{loc.address}</p>}
              {loc.instructions && <p className="text-[10px] text-muted-foreground italic">{loc.instructions}</p>}
            </div>
            <button
              onClick={() => handleDelete(loc.id)}
              disabled={deleting === loc.id}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              {deleting === loc.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            </button>
          </div>
        </div>
      ))}

      {/* Add form */}
      {adding ? (
        <div className="border rounded-lg p-4 space-y-3">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nom du cabinet"
            className="h-8 text-xs"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.locationType}
              onChange={(e) => setForm({ ...form, locationType: e.target.value as CreateLocationInput["locationType"] })}
              className="h-8 px-2 rounded-md border bg-card text-xs"
            >
              {LOCATION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <Input
              value={form.city ?? ""}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Ville"
              className="h-8 text-xs"
            />
          </div>
          <Input
            value={form.address ?? ""}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Adresse (optionnel)"
            className="h-8 text-xs"
          />
          <Input
            value={form.accessCode ?? ""}
            onChange={(e) => setForm({ ...form, accessCode: e.target.value })}
            placeholder="Digicode, bâtiment, consignes (optionnel)"
            className="h-8 text-xs"
          />
          {/* Color picker */}
          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Couleur</p>
            <div className="flex gap-1.5">
              {LOCATION_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setForm({ ...form, color: c.hex })}
                  className={cn(
                    "w-6 h-6 rounded-full transition-all",
                    form.color === c.hex ? "ring-2 ring-offset-2 ring-offset-card" : "hover:scale-110"
                  )}
                  style={{ backgroundColor: c.hex, ...(form.color === c.hex ? { ringColor: c.hex } : {}) }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="text-xs h-7 gap-1 flex-1" onClick={handleAdd} disabled={saving || !form.name.trim()}>
              {saving ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
              Enregistrer
            </Button>
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setAdding(false)}>
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 w-full border-dashed" onClick={() => setAdding(true)}>
          <Plus size={12} /> Ajouter un lieu
        </Button>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB — CRÉNEAUX
// ═════════════════════════════════════════════════════════════════════════════

function SlotsTab({
  slots, loading, token, qc, providerId,
}: {
  slots: AvailabilitySlotDTO[]; loading: boolean; token: string; qc: ReturnType<typeof useQueryClient>; providerId?: string
}) {
  const [newWeekday, setNewWeekday] = useState(1)
  const [newStart, setNewStart] = useState("09:00")
  const [newEnd, setNewEnd] = useState("18:00")
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleAdd() {
    setAdding(true)
    try {
      await appointmentsApi.createSlot(token, { weekday: newWeekday, startTime: newStart, endTime: newEnd, isActive: true })
      qc.invalidateQueries({ queryKey: ["availability-slots", providerId] })
      toast.success("Créneau ajouté")
    } catch { toast.error("Erreur") }
    finally { setAdding(false) }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await appointmentsApi.deleteSlot(token, id)
      qc.invalidateQueries({ queryKey: ["availability-slots", providerId] })
      toast.success("Créneau supprimé")
    } catch { toast.error("Erreur") }
    finally { setDeleting(null) }
  }

  const byDay = new Map<number, AvailabilitySlotDTO[]>()
  for (const s of slots) { const e = byDay.get(s.weekday) ?? []; e.push(s); byDay.set(s.weekday, e) }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Vos plages de disponibilité hebdomadaires.</p>
      {loading ? <div className="text-xs text-muted-foreground">Chargement…</div> : slots.length === 0 ? (
        <div className="text-xs text-muted-foreground py-4 text-center">Aucun créneau configuré.</div>
      ) : (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 0].map((wd) => {
            const daySlots = byDay.get(wd)
            if (!daySlots) return null
            return (
              <div key={wd} className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs font-semibold mb-1.5">{WEEKDAY_LABEL[wd]}</p>
                {daySlots.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-1">
                    <span className="text-xs text-muted-foreground">{s.startTime} → {s.endTime}</span>
                    <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id} className="text-muted-foreground hover:text-destructive transition-colors">
                      {deleting === s.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    </button>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
      <div className="border-t pt-4">
        <p className="text-xs font-medium mb-2">Ajouter un créneau</p>
        <div className="flex items-center gap-2">
          <select value={newWeekday} onChange={(e) => setNewWeekday(Number(e.target.value))} className="h-8 px-2 rounded-md border bg-card text-xs">
            {[1, 2, 3, 4, 5, 6, 0].map((wd) => <option key={wd} value={wd}>{WEEKDAY_LABEL[wd]}</option>)}
          </select>
          <TimeSelect value={newStart} onChange={setNewStart} />
          <span className="text-xs text-muted-foreground">→</span>
          <TimeSelect value={newEnd} onChange={setNewEnd} />
          <Button size="sm" className="text-xs h-8 gap-1" onClick={handleAdd} disabled={adding}>
            {adding ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
          </Button>
        </div>
      </div>
    </div>
  )
}

function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const times: string[] = []
  for (let h = 7; h <= 21; h++) { times.push(`${String(h).padStart(2, "0")}:00`); times.push(`${String(h).padStart(2, "0")}:30`) }
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="h-8 px-2 rounded-md border bg-card text-xs">
      {times.map((t) => <option key={t} value={t}>{t}</option>)}
    </select>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB — TYPES
// ═════════════════════════════════════════════════════════════════════════════

function TypesTab({
  types, loading, token, qc, providerId,
}: {
  types: ConsultationTypeDTO[]; loading: boolean; token: string; qc: ReturnType<typeof useQueryClient>; providerId?: string
}) {
  const [newName, setNewName] = useState("")
  const [newDuration, setNewDuration] = useState(30)
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleAdd() {
    if (!newName.trim()) return
    setAdding(true)
    try {
      await appointmentsApi.createConsultationType(token, { name: newName.trim(), durationMinutes: newDuration, availablePublicly: true })
      qc.invalidateQueries({ queryKey: ["consultation-types", providerId] })
      setNewName("")
      toast.success("Type ajouté")
    } catch { toast.error("Erreur") }
    finally { setAdding(false) }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await appointmentsApi.deleteConsultationType(token, id)
      qc.invalidateQueries({ queryKey: ["consultation-types", providerId] })
      toast.success("Type supprimé")
    } catch { toast.error("Erreur") }
    finally { setDeleting(null) }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Gérez vos types de consultation et leurs durées.</p>
      {loading ? <div className="text-xs text-muted-foreground">Chargement…</div> : types.length === 0 ? (
        <div className="text-xs text-muted-foreground py-4 text-center">Aucun type configuré.</div>
      ) : (
        <div className="space-y-2">
          {types.map((t) => (
            <div key={t.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{t.name}</p>
                <p className="text-[10px] text-muted-foreground">{t.durationMinutes} min · {t.consultationMode === "VIDEO" ? "Visio" : t.consultationMode === "PHONE" ? "Tél" : "Cabinet"}{t.price > 0 && ` · ${t.price}€`}</p>
              </div>
              <button onClick={() => handleDelete(t.id)} disabled={deleting === t.id} className="text-muted-foreground hover:text-destructive transition-colors ml-2">
                {deleting === t.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="border-t pt-4">
        <p className="text-xs font-medium mb-2">Ajouter un type</p>
        <div className="flex items-center gap-2">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom…" className="h-8 text-xs flex-1" onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          <select value={newDuration} onChange={(e) => setNewDuration(Number(e.target.value))} className="h-8 px-2 rounded-md border bg-card text-xs">
            {DURATION_OPTIONS.map((d) => <option key={d} value={d}>{d}min</option>)}
          </select>
          <Button size="sm" className="text-xs h-8 gap-1" onClick={handleAdd} disabled={adding || !newName.trim()}>
            {adding ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB — RÈGLES
// ═════════════════════════════════════════════════════════════════════════════

function RulesTab() {
  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">Les règles de planification.</p>
      <div className="bg-muted/30 rounded-lg p-4 space-y-4">
        <div>
          <p className="text-xs font-medium mb-1">Délai minimum avant RDV</p>
          <select className="h-8 w-full px-2 rounded-md border bg-card text-xs">
            <option>Le jour même</option><option>24 heures</option><option>48 heures</option><option>1 semaine</option>
          </select>
        </div>
        <div>
          <p className="text-xs font-medium mb-1">Réservations jusqu&apos;à</p>
          <select className="h-8 w-full px-2 rounded-md border bg-card text-xs">
            <option>1 mois</option><option>2 mois</option><option>3 mois</option><option>6 mois</option>
          </select>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground">Les règles avancées seront disponibles prochainement.</p>
    </div>
  )
}
