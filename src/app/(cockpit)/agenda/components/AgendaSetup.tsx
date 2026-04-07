"use client"

import { useState } from "react"
import { useAuthStore } from "@/lib/store"
import { appointmentsApi, agendaSettingsApi, locationsApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Check, CalendarDays, Clock, Settings, Loader2 } from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────────────

interface DaySchedule {
  enabled: boolean
  start: string
  end: string
}

interface ConsultationDraft {
  name: string
  durationMinutes: number
  mode: "IN_PERSON" | "VIDEO" | "PHONE"
}

interface RulesDraft {
  bufferMinutes: number | null
  minDelay: string
  maxHorizon: string
  autoConfirm: boolean
}

const WEEKDAYS = [
  { key: "lun", label: "L", weekday: 1 },
  { key: "mar", label: "M", weekday: 2 },
  { key: "mer", label: "M", weekday: 3 },
  { key: "jeu", label: "J", weekday: 4 },
  { key: "ven", label: "V", weekday: 5 },
  { key: "sam", label: "S", weekday: 6 },
  { key: "dim", label: "D", weekday: 0 },
]

const DEFAULT_TYPES: ConsultationDraft[] = [
  { name: "Première consultation", durationMinutes: 45, mode: "IN_PERSON" },
  { name: "Consultation de suivi", durationMinutes: 30, mode: "IN_PERSON" },
  { name: "Bilan", durationMinutes: 45, mode: "IN_PERSON" },
  { name: "Téléconsultation (1ère)", durationMinutes: 45, mode: "VIDEO" },
  { name: "Téléconsultation (suivi)", durationMinutes: 30, mode: "VIDEO" },
]

const DURATION_OPTIONS = [15, 30, 45, 60, 90]
const BUFFER_OPTIONS = [5, 10, 15, 20]

const STEPS = [
  { label: "Cabinet", icon: CalendarDays },
  { label: "Consultations", icon: Clock },
  { label: "Règles", icon: Settings },
]

// ─── Component ──────────────────────────────────────────────────────────────

interface Props {
  onComplete: () => void
}

export function AgendaSetup({ onComplete }: Props) {
  const { accessToken } = useAuthStore()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  // Step 1 — Cabinet
  const [days, setDays] = useState<Record<string, DaySchedule>>(() => {
    const d: Record<string, DaySchedule> = {}
    WEEKDAYS.forEach((wd) => {
      d[wd.key] = {
        enabled: ["lun", "mar", "mer", "jeu", "ven"].includes(wd.key),
        start: "09:00",
        end: "18:00",
      }
    })
    return d
  })

  // Step 2 — Consultation types
  const [types, setTypes] = useState<ConsultationDraft[]>([...DEFAULT_TYPES])
  const [newTypeName, setNewTypeName] = useState("")
  const [newTypeDuration, setNewTypeDuration] = useState(30)

  // Step 3 — Rules
  const [rules, setRules] = useState<RulesDraft>({
    bufferMinutes: null,
    minDelay: "24h",
    maxHorizon: "3 mois",
    autoConfirm: true,
  })

  function toggleDay(key: string) {
    setDays((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }))
  }

  function updateDay(key: string, field: "start" | "end", value: string) {
    setDays((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))
  }

  function updateTypeDuration(index: number, dur: number) {
    setTypes((prev) => prev.map((t, i) => (i === index ? { ...t, durationMinutes: dur } : t)))
  }

  function removeType(index: number) {
    setTypes((prev) => prev.filter((_, i) => i !== index))
  }

  function addCustomType() {
    if (!newTypeName.trim()) return
    setTypes((prev) => [...prev, { name: newTypeName.trim(), durationMinutes: newTypeDuration, mode: "IN_PERSON" }])
    setNewTypeName("")
    setNewTypeDuration(30)
  }

  const enabledDays = WEEKDAYS.filter((wd) => days[wd.key].enabled)
  const canNext = step === 0 ? enabledDays.length > 0 : step === 1 ? types.length > 0 : true

  async function handleSubmit() {
    if (!accessToken) return
    setSubmitting(true)

    try {
      // 1. Create consultation types
      for (const t of types) {
        await appointmentsApi.createConsultationType(accessToken, {
          name: t.name,
          durationMinutes: t.durationMinutes,
          consultationMode: t.mode,
          availablePublicly: true,
        })
      }

      // 2. Create availability slots
      for (const wd of WEEKDAYS) {
        const d = days[wd.key]
        if (!d.enabled) continue
        await appointmentsApi.createSlot(accessToken, {
          weekday: wd.weekday,
          startTime: d.start,
          endTime: d.end,
          isActive: true,
        })
      }

      // 3. Create default location with the configured days/hours
      const activeDays = WEEKDAYS.filter((wd) => days[wd.key].enabled).map((wd) => wd.key.toUpperCase().slice(0, 3))
      const firstEnabled = WEEKDAYS.find((wd) => days[wd.key].enabled)
      await locationsApi.create(accessToken, {
        name: "Cabinet principal",
        locationType: "PHYSICAL",
        color: "#6B7FA3",
        activeDays: activeDays.map((d) => {
          const map: Record<string, string> = { LUN: "MON", MAR: "TUE", MER: "WED", JEU: "THU", VEN: "FRI", SAM: "SAT", DIM: "SUN" }
          return map[d] ?? d
        }),
        openTime: firstEnabled ? days[firstEnabled.key].start : "09:00",
        closeTime: firstEnabled ? days[firstEnabled.key].end : "18:00",
      })

      // 4. Save rules + mark as configured (agendaConfiguredAt = now)
      const minDelayMap: Record<string, number> = { same_day: 0, "24h": 24, "48h": 48, "1_week": 168 }
      const maxHorizonMap: Record<string, number> = { "1 mois": 30, "2 mois": 60, "3 mois": 90, "6 mois": 180 }

      await agendaSettingsApi.update(accessToken, {
        agendaBuffer: rules.bufferMinutes,
        agendaMinNotice: minDelayMap[rules.minDelay] ?? 24,
        agendaMaxHorizon: maxHorizonMap[rules.maxHorizon] ?? 90,
        agendaAutoConfirm: rules.autoConfirm,
      })

      toast.success("Agenda configuré !")
      onComplete()
    } catch (err) {
      toast.error("Erreur lors de la configuration")
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-muted/20 p-6 overflow-y-auto">
      <div className="w-full max-w-xl">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isDone = i < step
            const isActive = i === step
            return (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <div className={cn("w-8 h-px", isDone ? "bg-primary" : "bg-border")} />}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                    isDone
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-primary/10 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {isDone ? <Check size={14} /> : <Icon size={14} />}
                </div>
                <span className={cn("text-xs font-medium hidden sm:inline", isActive ? "text-foreground" : "text-muted-foreground")}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border shadow-sm p-8">
          {step === 0 && (
            <Step1Days days={days} toggleDay={toggleDay} updateDay={updateDay} />
          )}
          {step === 1 && (
            <Step2Types
              types={types}
              updateTypeDuration={updateTypeDuration}
              removeType={removeType}
              newTypeName={newTypeName}
              setNewTypeName={setNewTypeName}
              newTypeDuration={newTypeDuration}
              setNewTypeDuration={setNewTypeDuration}
              addCustomType={addCustomType}
            />
          )}
          {step === 2 && (
            <Step3Rules rules={rules} setRules={setRules} />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            {step > 0 ? (
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setStep(step - 1)}>
                Précédent
              </Button>
            ) : (
              <div />
            )}
            {step < 2 ? (
              <Button size="sm" className="text-xs gap-1.5" disabled={!canNext} onClick={() => setStep(step + 1)}>
                Continuer
              </Button>
            ) : (
              <Button size="sm" className="text-xs gap-1.5" disabled={submitting} onClick={handleSubmit}>
                {submitting ? <Loader2 size={12} className="animate-spin" /> : <CalendarDays size={12} />}
                Lancer mon agenda
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step 1 — Horaires ──────────────────────────────────────────────────────

function Step1Days({
  days,
  toggleDay,
  updateDay,
}: {
  days: Record<string, DaySchedule>
  toggleDay: (key: string) => void
  updateDay: (key: string, field: "start" | "end", value: string) => void
}) {
  return (
    <div>
      <h2 className="text-base font-semibold mb-1">Quand consultez-vous ?</h2>
      <p className="text-xs text-muted-foreground mb-6">
        Sélectionnez vos jours de consultation et définissez vos horaires.
      </p>

      {/* Day toggles */}
      <div className="flex gap-2 mb-6">
        {WEEKDAYS.map((wd) => (
          <button
            key={wd.key}
            onClick={() => toggleDay(wd.key)}
            className={cn(
              "w-9 h-9 rounded-lg text-xs font-semibold transition-all",
              days[wd.key].enabled
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {wd.label}
          </button>
        ))}
      </div>

      {/* Day schedules */}
      <div className="space-y-2">
        {WEEKDAYS.filter((wd) => days[wd.key].enabled).map((wd) => (
          <div key={wd.key} className="flex items-center gap-3 bg-muted/30 rounded-lg px-3 py-2">
            <span className="text-xs font-medium w-10 capitalize">{wd.key}</span>
            <TimeSelect value={days[wd.key].start} onChange={(v) => updateDay(wd.key, "start", v)} />
            <span className="text-xs text-muted-foreground">→</span>
            <TimeSelect value={days[wd.key].end} onChange={(v) => updateDay(wd.key, "end", v)} />
          </div>
        ))}
      </div>
    </div>
  )
}

function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const times: string[] = []
  for (let h = 7; h <= 21; h++) {
    times.push(`${String(h).padStart(2, "0")}:00`)
    times.push(`${String(h).padStart(2, "0")}:30`)
  }
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 px-2 rounded-md border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      {times.map((t) => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
  )
}

// ─── Step 2 — Consultation types ────────────────────────────────────────────

function Step2Types({
  types,
  updateTypeDuration,
  removeType,
  newTypeName,
  setNewTypeName,
  newTypeDuration,
  setNewTypeDuration,
  addCustomType,
}: {
  types: ConsultationDraft[]
  updateTypeDuration: (i: number, dur: number) => void
  removeType: (i: number) => void
  newTypeName: string
  setNewTypeName: (v: string) => void
  newTypeDuration: number
  setNewTypeDuration: (v: number) => void
  addCustomType: () => void
}) {
  return (
    <div>
      <h2 className="text-base font-semibold mb-1">Vos types de consultation</h2>
      <p className="text-xs text-muted-foreground mb-6">
        Définissez les durées par défaut. Vous pourrez les modifier plus tard.
      </p>

      <div className="space-y-3">
        {types.map((t, i) => (
          <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-lg px-3 py-2.5">
            <span className="text-xs font-medium flex-1 truncate">{t.name}</span>
            <div className="flex gap-1">
              {DURATION_OPTIONS.map((dur) => (
                <button
                  key={dur}
                  onClick={() => updateTypeDuration(i, dur)}
                  className={cn(
                    "text-[10px] font-medium px-2 py-1 rounded-md transition-colors",
                    t.durationMinutes === dur
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-muted border border-border"
                  )}
                >
                  {dur}min
                </button>
              ))}
            </div>
            <button
              onClick={() => removeType(i)}
              className="text-muted-foreground hover:text-destructive transition-colors text-xs"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add custom */}
      <div className="mt-4 flex items-center gap-2">
        <Input
          value={newTypeName}
          onChange={(e) => setNewTypeName(e.target.value)}
          placeholder="Ajouter un type personnalisé…"
          className="h-8 text-xs flex-1"
          onKeyDown={(e) => e.key === "Enter" && addCustomType()}
        />
        <select
          value={newTypeDuration}
          onChange={(e) => setNewTypeDuration(Number(e.target.value))}
          className="h-8 px-2 rounded-md border bg-card text-xs"
        >
          {DURATION_OPTIONS.map((d) => (
            <option key={d} value={d}>{d}min</option>
          ))}
        </select>
        <Button size="sm" variant="outline" className="text-xs h-8" onClick={addCustomType} disabled={!newTypeName.trim()}>
          Ajouter
        </Button>
      </div>
    </div>
  )
}

// ─── Step 3 — Rules ─────────────────────────────────────────────────────────

function Step3Rules({
  rules,
  setRules,
}: {
  rules: RulesDraft
  setRules: (r: RulesDraft) => void
}) {
  return (
    <div>
      <h2 className="text-base font-semibold mb-1">Comment organisez-vous votre planning ?</h2>
      <p className="text-xs text-muted-foreground mb-6">
        Ces règles s'appliqueront par défaut à vos créneaux.
      </p>

      <div className="space-y-6">
        {/* Buffer */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Temps de battement entre consultations</span>
            <ToggleSwitch
              checked={rules.bufferMinutes !== null}
              onChange={(v) => setRules({ ...rules, bufferMinutes: v ? 10 : null })}
            />
          </div>
          {rules.bufferMinutes !== null && (
            <div className="flex gap-1">
              {BUFFER_OPTIONS.map((b) => (
                <button
                  key={b}
                  onClick={() => setRules({ ...rules, bufferMinutes: b })}
                  className={cn(
                    "text-[10px] font-medium px-3 py-1.5 rounded-md transition-colors",
                    rules.bufferMinutes === b
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {b} min
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Delays */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Délai minimum avant RDV</label>
            <select
              value={rules.minDelay}
              onChange={(e) => setRules({ ...rules, minDelay: e.target.value })}
              className="w-full h-8 px-2 rounded-md border bg-card text-xs"
            >
              <option value="same_day">Le jour même</option>
              <option value="24h">24 heures</option>
              <option value="48h">48 heures</option>
              <option value="1_week">1 semaine</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Réservations jusqu'à</label>
            <select
              value={rules.maxHorizon}
              onChange={(e) => setRules({ ...rules, maxHorizon: e.target.value })}
              className="w-full h-8 px-2 rounded-md border bg-card text-xs"
            >
              <option value="1 mois">1 mois</option>
              <option value="2 mois">2 mois</option>
              <option value="3 mois">3 mois</option>
              <option value="6 mois">6 mois</option>
            </select>
          </div>
        </div>

        {/* Auto confirm */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium">Confirmer automatiquement les RDV</span>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Les RDV pris via l'annuaire seront confirmés sans validation manuelle.
            </p>
          </div>
          <ToggleSwitch
            checked={rules.autoConfirm}
            onChange={(v) => setRules({ ...rules, autoConfirm: v })}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Toggle switch ──────────────────────────────────────────────────────────

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "w-9 h-5 rounded-full transition-colors relative shrink-0",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <div
        className={cn(
          "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  )
}
