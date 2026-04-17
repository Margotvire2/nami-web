"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { apiWithToken, type JournalEntry } from "@/lib/api"
import { format, parseISO, subDays, isSameDay } from "date-fns"
import { fr } from "date-fns/locale"
import {
  UtensilsCrossed, Brain, Activity,
  Stethoscope, Sparkles, AlertTriangle, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronRight,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { NutritionAnalysis } from "@/components/NutritionAnalysis"
import { type NutritionAnalysisResult } from "@/lib/api"

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
const MOOD_EMOJI: Record<string, string> = {
  sunny: "☀️", partly_cloudy: "🌤", cloudy: "☁️", rainy: "🌧", stormy: "⛈️", tornado: "🌪",
}

const ACTIVITY_LABELS: Record<string, string> = {
  walking: "Marche", running: "Course", cycling: "Vélo", swimming: "Natation",
  yoga: "Yoga", team_sport: "Sport co", housework: "Ménage", gardening: "Jardinage", other: "Autre",
}

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: "Petit-déjeuner", LUNCH: "Déjeuner", DINNER: "Dîner", SNACK: "Collation", OTHER: "Hors repas",
  breakfast: "Petit-déjeuner", lunch: "Déjeuner", dinner: "Dîner", snack: "Collation",
}

const CONTEXT_LABELS: Record<string, string> = {
  alone: "👤 Seul(e)", family: "👥 En famille", friends: "👫 Entre amis",
  work: "💼 Au travail", screen: "📱 Devant un écran", walking: "🚶 En marchant",
  restaurant: "🍴 Au restaurant",
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

function sensColor(v: number) {
  return v >= 7 ? "bg-emerald-100 text-emerald-700" : v >= 4 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
}
function intColor(v: number) {
  return v >= 7 ? "bg-red-100 text-red-700" : v >= 4 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
}

function dedup(entries: JournalEntry[]): JournalEntry[] {
  const seen = new Map<string, JournalEntry>()
  for (const e of entries) {
    const t = new Date(e.occurredAt)
    const key = `${e.entryType}_${format(t, "yyyy-MM-dd_HH")}:${Math.floor(t.getMinutes() / 10)}`
    if (!seen.has(key)) seen.set(key, e)
  }
  return Array.from(seen.values())
}

// ─── Shared sub-components ──────────────────────────────────────────────────

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${className}`}>{children}</span>
}

function SensationBar({ emoji, label, value, max, color }: {
  emoji: string; label: string; value: number; max: number; color: string
}) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-4 shrink-0">{emoji}</span>
      <span className="text-[10px] font-medium text-gray-500 w-[72px] shrink-0 truncate">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-semibold text-gray-600 w-8 text-right shrink-0">{value}/{max}</span>
    </div>
  )
}

function StatCard({ icon, title, value, sub, trend, alert, onClick }: {
  icon: React.ReactNode; title: string; value: string; sub?: string
  trend?: "up" | "down" | "stable"; alert?: boolean; onClick?: () => void
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  return (
    <button onClick={onClick} className={`flex-1 min-w-[140px] rounded-xl border p-4 text-left transition-all hover:shadow-sm ${alert ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-[11px] font-medium text-gray-500">{title}</span></div>
      <p className={`text-2xl font-bold ${alert ? "text-red-600" : "text-gray-900"}`}>{value}</p>
      <div className="flex items-center gap-1 mt-1">
        {sub && <span className="text-[10px] text-gray-400">{sub}</span>}
        {trend && <TrendIcon size={12} className={trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-gray-400"} />}
      </div>
    </button>
  )
}

function MiniStat({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className={`px-3 py-2 rounded-lg border text-center min-w-[80px] ${alert ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
      <p className={`text-base font-bold ${alert ? "text-red-600" : "text-gray-900"}`}>{value}</p>
      <p className="text-[9px] text-gray-400">{label}</p>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

export function PatientJournalView({ careCaseId, pathwayName, currentPhase, permissions }: Props) {
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const [period, setPeriod] = useState<Period>("7d")
  const [overviewOpen, setOverviewOpen] = useState(false)

  const { data: entries, isLoading } = useQuery({
    queryKey: ["journal", careCaseId],
    queryFn: () => api.journal.list(careCaseId),
  })

  const canSeeAiMacros = permissions?.canSeeAiMacros ?? true
  const canSeeCrisisDetail = permissions?.canSeeCrisisDetail ?? false

  const isAnorexia = pathwayName?.toLowerCase().includes("anorex") ?? false
  const isRestrictedPhase = ["evaluation", "stabilization", "weight_recovery"].includes(currentPhase ?? "")
  const anorexiaSurveillance = isAnorexia && isRestrictedPhase

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

  // Stats
  const meals = filtered.filter((e) => e.entryType === "MEAL")
  const emotions = filtered.filter((e) => e.entryType === "EMOTION")
  const activities = filtered.filter((e) => e.entryType === "PHYSICAL_ACTIVITY")
  const symptoms = filtered.filter((e) => e.entryType === "SYMPTOM")
  const crises = filtered.filter((e) => e.entryType === "CRISIS_EVENT")

  const periodDays = period === "today" ? 1 : period === "7d" ? 7 : period === "30d" ? 30
    : Math.max(1, Math.ceil((Date.now() - new Date(entries?.[entries.length - 1]?.occurredAt ?? Date.now()).getTime()) / 86400000))
  const mealsPerDay = Math.round((meals.filter((m) => !(m.payload as Record<string, unknown>).skipped).length / periodDays) * 10) / 10
  const skippedMeals = meals.filter((m) => !!(m.payload as Record<string, unknown>).skipped).length

  const energyEntries = emotions.filter((e) => (e.payload as Record<string, unknown>).energy != null)
  const avgEnergy = energyEntries.length > 0
    ? Math.round(energyEntries.reduce((s, e) => s + Number((e.payload as Record<string, unknown>).energy), 0) / energyEntries.length)
    : null

  const totalActivityMin = activities.reduce((s, a) => s + (Number((a.payload as Record<string, unknown>).durationMinutes) || 0), 0)
  const avgPleasure = activities.length > 0
    ? Math.round(activities.reduce((s, a) => s + (Number((a.payload as Record<string, unknown>).pleasure) || 0), 0) / activities.length * 10) / 10
    : null
  const painCount = activities.filter((a) => Number((a.payload as Record<string, unknown>).pain) > 3).length

  // Day grouping for column layout
  const dayGroups = useMemo(() => {
    const map = new Map<string, JournalEntry[]>()
    for (const e of filtered) {
      const key = format(parseISO(e.occurredAt), "yyyy-MM-dd")
      const arr = map.get(key) ?? []
      arr.push(e)
      map.set(key, arr)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([dateKey, dayEntries]) => {
        const d = parseISO(dateKey)
        const raw = format(d, "EEEE d", { locale: fr })
        const label = raw.charAt(0).toUpperCase() + raw.slice(1)
        return {
          dateKey,
          label,
          entries: [...dayEntries].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)),
        }
      })
  }, [filtered])

  if (isLoading) return (
    <div className="p-6 space-y-3">
      <Skeleton className="h-10 w-48" /><Skeleton className="h-24" /><Skeleton className="h-24" />
    </div>
  )

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">
          Journal patient <span className="text-gray-400 font-normal">({filtered.length})</span>
        </h2>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {PERIODS.map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`text-[10px] font-medium px-2.5 py-1 rounded-md transition-colors ${
                period === p.key ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Sparkles size={24} className="mx-auto mb-2 opacity-20" />
          <p className="text-sm">Aucune entrée sur cette période</p>
        </div>
      )}

      {filtered.length > 0 && (
        <>
          {/* Stats row */}
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

          {/* Alert banner */}
          <AlertBanner
            meals={meals}
            energyEntries={energyEntries}
            activities={activities}
            anorexiaSurveillance={anorexiaSurveillance}
            avgPleasure={avgPleasure}
            totalActivityMin={totalActivityMin}
          />

          {/* Vue d'ensemble — collapsible */}
          {(meals.length > 0 || emotions.length > 0) && (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <button
                onClick={() => setOverviewOpen(!overviewOpen)}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-semibold text-gray-700 flex-1">Vue d&apos;ensemble</span>
                {overviewOpen
                  ? <ChevronDown size={14} className="text-gray-400" />
                  : <ChevronRight size={14} className="text-gray-400" />
                }
              </button>
              {overviewOpen && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {meals.length > 0 && <MealHeatmap meals={meals} />}
                    {emotions.length > 0 && <MoodWeek entries={emotions} />}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <IngestaTotals meals={meals} />
                    {emotions.length > 0 && <EnergyChart entries={emotions} />}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Crises — toujours visibles si accès */}
          {crises.length > 0 && canSeeCrisisDetail && (
            <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
              <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-2">
                Événements de crise ({crises.length})
              </p>
              <div className="space-y-2">
                {crises.map((c) => <CrisisCard key={c.id} entry={c} />)}
              </div>
            </div>
          )}

          {/* Day-column scroll */}
          {dayGroups.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
              {dayGroups.map(({ dateKey, label, entries: dayEntries }) => (
                <div key={dateKey} className="flex-shrink-0 w-[300px]">
                  {/* Day header */}
                  <div className="sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10 py-2 px-1 mb-3 rounded-lg border border-gray-100">
                    <p className="text-sm font-bold text-gray-800">{label}</p>
                    <p className="text-[10px] text-gray-400">{dayEntries.length} entrée{dayEntries.length > 1 ? "s" : ""}</p>
                  </div>

                  {/* Entries */}
                  <div className="space-y-3">
                    {dayEntries.map((entry) => {
                      switch (entry.entryType) {
                        case "MEAL":
                          return <MealCard key={entry.id} entry={entry} careCaseId={careCaseId} canSeeAiMacros={canSeeAiMacros} />
                        case "EMOTION":
                          return <EmotionCard key={entry.id} entry={entry} />
                        case "PHYSICAL_ACTIVITY":
                          return <ActivityCard key={entry.id} entry={entry} anorexiaSurveillance={anorexiaSurveillance} />
                        case "SYMPTOM":
                          return <SymptomCard key={entry.id} entry={entry} />
                        case "SLEEP":
                          return <SleepCard key={entry.id} entry={entry} />
                        case "POSITIVE_THOUGHT":
                        case "NOTE":
                          return <NoteCard key={entry.id} entry={entry} />
                        default:
                          return <GenericCard key={entry.id} entry={entry} />
                      }
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Alert banner ────────────────────────────────────────────────────────────

function AlertBanner({ meals, energyEntries, activities, anorexiaSurveillance, avgPleasure, totalActivityMin }: {
  meals: JournalEntry[]; energyEntries: JournalEntry[]; activities: JournalEntry[]
  anorexiaSurveillance: boolean; avgPleasure: number | null; totalActivityMin: number
}) {
  const alerts: string[] = []
  const todayMeals = meals.filter((m) => isSameDay(parseISO(m.occurredAt), new Date()))
  if (todayMeals.length === 0 && meals.length > 0) alerts.push("Aucun repas enregistré aujourd'hui")

  const lastEnergy = energyEntries.slice(0, 3)
  if (lastEnergy.length >= 3 && lastEnergy.every((e) => Number((e.payload as Record<string, unknown>).energy) < 40)) {
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

// ─── Meal card ───────────────────────────────────────────────────────────────

function MealCard({ entry, careCaseId, canSeeAiMacros }: {
  entry: JournalEntry; careCaseId: string; canSeeAiMacros: boolean
}) {
  const p = entry.payload as Record<string, unknown>
  const sens = p.sensations as Record<string, number> | undefined
  const mealLabel = MEAL_LABELS[String(p.moment ?? p.mealType ?? "")] ?? "Repas"
  const validatedMacros = entry.photoMacros?.macros
  const payloadMacros = (p.aiAnalysis ?? p.macros ?? p.aiMacros) as Record<string, number> | undefined

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-50">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🍽</span>
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">{mealLabel}</span>
          {!!p.skipped && <Badge className="bg-red-100 text-red-700 ml-1">Sauté</Badge>}
        </div>
        <span className="text-xs text-gray-400 tabular-nums">{fmtTime(entry.occurredAt)}</span>
      </div>

      {/* Photo — pleine largeur, aspect 4:3 */}
      {entry.photoUrl && (
        <div className="relative w-full aspect-[4/3] bg-gray-100">
          <img
            src={entry.photoUrl}
            alt={mealLabel}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          {entry.photoValidated && (
            <span className="absolute top-2 right-2 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white">
              ✓ Analysé
            </span>
          )}
          {!entry.photoValidated && entry.photoAnalyzed && (
            <span className="absolute top-2 right-2 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
              En attente
            </span>
          )}
        </div>
      )}

      <div className="px-3 py-2.5 space-y-2.5">
        {/* Description */}
        {!!p.description && (
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{String(p.description)}</p>
        )}

        {/* Repas sauté */}
        {(!!p.skipped && !p.description) && (
          <p className="text-xs text-gray-400 italic">Repas non pris</p>
        )}

        {/* Sensations — barres visuelles */}
        {sens && (sens.hunger != null || sens.satiety != null || sens.pleasure != null) && (
          <div className="space-y-1.5 py-2 px-2.5 bg-gray-50 rounded-lg">
            {sens.hunger != null && (
              <SensationBar emoji="😋" label="Faim" value={sens.hunger} max={10} color="#7C3AED" />
            )}
            {sens.satiety != null && (
              <SensationBar emoji="🌿" label="Rassasiement" value={sens.satiety} max={10} color="#10B981" />
            )}
            {sens.pleasure != null && (
              <SensationBar emoji="😊" label="Plaisir" value={sens.pleasure} max={10} color="#F59E0B" />
            )}
          </div>
        )}

        {/* Durée + contexte */}
        {!!(sens?.duration || p.context || p.durationMin) && (
          <div className="flex items-center gap-2 flex-wrap text-[11px] text-gray-500">
            {!!(sens?.duration || p.durationMin) && (
              <span>⏱ {sens?.duration ?? Number(p.durationMin)} min</span>
            )}
            {!!p.context && (
              <span>· {CONTEXT_LABELS[String(p.context)] ?? String(p.context)}</span>
            )}
          </div>
        )}

        {/* Ingesta validés */}
        {canSeeAiMacros && validatedMacros && (
          <div className="rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Ingesta validés</span>
              <span className="text-xs font-bold text-gray-800">{validatedMacros.kcal} kcal</span>
            </div>
            <MacroStackBar
              protein={validatedMacros.proteines_g ?? 0}
              carbs={validatedMacros.glucides_g ?? 0}
              fat={validatedMacros.lipides_g ?? 0}
            />
            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-blue-600 font-semibold">P {validatedMacros.proteines_g}g</span>
              <span className="text-amber-600 font-semibold">G {validatedMacros.glucides_g}g</span>
              <span className="text-red-500 font-semibold">L {validatedMacros.lipides_g}g</span>
              {(validatedMacros.fibres_g ?? 0) > 0 && (
                <span className="text-green-600 font-semibold">F {validatedMacros.fibres_g}g</span>
              )}
            </div>
            {entry.photoMacros?.aliments && entry.photoMacros.aliments.length > 0 && (
              <p className="text-[9px] text-gray-400">
                {entry.photoMacros.aliments.map((a) => `${a.nom} (${a.quantite_g}g)`).join(", ")}
              </p>
            )}
          </div>
        )}

        {/* Macros payload non validées */}
        {canSeeAiMacros && !validatedMacros && payloadMacros && (
          <div className="rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-2 space-y-1.5">
            <span className="text-[10px] font-semibold text-gray-500">Brouillon IA — à valider</span>
            <div className="flex gap-2 flex-wrap text-[10px]">
              {payloadMacros.calories != null && (
                <span className="font-bold text-gray-700">{payloadMacros.calories} kcal</span>
              )}
              {payloadMacros.protein_g != null && <span className="text-blue-600">P {payloadMacros.protein_g}g</span>}
              {payloadMacros.carbs_g != null && <span className="text-amber-600">G {payloadMacros.carbs_g}g</span>}
              {payloadMacros.fat_g != null && <span className="text-red-500">L {payloadMacros.fat_g}g</span>}
            </div>
          </div>
        )}

        {/* Analyse IA à la demande */}
        {canSeeAiMacros && !p.skipped && (
          <NutritionAnalysis
            entryId={entry.id}
            careCaseId={careCaseId}
            existingAnalysis={(p.nutritionAnalysis as NutritionAnalysisResult | undefined) ?? null}
          />
        )}
      </div>
    </div>
  )
}

function MacroStackBar({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const protCal = protein * 4
  const carbsCal = carbs * 4
  const fatCal = fat * 9
  const total = protCal + carbsCal + fatCal || 1
  return (
    <div className="h-2 rounded-full overflow-hidden flex bg-gray-200">
      <div style={{ width: `${(protCal / total) * 100}%` }} className="bg-blue-500 h-full" />
      <div style={{ width: `${(carbsCal / total) * 100}%` }} className="bg-amber-400 h-full" />
      <div style={{ width: `${(fatCal / total) * 100}%` }} className="bg-red-400 h-full" />
    </div>
  )
}

// ─── Emotion card ─────────────────────────────────────────────────────────────

function EmotionCard({ entry }: { entry: JournalEntry }) {
  const p = entry.payload as Record<string, unknown>
  const mood = p.mood as string | undefined
  const emotions = (p.emotions as string[]) ?? (p.emotionType ? [p.emotionType as string] : [])
  const intensity = p.intensity as number | undefined

  if (mood) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
            {MOOD_EMOJI[mood] ?? "🌤"} Météo
          </span>
          <span className="text-xs text-gray-400">{fmtTime(entry.occurredAt)}</span>
        </div>
        <p className="text-sm text-gray-700">{MOOD_LABELS[mood] ?? mood}</p>
        {p.energy != null && (
          <SensationBar emoji="⚡" label="Énergie" value={Number(p.energy)} max={100} color="#7C3AED" />
        )}
        {!!p.note && <p className="text-xs text-gray-600 mt-1">{String(p.note)}</p>}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">💭 Ressentis</span>
        <span className="text-xs text-gray-400">{fmtTime(entry.occurredAt)}</span>
      </div>
      {emotions.length > 0 && (
        <p className="text-sm text-gray-700">{emotions.map((e) => EMOTION_LABELS[e] ?? e).join(", ")}</p>
      )}
      {intensity != null && (
        <SensationBar emoji="💜" label="Intensité" value={intensity} max={10} color="#7C3AED" />
      )}
      {!!p.trigger && (
        <p className="text-[11px] text-gray-500">
          <span className="font-semibold">Déclencheur :</span> {String(p.trigger)}
        </p>
      )}
      {!!p.automaticThought && (
        <p className="text-[11px] text-gray-500 italic">💭 « {String(p.automaticThought)} »</p>
      )}
      {!!p.need && (
        <p className="text-[11px] text-gray-500">
          <span className="font-semibold">Besoin :</span> {String(p.need)}
        </p>
      )}
      {!!p.note && (
        <p className="text-xs text-gray-600">{String(p.note)}</p>
      )}
    </div>
  )
}

// ─── Activity card ────────────────────────────────────────────────────────────

function ActivityCard({ entry, anorexiaSurveillance }: { entry: JournalEntry; anorexiaSurveillance: boolean }) {
  const p = entry.payload as Record<string, unknown>
  const pleasure = Number(p.pleasure ?? 0)
  const duration = Number(p.durationMinutes ?? p.duration ?? 0)
  const actLabel = ACTIVITY_LABELS[String(p.activityType ?? p.activityName ?? "")] ?? String(p.activityType ?? "Activité")

  const pleasureBg = anorexiaSurveillance && pleasure >= 8 && duration > 45
    ? "bg-amber-50 border-amber-200"
    : "bg-white border-gray-100"

  return (
    <div className={`rounded-xl border p-3 shadow-sm space-y-2 ${pleasureBg}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">🏃 Activité physique</span>
        <span className="text-xs text-gray-400">{fmtTime(entry.occurredAt)}</span>
      </div>
      <p className="text-sm font-medium text-gray-700">{actLabel}</p>
      <div className="flex gap-2 flex-wrap">
        {duration > 0 && (
          <div className="bg-green-50 rounded-md px-2 py-1">
            <p className="text-[10px] text-green-600">Durée</p>
            <p className="text-xs font-bold text-green-700">{duration} min</p>
          </div>
        )}
        {pleasure > 0 && (
          <div className={`rounded-md px-2 py-1 ${anorexiaSurveillance && pleasure >= 8 ? "bg-amber-100" : "bg-violet-50"}`}>
            <p className={`text-[10px] ${anorexiaSurveillance && pleasure >= 8 ? "text-amber-600" : "text-violet-600"}`}>Plaisir</p>
            <p className={`text-xs font-bold ${anorexiaSurveillance && pleasure >= 8 ? "text-amber-700" : "text-violet-700"}`}>{pleasure}/10</p>
          </div>
        )}
        {Number(p.pain) > 0 && (
          <div className="bg-red-50 rounded-md px-2 py-1">
            <p className="text-[10px] text-red-600">Douleur</p>
            <p className="text-xs font-bold text-red-700">{Number(p.pain)}/10</p>
          </div>
        )}
      </div>
      {!!p.context && (
        <p className="text-[11px] text-gray-500">{CONTEXT_LABELS[String(p.context)] ?? String(p.context)}</p>
      )}
    </div>
  )
}

// ─── Symptom card ─────────────────────────────────────────────────────────────

function SymptomCard({ entry }: { entry: JournalEntry }) {
  const p = entry.payload as Record<string, unknown>
  const name = String(p.symptomName ?? p.symptomType ?? p.name ?? "Symptôme")
  const intensity = p.intensity != null ? Number(p.intensity) : null

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">🩹 Symptômes</span>
        <span className="text-xs text-gray-400">{fmtTime(entry.occurredAt)}</span>
      </div>
      <p className="text-sm text-gray-700">{name}</p>
      {intensity != null && (
        <SensationBar emoji="🔴" label="Intensité" value={intensity} max={10} color="#EF4444" />
      )}
      {!!p.category && (
        <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
          {String(p.category)}
        </span>
      )}
      {!!p.context && (
        <p className="text-[11px] text-gray-500">{String(p.context)}</p>
      )}
    </div>
  )
}

// ─── Sleep card ───────────────────────────────────────────────────────────────

function SleepCard({ entry }: { entry: JournalEntry }) {
  const p = entry.payload as Record<string, unknown>
  const hours = p.hours ?? p.sleepHours ?? p.duration

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">😴 Sommeil</span>
        <span className="text-xs text-gray-400">{fmtTime(entry.occurredAt)}</span>
      </div>
      {hours != null && (
        <div className="flex items-center justify-between bg-indigo-50 rounded-md px-2.5 py-2">
          <span className="text-[11px] text-indigo-600">Heures de sommeil</span>
          <span className="text-sm font-bold text-indigo-700">{String(hours)}h</span>
        </div>
      )}
      {p.quality != null && (
        <SensationBar emoji="⭐" label="Qualité" value={Number(p.quality)} max={10} color="#6366F1" />
      )}
      {!!p.note && <p className="text-xs text-gray-600">{String(p.note)}</p>}
    </div>
  )
}

// ─── Note / Positive thought card ────────────────────────────────────────────

function NoteCard({ entry }: { entry: JournalEntry }) {
  const p = entry.payload as Record<string, unknown>
  const isPositive = entry.entryType === "POSITIVE_THOUGHT"
  const content = String(p.content ?? p.text ?? "")

  return (
    <div className={`rounded-xl border p-3 shadow-sm ${
      isPositive ? "bg-amber-50 border-amber-100" : "bg-white border-gray-100"
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
          {isPositive ? "✨ Pensée +" : "📝 Note"}
        </span>
        <span className="text-xs text-gray-400">{fmtTime(entry.occurredAt)}</span>
      </div>
      <p className={`text-xs leading-relaxed ${isPositive ? "text-amber-800 italic" : "text-gray-700"}`}>
        {isPositive ? `« ${content} »` : content}
      </p>
      {entry.photoUrl && (
        <img
          src={entry.photoUrl}
          alt="Note"
          className="mt-2 rounded-lg w-full aspect-[4/3] object-cover"
        />
      )}
    </div>
  )
}

// ─── Generic card (fallback) ──────────────────────────────────────────────────

function GenericCard({ entry }: { entry: JournalEntry }) {
  const p = entry.payload as Record<string, unknown>
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
          {entry.entryType.replace(/_/g, " ")}
        </span>
        <span className="text-xs text-gray-400">{fmtTime(entry.occurredAt)}</span>
      </div>
      {!!p.note && <p className="text-xs text-gray-600">{String(p.note)}</p>}
      {!!p.description && <p className="text-xs text-gray-600">{String(p.description)}</p>}
    </div>
  )
}

// ─── Crisis card ──────────────────────────────────────────────────────────────

function CrisisCard({ entry }: { entry: JournalEntry }) {
  const p = entry.payload as Record<string, unknown>
  const outcome = p.outcome as string | undefined
  const label = outcome === "resisted" ? "💪 A tenu" : outcome === "partial" ? "🤝 Limité" : "Crise complète"
  return (
    <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 text-xs space-y-1">
      <div className="flex items-center gap-2">
        <span>🚨</span>
        <Badge className="bg-red-100 text-red-700">{label}</Badge>
        {!!p.duration_minutes && <span className="text-gray-500">{String(p.duration_minutes)} min</span>}
        <span className="text-gray-400 ml-auto">{fmtDate(entry.occurredAt)}</span>
      </div>
      {!!((p.coping_used as string[] | undefined)?.length) && (
        <p className="text-gray-500">Stratégies : {(p.coping_used as string[]).join(", ")}</p>
      )}
    </div>
  )
}

// ─── Overview widgets ─────────────────────────────────────────────────────────

function MealHeatmap({ meals }: { meals: JournalEntry[] }) {
  const types = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"]
  const labels = ["P.déj", "Déj", "Dîner", "Coll"]
  const days: Date[] = []
  for (let i = 6; i >= 0; i--) days.push(subDays(new Date(), i))

  return (
    <div>
      <p className="text-[10px] font-medium text-gray-400 mb-2 uppercase tracking-wider">Heatmap 7 jours</p>
      <div className="grid gap-1" style={{ gridTemplateColumns: "40px repeat(7, 1fr)" }}>
        <div />
        {days.map((d, i) => (
          <p key={i} className="text-[9px] text-gray-400 text-center">
            {format(d, "EEE", { locale: fr })}
          </p>
        ))}
        {types.map((type, ti) => (
          <div key={`row${ti}`} className="contents">
            <p className="text-[9px] text-gray-400 truncate">{labels[ti]}</p>
            {days.map((d, di) => {
              const has = meals.some((m) => isSameDay(parseISO(m.occurredAt), d) && (m.payload as Record<string, unknown>).moment === type)
              const skipped = meals.some((m) => isSameDay(parseISO(m.occurredAt), d) && (m.payload as Record<string, unknown>).moment === type && !!(m.payload as Record<string, unknown>).skipped)
              return <div key={`${ti}-${di}`} className={`w-5 h-5 rounded mx-auto ${skipped ? "bg-red-200" : has ? "bg-emerald-200" : "bg-gray-100"}`} />
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function IngestaTotals({ meals }: { meals: JournalEntry[] }) {
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
    return count > 0
      ? { kcal: Math.round(kcal), proteines: Math.round(proteines), glucides: Math.round(glucides), lipides: Math.round(lipides), fibres: Math.round(fibres), count }
      : null
  }, [meals])

  if (!totals) return null

  return (
    <div className="px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-100">
      <p className="text-[10px] font-semibold text-amber-700 mb-1.5">
        Total ingesta validés ({totals.count} repas analysés)
      </p>
      <div className="flex gap-4 flex-wrap text-xs">
        {[
          { label: "kcal", val: String(totals.kcal) },
          { label: "Prot.", val: `${totals.proteines}g` },
          { label: "Glu.", val: `${totals.glucides}g` },
          { label: "Lip.", val: `${totals.lipides}g` },
          ...(totals.fibres > 0 ? [{ label: "Fibres", val: `${totals.fibres}g` }] : []),
        ].map(({ label, val }) => (
          <div key={label} className="text-center">
            <p className="font-bold text-amber-900">{val}</p>
            <p className="text-[9px] text-amber-600">{label}</p>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-amber-500 mt-1.5">Brouillon IA — validé par le soignant</p>
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

  const dominant = entries
    .filter((e) => !!(e.payload as Record<string, unknown>).mood)
    .reduce((acc, e) => {
      const m = String((e.payload as Record<string, unknown>).mood)
      acc[m] = (acc[m] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  const topMood = Object.entries(dominant).sort((a, b) => b[1] - a[1])[0]

  return (
    <div>
      <p className="text-[10px] font-medium text-gray-400 mb-2 uppercase tracking-wider">Météo 7 jours</p>
      <div className="flex justify-between mb-2">
        {days.map((d, i) => (
          <div key={i} className="text-center">
            <p className="text-lg">{d.emoji}</p>
            <p className="text-[9px] text-gray-400">{d.label}</p>
          </div>
        ))}
      </div>
      {topMood && (
        <p className="text-[10px] text-gray-400">
          Dominante : {MOOD_LABELS[topMood[0]] ?? topMood[0]}
        </p>
      )}
    </div>
  )
}

function EnergyChart({ entries }: { entries: JournalEntry[] }) {
  const data = entries
    .filter((e) => (e.payload as Record<string, unknown>).energy != null)
    .map((e) => ({
      date: format(parseISO(e.occurredAt), "d/MM"),
      energy: Number((e.payload as Record<string, unknown>).energy),
    }))
    .reverse().slice(-14)

  if (data.length < 2) return null
  return (
    <div>
      <p className="text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Courbe d&apos;énergie</p>
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
