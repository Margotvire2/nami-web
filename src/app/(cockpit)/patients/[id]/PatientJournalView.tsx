"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { apiWithToken, type JournalEntry } from "@/lib/api"
import { format, parseISO, subDays, isSameDay } from "date-fns"
import { fr } from "date-fns/locale"
import {
  ChevronDown, ChevronRight, UtensilsCrossed, Brain, Activity,
  Stethoscope, Sparkles, AlertTriangle, TrendingUp, TrendingDown, Minus,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

// ─── Labels ─────────────────────────────────────────────────────────────────

const EMOTION_LABELS: Record<string, string> = {
  anxiety: "Anxiété", ANXIETY: "Anxiété", sadness: "Tristesse", SADNESS: "Tristesse",
  joy: "Joie", JOY: "Joie", fear: "Peur", FEAR: "Peur",
  anger: "Colère", ANGER: "Colère", disgust: "Dégoût", DISGUST: "Dégoût",
  surprise: "Surprise", SURPRISE: "Surprise", shame: "Honte", SHAME: "Honte",
  guilt: "Culpabilité", GUILT: "Culpabilité", stress: "Stress", STRESS: "Stress",
  loneliness: "Solitude", LONELINESS: "Solitude", pride: "Fierté", PRIDE: "Fierté",
  serenity: "Sérénité", SERENITY: "Sérénité", helplessness: "Impuissance", HELPLESSNESS: "Impuissance",
  calm: "Calme", tired: "Fatigué", overwhelmed: "Surchargé", neutral: "Neutre",
  irritated: "Irrité", lost: "Perdu", energetic: "Plein d'énergie", FRUSTRATION: "Frustration",
}

const MOOD_LABELS: Record<string, string> = {
  sunny: "☀️ Ensoleillé", partly_cloudy: "🌤 Variable", cloudy: "☁️ Couvert",
  rainy: "🌧 Difficile", stormy: "⛈️ Orageux", tornado: "🌪 Tempête",
}
const MOOD_EMOJI: Record<string, string> = { sunny: "☀️", partly_cloudy: "🌤", cloudy: "☁️", rainy: "🌧", stormy: "⛈️", tornado: "🌪" }

const ACTIVITY_LABELS: Record<string, string> = {
  walking: "Marche", running: "Course", cycling: "Vélo", swimming: "Natation",
  yoga: "Yoga", team_sport: "Sport co", housework: "Ménage", gardening: "Jardinage", other: "Autre",
}

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: "Petit-déjeuner", LUNCH: "Déjeuner", DINNER: "Dîner", SNACK: "Collation", OTHER: "Hors repas",
}

const PERIODS: Array<{ key: Period; label: string }> = [
  { key: "today", label: "Aujourd'hui" }, { key: "7d", label: "7 jours" },
  { key: "30d", label: "30 jours" }, { key: "all", label: "Tout" },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

type Period = "today" | "7d" | "30d" | "all"

interface Props {
  careCaseId: string
  pathwayName?: string
  currentPhase?: string
  permissions?: { canSeeAiMacros: boolean; canSeeWeight: boolean; canSeeCrisisDetail: boolean }
}

function fmtTime(iso: string) { return format(parseISO(iso), "HH:mm") }
function fmtDate(iso: string) { return format(parseISO(iso), "d MMM", { locale: fr }) }

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${className}`}>{children}</span>
}

function sensColor(v: number) { return v >= 7 ? "bg-emerald-100 text-emerald-700" : v >= 4 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700" }
function intColor(v: number) { return v >= 7 ? "bg-red-100 text-red-700" : v >= 4 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700" }

function emotionLabel(e: string) { return EMOTION_LABELS[e] ?? e }

// Dedup: same type + same hour (±5min) + same payload keys
function dedup(entries: JournalEntry[]): JournalEntry[] {
  const seen = new Map<string, JournalEntry>()
  for (const e of entries) {
    const t = new Date(e.occurredAt)
    const key = `${e.entryType}_${format(t, "yyyy-MM-dd_HH")}:${Math.floor(t.getMinutes() / 10)}`
    if (!seen.has(key)) seen.set(key, e)
  }
  return Array.from(seen.values())
}

// ─── Section wrapper ────────────────────────────────────────────────────────

function Section({ icon, title, count, defaultOpen, children }: {
  icon: React.ReactNode; title: string; count: number; defaultOpen: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2.5 px-5 py-3.5 text-left hover:bg-muted/20 transition-colors">
        {icon}
        <span className="text-sm font-semibold flex-1">{title}</span>
        {count > 0 && <span className="text-[10px] font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{count}</span>}
        {open ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5 border-t pt-4">{children}</div>}
    </div>
  )
}

function StatCard({ icon, title, value, sub, trend, alert, onClick }: {
  icon: React.ReactNode; title: string; value: string; sub?: string; trend?: "up" | "down" | "stable"; alert?: boolean; onClick?: () => void
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  return (
    <button onClick={onClick} className={`flex-1 min-w-[140px] rounded-xl border p-4 text-left transition-all hover:shadow-sm ${alert ? "bg-red-50 border-red-200" : "bg-card"}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[11px] font-medium text-muted-foreground">{title}</span>
      </div>
      <p className={`text-2xl font-bold ${alert ? "text-red-600" : "text-foreground"}`}>{value}</p>
      <div className="flex items-center gap-1 mt-1">
        {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
        {trend && <TrendIcon size={12} className={trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"} />}
      </div>
    </button>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

export function PatientJournalView({ careCaseId, pathwayName, currentPhase, permissions }: Props) {
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const [period, setPeriod] = useState<Period>("7d")

  const { data: entries, isLoading } = useQuery({
    queryKey: ["journal", careCaseId],
    queryFn: () => api.journal.list(careCaseId),
  })

  // Dans le cockpit soignant, les macros et photos sont toujours visibles
  const canSeeAiMacros = permissions?.canSeeAiMacros ?? true
  const canSeeCrisisDetail = permissions?.canSeeCrisisDetail ?? false

  // Anorexia activity framing
  const isAnorexia = pathwayName?.toLowerCase().includes("anorex") ?? false
  const isRestrictedPhase = ["evaluation", "stabilization", "weight_recovery"].includes(currentPhase ?? "")
  const anorexiaSurveillance = isAnorexia && isRestrictedPhase

  // Filter + dedup
  const filtered = useMemo(() => {
    if (!entries) return []
    const now = new Date()
    const f = entries.filter((e) => {
      const d = parseISO(e.occurredAt)
      if (period === "today") return isSameDay(d, now)
      if (period === "7d") return d >= subDays(now, 7)
      if (period === "30d") return d >= subDays(now, 30)
      return true
    }).sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    return dedup(f)
  }, [entries, period])

  // Group
  const meals = filtered.filter((e) => e.entryType === "MEAL")
  const emotions = filtered.filter((e) => e.entryType === "EMOTION")
  const activities = filtered.filter((e) => e.entryType === "PHYSICAL_ACTIVITY")
  const symptoms = filtered.filter((e) => e.entryType === "SYMPTOM")
  const crises = filtered.filter((e) => e.entryType === "CRISIS_EVENT")
  const positiveNotes = filtered.filter((e) => e.entryType === "POSITIVE_THOUGHT" || e.entryType === "NOTE")

  // Stats
  const periodDays = period === "today" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : Math.max(1, Math.ceil((Date.now() - new Date(entries?.[entries.length - 1]?.occurredAt ?? Date.now()).getTime()) / 86400000))
  const mealsPerDay = Math.round((meals.filter((m) => !(m.payload as Record<string, unknown>).skipped).length / periodDays) * 10) / 10
  const skippedMeals = meals.filter((m) => !!(m.payload as Record<string, unknown>).skipped).length

  const energyEntries = emotions.filter((e) => (e.payload as Record<string, unknown>).energy != null)
  const avgEnergy = energyEntries.length > 0 ? Math.round(energyEntries.reduce((s, e) => s + Number((e.payload as Record<string, unknown>).energy), 0) / energyEntries.length) : null

  const totalActivityMin = activities.reduce((s, a) => s + (Number((a.payload as Record<string, unknown>).durationMinutes) || 0), 0)
  const avgPleasure = activities.length > 0 ? Math.round(activities.reduce((s, a) => s + (Number((a.payload as Record<string, unknown>).pleasure) || 0), 0) / activities.length * 10) / 10 : null
  const painCount = activities.filter((a) => Number((a.payload as Record<string, unknown>).pain) > 3).length

  if (isLoading) return <div className="p-6 space-y-3"><Skeleton className="h-10 w-48" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Journal patient <span className="text-muted-foreground font-normal">({filtered.length})</span></h2>
        <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
          {PERIODS.map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`text-[10px] font-medium px-2.5 py-1 rounded-md transition-colors ${period === p.key ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Sparkles size={24} className="mx-auto mb-2 opacity-20" />
          <p className="text-sm">Aucune entrée sur cette période</p>
        </div>
      )}

      {/* ROW 1 — Dashboard cards */}
      {filtered.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <StatCard
            icon={<Brain size={14} className="text-violet-500" />}
            title="Énergie"
            value={avgEnergy != null ? `${avgEnergy}%` : "—"}
            sub={energyEntries.length > 0 ? `${energyEntries.length} check-ins` : "Pas de données"}
            trend={avgEnergy != null ? (avgEnergy > 60 ? "up" : avgEnergy < 40 ? "down" : "stable") : undefined}
          />
          <StatCard
            icon={<UtensilsCrossed size={14} className="text-amber-500" />}
            title="Alimentation"
            value={`${mealsPerDay} repas/j`}
            sub={skippedMeals > 0 ? `${skippedMeals} sautés` : "Aucun sauté"}
            alert={skippedMeals > 2}
          />
          {!anorexiaSurveillance ? (
            <StatCard
              icon={<Activity size={14} className="text-green-500" />}
              title="Activité"
              value={`${totalActivityMin} min`}
              sub={avgPleasure != null ? `Plaisir ${avgPleasure}/10` : "—"}
              trend={totalActivityMin >= 150 ? "up" : totalActivityMin > 0 ? "stable" : undefined}
            />
          ) : (
            <StatCard
              icon={<Activity size={14} className="text-amber-500" />}
              title="Activité — À évaluer"
              value={`${totalActivityMin} min`}
              sub={painCount > 0 ? `${painCount} douleurs` : "—"}
              alert={totalActivityMin > 420 || (avgPleasure === 0 && totalActivityMin > 60)}
            />
          )}
        </div>
      )}

      {/* ROW 2 — Alerts */}
      {filtered.length > 0 && (
        <AlertBanner meals={meals} energyEntries={energyEntries} activities={activities} anorexiaSurveillance={anorexiaSurveillance} avgPleasure={avgPleasure} totalActivityMin={totalActivityMin} />
      )}

      {/* ── ALIMENTATION ── */}
      {meals.length > 0 && (
        <Section icon={<UtensilsCrossed size={15} className="text-amber-600" />} title="Alimentation" count={meals.length} defaultOpen>
          <div className="grid md:grid-cols-2 gap-4 mt-2">
            <MealHeatmap meals={meals} />
            <div className="space-y-2">
              <MiniStat label="Repas/jour" value={String(mealsPerDay)} />
              <MiniStat label="Sautés" value={String(skippedMeals)} alert={skippedMeals > 2} />
            </div>
          </div>
          <IngestaTotals meals={meals} />
          <div className="grid md:grid-cols-2 gap-2 mt-4">
            {meals.slice(0, 8).map((m) => <MealCard key={m.id} entry={m} canSeeAiMacros={canSeeAiMacros} />)}
          </div>
        </Section>
      )}

      {/* ── SANTÉ MENTALE ── */}
      {emotions.length > 0 && (
        <Section icon={<Brain size={15} className="text-violet-600" />} title="Santé mentale" count={emotions.length + crises.length} defaultOpen={false}>
          <div className="grid md:grid-cols-2 gap-4 mt-2">
            <MoodWeek entries={emotions} />
            <EnergyChart entries={emotions} />
          </div>
          <div className="grid md:grid-cols-2 gap-2 mt-3">
            {emotions.slice(0, 8).map((e) => <EmotionCard key={e.id} entry={e} />)}
          </div>
          {crises.length > 0 && canSeeCrisisDetail && (
            <div className="mt-4 pt-3 border-t">
              <p className="text-[10px] font-semibold text-red-600 mb-2">ÉVÉNEMENTS DE CRISE ({crises.length})</p>
              {crises.map((c) => <CrisisCard key={c.id} entry={c} />)}
            </div>
          )}
        </Section>
      )}

      {/* ── ACTIVITÉ PHYSIQUE ── */}
      {activities.length > 0 && (
        <Section
          icon={<Activity size={15} className={anorexiaSurveillance ? "text-amber-600" : "text-green-600"} />}
          title={anorexiaSurveillance ? "Activité physique — À évaluer" : "Activité physique"}
          count={activities.length}
          defaultOpen={false}
        >
          <div className="flex gap-3 mt-2 mb-3 flex-wrap">
            <MiniStat label="Min/semaine" value={String(totalActivityMin)} />
            <MiniStat label="Plaisir moy" value={avgPleasure != null ? `${avgPleasure}/10` : "—"} />
            <MiniStat label="Douleurs" value={String(painCount)} alert={painCount > 2} />
          </div>
          {anorexiaSurveillance && totalActivityMin > 420 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 mb-3 flex items-center gap-2">
              <AlertTriangle size={14} /> Activité élevée ({totalActivityMin} min/sem) — à évaluer
            </div>
          )}
          {anorexiaSurveillance && avgPleasure === 0 && totalActivityMin > 60 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 mb-3 flex items-center gap-2">
              <AlertTriangle size={14} /> Activité sans plaisir — possible hyperactivité compensatoire
            </div>
          )}
          <div className="space-y-2">
            {activities.slice(0, 6).map((a) => <ActivityCard key={a.id} entry={a} anorexiaSurveillance={anorexiaSurveillance} />)}
          </div>
        </Section>
      )}

      {/* ── SYMPTÔMES + PENSÉES — side by side ── */}
      {(symptoms.length > 0 || positiveNotes.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {symptoms.length > 0 && (
            <Section icon={<Stethoscope size={15} className="text-red-600" />} title="Symptômes" count={symptoms.length} defaultOpen={false}>
              <div className="space-y-2 mt-2">
                {symptoms.slice(0, 6).map((s) => {
                  const p = s.payload as Record<string, unknown>
                  return (
                    <div key={s.id} className="flex items-center gap-2 text-xs">
                      <span>🩺</span>
                      <span className="font-medium flex-1">{String(p.symptomType ?? "Symptôme")}</span>
                      {p.intensity != null && <Badge className={intColor(Number(p.intensity))}>{String(p.intensity)}/10</Badge>}
                      <span className="text-muted-foreground">{fmtDate(s.occurredAt)}</span>
                    </div>
                  )
                })}
              </div>
            </Section>
          )}
          {positiveNotes.length > 0 && (
            <Section icon={<Sparkles size={15} className="text-yellow-600" />} title="Pensées & notes" count={positiveNotes.length} defaultOpen={false}>
              <div className="space-y-2 mt-2">
                {positiveNotes.slice(0, 6).map((n) => (
                  <div key={n.id} className="text-xs bg-muted/30 rounded-lg p-2.5">
                    <p className="text-foreground leading-relaxed">
                      {n.entryType === "POSITIVE_THOUGHT" ? "✨ " : "📝 "}
                      {String((n.payload as Record<string, unknown>).text ?? (n.payload as Record<string, unknown>).content ?? "")}
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-1">{fmtDate(n.occurredAt)} · {fmtTime(n.occurredAt)}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function MiniStat({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className={`px-3 py-2 rounded-lg border text-center min-w-[80px] ${alert ? "bg-red-50 border-red-200" : "bg-muted/30"}`}>
      <p className={`text-base font-bold ${alert ? "text-red-600" : "text-foreground"}`}>{value}</p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
  )
}

function AlertBanner({ meals, energyEntries, activities, anorexiaSurveillance, avgPleasure, totalActivityMin }: {
  meals: JournalEntry[]; energyEntries: JournalEntry[]; activities: JournalEntry[];
  anorexiaSurveillance: boolean; avgPleasure: number | null; totalActivityMin: number
}) {
  const alerts: string[] = []
  const todayMeals = meals.filter((m) => isSameDay(parseISO(m.occurredAt), new Date()))
  if (todayMeals.length === 0) alerts.push("Aucun repas enregistré aujourd'hui")

  const lastEnergyEntries = energyEntries.slice(0, 3)
  if (lastEnergyEntries.length >= 3 && lastEnergyEntries.every((e) => Number((e.payload as Record<string, unknown>).energy) < 40)) {
    alerts.push("Énergie en baisse (3 derniers check-ins < 40%)")
  }

  if (anorexiaSurveillance && totalActivityMin > 420) alerts.push("Activité physique élevée — à évaluer")
  if (anorexiaSurveillance && avgPleasure === 0 && totalActivityMin > 60) alerts.push("Activité sans plaisir — possible hyperactivité compensatoire")

  if (alerts.length === 0) return null
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
      <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        {alerts.map((a, i) => <p key={i} className="text-xs text-amber-700">{a}</p>)}
      </div>
    </div>
  )
}

function MealHeatmap({ meals }: { meals: JournalEntry[] }) {
  const types = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"]
  const labels = ["P.déj", "Déj", "Dîner", "Coll"]
  const days: Date[] = []
  for (let i = 6; i >= 0; i--) days.push(subDays(new Date(), i))

  return (
    <div>
      <p className="text-[10px] font-medium text-muted-foreground mb-2">HEATMAP 7 JOURS</p>
      <div className="grid gap-1" style={{ gridTemplateColumns: "40px repeat(7, 1fr)" }}>
        <div />
        {days.map((d, i) => <p key={i} className="text-[9px] text-muted-foreground text-center">{format(d, "EEE", { locale: fr })}</p>)}
        {types.map((type, ti) => (
          <div key={`row${ti}`} className="contents">
            <p className="text-[9px] text-muted-foreground truncate">{labels[ti]}</p>
            {days.map((d, di) => {
              const has = meals.some((m) => isSameDay(parseISO(m.occurredAt), d) && (m.payload as Record<string, unknown>).moment === type)
              const skipped = meals.some((m) => isSameDay(parseISO(m.occurredAt), d) && (m.payload as Record<string, unknown>).moment === type && !!(m.payload as Record<string, unknown>).skipped)
              return <div key={`${ti}-${di}`} className={`w-5 h-5 rounded mx-auto ${skipped ? "bg-red-200" : has ? "bg-emerald-200" : "bg-muted/40"}`} />
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function MealCard({ entry, canSeeAiMacros }: { entry: JournalEntry; canSeeAiMacros: boolean }) {
  const [photoExpanded, setPhotoExpanded] = useState(false)
  const p = entry.payload as Record<string, unknown>
  const sens = p.sensations as Record<string, number> | undefined
  // Macros depuis payload (mobile, ancienne structure)
  const payloadMacros = (p.aiAnalysis ?? p.macros ?? p.aiMacros) as Record<string, number> | undefined
  // Macros validées par le soignant (via validate-meal-analysis) — format backend
  const validatedMacros = entry.photoMacros?.macros

  return (
    <div className="rounded-lg border bg-card text-xs overflow-hidden">
      {/* Photo du repas */}
      {entry.photoUrl && (
        <div className="relative cursor-pointer" onClick={() => setPhotoExpanded(!photoExpanded)}>
          <img
            src={entry.photoUrl}
            alt="Photo repas"
            loading="lazy"
            className={`w-full object-cover transition-all ${photoExpanded ? "h-48" : "h-28"}`}
          />
          {entry.photoValidated && (
            <span className="absolute top-1.5 right-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white">
              ✓ Analysé
            </span>
          )}
          {!entry.photoValidated && entry.photoAnalyzed && (
            <span className="absolute top-1.5 right-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
              En attente
            </span>
          )}
        </div>
      )}

      <div className="p-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{fmtTime(entry.occurredAt)}</span>
          <span className="font-semibold">{MEAL_LABELS[String(p.moment)] ?? "Repas"}</span>
          {!!p.skipped && <Badge className="bg-red-100 text-red-700">Sauté</Badge>}
        </div>
        {!!p.description && <p className="text-muted-foreground">{String(p.description)}</p>}
        {sens && (
          <div className="flex gap-1 flex-wrap">
            {sens.hunger != null && <Badge className={sensColor(sens.hunger)}>Faim {sens.hunger}</Badge>}
            {sens.satiety != null && <Badge className={sensColor(sens.satiety)}>Satiété {sens.satiety}</Badge>}
            {sens.pleasure != null && <Badge className={sensColor(sens.pleasure)}>Plaisir {sens.pleasure}</Badge>}
            {sens.duration != null && <Badge className="bg-muted text-muted-foreground">{sens.duration}min</Badge>}
          </div>
        )}

        {/* Macros validées par le soignant (prioritaires) */}
        {canSeeAiMacros && validatedMacros && (
          <div className="bg-violet-50 rounded p-2 border border-violet-100 mt-1">
            <p className="text-[10px] font-semibold text-violet-700 mb-1">Ingesta validés</p>
            <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 text-[10px]">
              <span className="text-muted-foreground">Énergie</span>
              <span className="font-semibold col-span-2">{validatedMacros.kcal} kcal</span>
              <span className="text-muted-foreground">Protéines</span>
              <span className="font-medium col-span-2">{validatedMacros.proteines_g} g</span>
              <span className="text-muted-foreground">Glucides</span>
              <span className="font-medium col-span-2">{validatedMacros.glucides_g} g</span>
              <span className="text-muted-foreground">Lipides</span>
              <span className="font-medium col-span-2">{validatedMacros.lipides_g} g</span>
              {validatedMacros.fibres_g > 0 && (
                <>
                  <span className="text-muted-foreground">Fibres</span>
                  <span className="font-medium col-span-2">{validatedMacros.fibres_g} g</span>
                </>
              )}
            </div>
            {entry.photoMacros?.aliments && entry.photoMacros.aliments.length > 0 && (
              <p className="text-[9px] text-muted-foreground mt-1">
                {entry.photoMacros.aliments.map((a) => `${a.nom} (${a.quantite_g}g)`).join(", ")}
              </p>
            )}
          </div>
        )}

        {/* Macros payload (mobile — si pas encore validées) */}
        {canSeeAiMacros && !validatedMacros && payloadMacros && (
          <div className="bg-indigo-50 rounded p-2 border border-indigo-100 mt-1">
            <p className="text-[10px] font-semibold text-indigo-600 mb-0.5">Brouillon IA — à valider</p>
            <div className="flex gap-2 flex-wrap text-[10px]">
              {payloadMacros.calories != null && <span className="font-medium">{payloadMacros.calories} kcal</span>}
              {payloadMacros.protein_g != null && <span>P: {payloadMacros.protein_g}g</span>}
              {payloadMacros.carbs_g != null && <span>G: {payloadMacros.carbs_g}g</span>}
              {payloadMacros.fat_g != null && <span>L: {payloadMacros.fat_g}g</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── IngestaTotals ───────────────────────────────────────────────────────────

function IngestaTotals({ meals }: { meals: JournalEntry[] }) {
  // Calculer les totaux uniquement sur les repas avec des macros validées
  const totals = useMemo(() => {
    let kcal = 0, proteines = 0, glucides = 0, lipides = 0, fibres = 0, count = 0
    for (const m of meals) {
      const mac = m.photoMacros?.macros
      if (!mac) continue
      kcal += mac.kcal ?? 0
      proteines += mac.proteines_g ?? 0
      glucides += mac.glucides_g ?? 0
      lipides += mac.lipides_g ?? 0
      fibres += mac.fibres_g ?? 0
      count++
    }
    return count > 0 ? { kcal: Math.round(kcal), proteines: Math.round(proteines), glucides: Math.round(glucides), lipides: Math.round(lipides), fibres: Math.round(fibres), count } : null
  }, [meals])

  if (!totals) return null

  return (
    <div className="mt-3 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-100">
      <p className="text-[10px] font-semibold text-amber-700 mb-1.5">
        Total ingesta validés ({totals.count} repas analysés)
      </p>
      <div className="flex gap-4 flex-wrap text-xs">
        <div className="text-center">
          <p className="font-bold text-amber-900">{totals.kcal}</p>
          <p className="text-[9px] text-amber-600">kcal</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-amber-900">{totals.proteines}g</p>
          <p className="text-[9px] text-amber-600">Protéines</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-amber-900">{totals.glucides}g</p>
          <p className="text-[9px] text-amber-600">Glucides</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-amber-900">{totals.lipides}g</p>
          <p className="text-[9px] text-amber-600">Lipides</p>
        </div>
        {totals.fibres > 0 && (
          <div className="text-center">
            <p className="font-bold text-amber-900">{totals.fibres}g</p>
            <p className="text-[9px] text-amber-600">Fibres</p>
          </div>
        )}
      </div>
      <p className="text-[9px] text-amber-500 mt-1.5">Brouillon IA — validé par le soignant</p>
    </div>
  )
}

function EmotionCard({ entry }: { entry: JournalEntry }) {
  const p = entry.payload as Record<string, unknown>
  const mood = p.mood as string | undefined
  const emotions = (p.emotions as string[]) ?? (p.emotionType ? [p.emotionType as string] : [])
  const intensity = p.intensity as number | undefined

  if (mood) {
    return (
      <div className="rounded-lg border bg-card p-3 text-xs flex items-center gap-3">
        <span className="text-lg">{MOOD_EMOJI[mood] ?? "🌤"}</span>
        <div className="flex-1">
          <p className="font-medium">{MOOD_LABELS[mood] ?? mood}</p>
          {p.energy != null && <p className="text-muted-foreground">Énergie {String(p.energy)}%</p>}
        </div>
        <span className="text-muted-foreground">{fmtTime(entry.occurredAt)}</span>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-3 text-xs space-y-1">
      <div className="flex items-center gap-2">
        <span className="font-semibold">{emotions.map(emotionLabel).join(", ") || "Émotion"}</span>
        {intensity != null && <Badge className={intColor(intensity)}>{intensity}/10</Badge>}
        <span className="text-muted-foreground ml-auto">{fmtTime(entry.occurredAt)}</span>
      </div>
      {!!p.trigger && <p className="text-muted-foreground">Déclencheur : {String(p.trigger)}</p>}
    </div>
  )
}

function CrisisCard({ entry }: { entry: JournalEntry }) {
  const p = entry.payload as Record<string, unknown>
  const outcome = p.outcome as string | undefined
  const label = outcome === "resisted" ? "💪 A tenu" : outcome === "partial" ? "🤝 Limité" : "Crise complète"
  return (
    <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 text-xs space-y-1 mb-2">
      <div className="flex items-center gap-2">
        <span>🚨</span>
        <Badge className="bg-red-100 text-red-700">{label}</Badge>
        {!!p.duration_minutes && <span className="text-muted-foreground">{String(p.duration_minutes)}min</span>}
        <span className="text-muted-foreground ml-auto">{fmtDate(entry.occurredAt)}</span>
      </div>
      {!!((p.coping_used as string[] | undefined)?.length) && (
        <p className="text-muted-foreground">Stratégies : {(p.coping_used as string[]).join(", ")}</p>
      )}
    </div>
  )
}

function ActivityCard({ entry, anorexiaSurveillance }: { entry: JournalEntry; anorexiaSurveillance: boolean }) {
  const p = entry.payload as Record<string, unknown>
  const pleasure = Number(p.pleasure ?? 0)
  const duration = Number(p.durationMinutes ?? 0)

  // Anorexia: high pleasure + high duration = orange/red
  const pleasureBadge = anorexiaSurveillance
    ? (pleasure >= 8 && duration > 45 ? "bg-amber-100 text-amber-700" : sensColor(pleasure))
    : sensColor(pleasure)

  return (
    <div className="rounded-lg border bg-card p-3 text-xs flex items-center gap-3">
      <span>🏃</span>
      <div className="flex-1">
        <p className="font-medium">{ACTIVITY_LABELS[String(p.activityType ?? p.activityName)] ?? String(p.activityType ?? "Activité")} — {duration}min</p>
        <div className="flex gap-1 mt-1">
          <Badge className={pleasureBadge}>Plaisir {pleasure}/10</Badge>
          {Number(p.pain) > 0 && <Badge className={intColor(Number(p.pain))}>Douleur {String(p.pain)}/10</Badge>}
        </div>
      </div>
      <span className="text-muted-foreground">{fmtTime(entry.occurredAt)}</span>
    </div>
  )
}

function MoodWeek({ entries }: { entries: JournalEntry[] }) {
  const days: Array<{ label: string; emoji: string }> = []
  for (let i = 6; i >= 0; i--) {
    const d = subDays(new Date(), i)
    const mood = entries.find((e) => isSameDay(parseISO(e.occurredAt), d) && !!(e.payload as Record<string, unknown>).mood)
    const key = mood ? String((mood.payload as Record<string, unknown>).mood) : ""
    days.push({ label: format(d, "EEE", { locale: fr }), emoji: MOOD_EMOJI[key] ?? "·" })
  }

  const dominant = entries.filter((e) => !!(e.payload as Record<string, unknown>).mood)
    .reduce((acc, e) => {
      const m = String((e.payload as Record<string, unknown>).mood)
      acc[m] = (acc[m] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  const topMood = Object.entries(dominant).sort((a, b) => b[1] - a[1])[0]

  return (
    <div>
      <p className="text-[10px] font-medium text-muted-foreground mb-2">MÉTÉO 7 JOURS</p>
      <div className="flex justify-between mb-2">
        {days.map((d, i) => (
          <div key={i} className="text-center">
            <p className="text-lg">{d.emoji}</p>
            <p className="text-[9px] text-muted-foreground">{d.label}</p>
          </div>
        ))}
      </div>
      {topMood && <p className="text-[10px] text-muted-foreground">Dominante : {MOOD_LABELS[topMood[0]] ?? topMood[0]}</p>}
    </div>
  )
}

function EnergyChart({ entries }: { entries: JournalEntry[] }) {
  const data = entries
    .filter((e) => (e.payload as Record<string, unknown>).energy != null)
    .map((e) => ({ date: format(parseISO(e.occurredAt), "d/MM"), energy: Number((e.payload as Record<string, unknown>).energy) }))
    .reverse().slice(-14)

  if (data.length < 2) return null
  return (
    <div>
      <p className="text-[10px] font-medium text-muted-foreground mb-1">COURBE D&apos;ÉNERGIE</p>
      <div className="h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" tick={{ fontSize: 9 }} />
            <YAxis domain={[0, 100]} hide />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="energy" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
