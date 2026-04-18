"use client"

import { useState, useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { apiWithToken, type JournalEntry, type NutritionAnalysisResult } from "@/lib/api"
import { format, parseISO, subDays, isSameDay } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Brain, Activity, Sparkles, AlertTriangle, TrendingUp, TrendingDown, Minus,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { SENSATION_COLORS, MACRO_COLORS, namiPalette } from "@/lib/namiColors"

// ─── Palette ─────────────────────────────────────────────────────────────────
const V  = namiPalette.violet[500]  // violet — données primaires
const T  = namiPalette.teal[500]    // teal — données secondaires
const S  = namiPalette.slate[400]   // ardoise — neutre
const VL = namiPalette.violet[50]   // violet light
const TL = namiPalette.teal[50]     // teal light
const SL = namiPalette.slate[100]   // slate light

// ─── Labels ──────────────────────────────────────────────────────────────────

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
  BREAKFAST: "Petit-déj", LUNCH: "Déjeuner", DINNER: "Dîner", SNACK: "Collation", OTHER: "Repas",
  breakfast: "Petit-déj", lunch: "Déjeuner", dinner: "Dîner", snack: "Collation",
}

const CONTEXT_LABELS: Record<string, string> = {
  alone: "👤 Seul(e)", family: "👥 Famille", friends: "👫 Amis",
  work: "💼 Travail", screen: "📱 Écran", walking: "🚶 Debout",
  restaurant: "🍴 Resto",
}

const PERIODS: Array<{ key: Period; label: string }> = [
  { key: "7d", label: "7 jours" },
  { key: "30d", label: "30 jours" },
  { key: "all", label: "Tout" },
]

// ─── Types ───────────────────────────────────────────────────────────────────

type Period = "7d" | "30d" | "all"

interface Props {
  careCaseId: string
  pathwayName?: string
  currentPhase?: string
  permissions?: { canSeeAiMacros: boolean; canSeeWeight: boolean; canSeeCrisisDetail: boolean }
}

interface DaySlot {
  dateKey: string
  dayName: string    // "Lun."
  dayNumber: string  // "14"
  isToday: boolean
  entries: JournalEntry[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dedup(entries: JournalEntry[]): JournalEntry[] {
  const seen = new Map<string, JournalEntry>()
  for (const e of entries) {
    const t = new Date(e.occurredAt)
    const key = `${e.entryType}_${format(t, "yyyy-MM-dd_HH")}:${Math.floor(t.getMinutes() / 10)}`
    if (!seen.has(key)) seen.set(key, e)
  }
  return Array.from(seen.values())
}

function fmtTime(iso: string) { return format(parseISO(iso), "HH:mm") }
function fmtDate(iso: string) { return format(parseISO(iso), "d MMM", { locale: fr }) }

// Adapter : récupère les données nutritionnelles depuis n'importe quelle source du payload
function getNutritionData(payload: Record<string, unknown>): NutritionAnalysisResult | null {
  if (payload.nutritionAnalysis) return payload.nutritionAnalysis as NutritionAnalysisResult
  const ing = payload.ingesta ?? payload.ingestaAnalysis
  if (ing && typeof ing === "object") {
    const i = ing as Record<string, unknown>
    return {
      total: {
        kcal: Number(i.energy ?? i.calories ?? 0),
        protein: Number(i.protein ?? i.proteins ?? 0),
        carbs: Number(i.carbs ?? i.glucides ?? 0),
        fat: Number(i.fat ?? i.lipides ?? 0),
        fiber: Number(i.fiber ?? i.fibres ?? 0),
      },
      items: (i.items as NutritionAnalysisResult["items"]) ?? [],
      confidence: "medium",
    }
  }
  return null
}

// ─── Composants partagés ─────────────────────────────────────────────────────

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${className}`}>{children}</span>
}

// Barre ultra-compacte pour colonnes 160px
function MicroBar({ label, value, max, color, bgColor }: {
  label: string; value: number; max: number; color: string; bgColor: string
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="flex items-center gap-1">
      <span className="text-[9px] text-slate-500 w-9 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: bgColor }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[9px] font-semibold w-4 text-right shrink-0" style={{ color }}>{value}</span>
    </div>
  )
}

// Barre empilée macros (palette harmonisée)
function MacroBar({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const pCal = protein * 4, cCal = carbs * 4, fCal = fat * 9
  const total = pCal + cCal + fCal || 1
  return (
    <div className="h-1.5 rounded-full overflow-hidden flex" style={{ backgroundColor: namiPalette.slate[200] }}>
      <div style={{ width: `${(pCal / total) * 100}%`, backgroundColor: MACRO_COLORS.protein }} className="h-full" />
      <div style={{ width: `${(cCal / total) * 100}%`, backgroundColor: MACRO_COLORS.carbs }} className="h-full" />
      <div style={{ width: `${(fCal / total) * 100}%`, backgroundColor: MACRO_COLORS.fat }} className="h-full" />
    </div>
  )
}

// Analyse nutritionnelle IA inline compacte
function CompactNutritionInline({ analysis }: { analysis: NutritionAnalysisResult }) {
  const { total } = analysis
  return (
    <div className="rounded px-1.5 py-1 space-y-1" style={{ backgroundColor: SL }}>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-medium text-slate-500">🤖 IA</span>
        <span className="text-[10px] font-bold text-slate-700">{Math.round(total.kcal)} kcal</span>
      </div>
      <MacroBar protein={total.protein} carbs={total.carbs} fat={total.fat} />
      <div className="flex gap-1.5 text-[8px]">
        <span style={{ color: MACRO_COLORS.protein }}>P{Math.round(total.protein)}g</span>
        <span style={{ color: namiPalette.teal[600] }}>G{Math.round(total.carbs)}g</span>
        <span style={{ color: namiPalette.slate[500] }}>L{Math.round(total.fat)}g</span>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, sub, trend, alert, onClick }: {
  icon: React.ReactNode; title: string; value: string; sub?: string
  trend?: "up" | "down" | "stable"; alert?: boolean; onClick?: () => void
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  return (
    <button onClick={onClick} className={`flex-1 min-w-[140px] rounded-xl border p-4 text-left transition-all hover:shadow-sm ${alert ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"}`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-[11px] font-medium text-gray-500">{title}</span></div>
      <p className={`text-2xl font-bold ${alert ? "text-amber-700" : "text-gray-900"}`}>{value}</p>
      <div className="flex items-center gap-1 mt-1">
        {sub && <span className="text-[10px] text-gray-400">{sub}</span>}
        {trend && <TrendIcon size={12} className={trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-gray-400"} />}
      </div>
    </button>
  )
}

// ─── CompactMealCard ─────────────────────────────────────────────────────────

function CompactMealCard({ entry, careCaseId, canSeeAiMacros }: {
  entry: JournalEntry; careCaseId: string; canSeeAiMacros: boolean
}) {
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => api.journal.analyzeNutrition(entry.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal", careCaseId] }),
  })

  const p = entry.payload as Record<string, unknown>
  const sens = p.sensations as Record<string, number> | undefined
  const hunger  = sens?.hunger  ?? (p.hungerBefore  != null ? Number(p.hungerBefore)  : null)
  const satiety = sens?.satiety ?? (p.satietyAfter   != null ? Number(p.satietyAfter)  : null)
  const pleasure = sens?.pleasure ?? (p.pleasure     != null ? Number(p.pleasure)      : null)
  const mealLabel = MEAL_LABELS[String(p.moment ?? p.mealType ?? p.type ?? "")] ?? "Repas"
  const photoUrl = entry.photoUrl ?? String(p.photoUri ?? "")

  // Nutrition : photoMacros validés → payload adapté → null
  const validatedMacros = entry.photoMacros?.macros
  const nutritionData = !validatedMacros ? getNutritionData(p) : null

  return (
    <div className="bg-white rounded-lg border border-slate-100 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-50">
        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">🍽 {mealLabel}</span>
        <span className="text-[10px] text-slate-400 tabular-nums">{fmtTime(entry.occurredAt)}</span>
      </div>

      {/* Photo pleine largeur */}
      {!!photoUrl && (
        <div className="relative w-full aspect-[4/3] bg-slate-100">
          <img src={photoUrl} alt={mealLabel} loading="lazy" className="w-full h-full object-cover" />
          {entry.photoValidated && (
            <span className="absolute top-1.5 right-1.5 text-[8px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white">
              ✓ Analysé
            </span>
          )}
          {!entry.photoValidated && entry.photoAnalyzed && (
            <span className="absolute top-1.5 right-1.5 text-[8px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
              En attente
            </span>
          )}
        </div>
      )}

      <div className="px-2 py-1.5 space-y-1.5">
        {/* Description (tronquée à 3 lignes) */}
        {!!p.description && (
          <p className="text-[10px] text-slate-600 leading-snug line-clamp-3">{String(p.description)}</p>
        )}

        {/* Sensations micro-barres — palette harmonisée */}
        {(hunger != null || satiety != null || pleasure != null) && (
          <div className="space-y-1 py-1.5 px-1.5 rounded-md" style={{ backgroundColor: namiPalette.slate[50] }}>
            {hunger != null && (
              <MicroBar label="Faim" value={hunger} max={10}
                color={SENSATION_COLORS.hunger.bar} bgColor={SENSATION_COLORS.hunger.bg} />
            )}
            {satiety != null && (
              <MicroBar label="Rass." value={satiety} max={10}
                color={SENSATION_COLORS.satiety.bar} bgColor={SENSATION_COLORS.satiety.bg} />
            )}
            {pleasure != null && (
              <MicroBar label="Plaisir" value={pleasure} max={10}
                color={SENSATION_COLORS.pleasure.bar} bgColor={SENSATION_COLORS.pleasure.bg} />
            )}
          </div>
        )}

        {/* Durée + contexte */}
        {!!(p.context || p.durationMin || sens?.duration) && (
          <div className="flex items-center gap-1 flex-wrap text-[9px] text-slate-400">
            {!!(p.durationMin || sens?.duration) && (
              <span>⏱ {sens?.duration ?? Number(p.durationMin)}min</span>
            )}
            {!!p.context && (
              <span>{CONTEXT_LABELS[String(p.context)] ?? String(p.context)}</span>
            )}
          </div>
        )}

        {/* Ingesta validés (photo analysée) */}
        {canSeeAiMacros && validatedMacros && (
          <div className="rounded-md px-1.5 py-1 space-y-1" style={{ backgroundColor: SL }}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-medium text-slate-500">📷 Validé</span>
              <span className="text-[10px] font-bold text-slate-700">{validatedMacros.kcal} kcal</span>
            </div>
            <MacroBar protein={validatedMacros.proteines_g ?? 0} carbs={validatedMacros.glucides_g ?? 0} fat={validatedMacros.lipides_g ?? 0} />
            <div className="flex gap-1.5 text-[8px]">
              <span style={{ color: MACRO_COLORS.protein }}>P{validatedMacros.proteines_g}g</span>
              <span style={{ color: namiPalette.teal[600] }}>G{validatedMacros.glucides_g}g</span>
              <span style={{ color: namiPalette.slate[500] }}>L{validatedMacros.lipides_g}g</span>
            </div>
          </div>
        )}

        {/* Analyse IA (depuis payload ou on-demand) */}
        {canSeeAiMacros && !validatedMacros && (
          nutritionData
            ? <CompactNutritionInline analysis={nutritionData} />
            : !p.skipped && (
              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                className="w-full text-center py-1 rounded border border-dashed text-[9px] font-medium transition disabled:opacity-50"
                style={{ borderColor: namiPalette.violet[200], color: V }}
              >
                {mutation.isPending
                  ? <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin" />Analyse…</span>
                  : "🤖 Analyser"}
              </button>
            )
        )}
      </div>
    </div>
  )
}

// ─── CompactNoteCard ─────────────────────────────────────────────────────────

function CompactNoteCard({ entry }: { entry: JournalEntry }) {
  const p = entry.payload as Record<string, unknown>
  const isPositive = entry.entryType === "POSITIVE_THOUGHT"
  const content = String(p.content ?? p.text ?? p.note ?? "")
  if (!content) return null
  return (
    <div
      className="rounded-lg p-2 text-[10px] leading-snug italic"
      style={{
        backgroundColor: isPositive ? TL : SL,
        color: isPositive ? namiPalette.teal[700] : namiPalette.slate[600],
      }}
    >
      {isPositive ? `✨ « ${content} »` : `📝 ${content}`}
    </div>
  )
}

// ─── DayColumn ───────────────────────────────────────────────────────────────

function DayColumn({ slot, careCaseId, canSeeAiMacros, anorexiaSurveillance, canSeeCrisisDetail }: {
  slot: DaySlot
  careCaseId: string
  canSeeAiMacros: boolean
  anorexiaSurveillance: boolean
  canSeeCrisisDetail: boolean
}) {
  const { dateKey, dayName, dayNumber, isToday, entries } = slot
  const p = (e: JournalEntry) => e.payload as Record<string, unknown>

  const meals      = entries.filter(e => e.entryType === "MEAL")
  const emotions   = entries.filter(e => e.entryType === "EMOTION")
  const activities = entries.filter(e => e.entryType === "PHYSICAL_ACTIVITY")
  const symptoms   = entries.filter(e => e.entryType === "SYMPTOM")
  const positives  = entries.filter(e => e.entryType === "POSITIVE_THOUGHT")
  const notes      = entries.filter(e => e.entryType === "NOTE")
  const crises     = entries.filter(e => e.entryType === "CRISIS_EVENT")

  // Agrégations pour le résumé
  const moodEntry    = emotions.find(e => !!(p(e).mood))
  const mood         = moodEntry ? String(p(moodEntry).mood) : null
  const moodEnergy   = moodEntry && p(moodEntry).energy != null ? Number(p(moodEntry).energy) : null

  const emotionNames = emotions
    .filter(e => !p(e).mood)
    .flatMap(e => {
      const arr = p(e).emotions as string[] | undefined
      if (arr?.length) return arr
      if (p(e).emotionType) return [String(p(e).emotionType)]
      return []
    })
    .map(s => EMOTION_LABELS[s] ?? s)

  const totalMin = activities.reduce((s, e) =>
    s + (Number(p(e).durationMinutes ?? p(e).duration ?? 0)), 0)
  const actTypes = [...new Set(activities.map(e =>
    ACTIVITY_LABELS[String(p(e).activityType ?? p(e).activityName ?? "")] ?? "Activité"))]

  const symptomNames = symptoms.map(e =>
    String(p(e).symptomName ?? p(e).symptomType ?? p(e).name ?? "Symptôme"))

  const isEmpty = entries.length === 0

  return (
    <div className="flex flex-col min-h-0">
      {/* ── En-tête du jour ── */}
      <div
        className="text-center py-2 mb-1.5 rounded-lg sticky top-0 z-10"
        style={{
          backgroundColor: isToday ? VL : "white",
          borderBottom: `1px solid ${isToday ? namiPalette.violet[200] : namiPalette.slate[200]}`,
        }}
      >
        <p className="text-[10px] font-medium" style={{ color: isToday ? V : namiPalette.slate[500] }}>
          {dayName}
        </p>
        <p className="text-base font-bold" style={{ color: isToday ? V : namiPalette.slate[700] }}>
          {dayNumber}
        </p>
        {entries.length > 0 && (
          <p className="text-[9px]" style={{ color: namiPalette.slate[400] }}>
            {entries.length} entrée{entries.length > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {isEmpty ? (
        <p className="text-[10px] text-center py-6" style={{ color: namiPalette.slate[300] }}>—</p>
      ) : (
        <>
          {/* ── Résumé agrégé ── */}
          <div className="space-y-0.5 mb-2 px-0.5">
            {/* Météo */}
            {mood && (
              <div className="flex items-center gap-1 text-[10px]" style={{ color: namiPalette.slate[500] }}>
                <span>{MOOD_EMOJI[mood] ?? "🌤"}</span>
                <span className="truncate">{MOOD_LABELS[mood]?.replace(/^[^ ]+ /, "") ?? mood}</span>
                {moodEnergy != null && (
                  <span className="ml-auto text-[9px] font-semibold shrink-0" style={{ color: V }}>
                    ⚡{moodEnergy}%
                  </span>
                )}
              </div>
            )}

            {/* Émotions agrégées */}
            {emotionNames.length > 0 && (
              <div className="text-[10px] truncate" style={{ color: namiPalette.slate[500] }}>
                💭 {emotionNames.slice(0, 3).join(", ")}
                {emotionNames.length > 3 && ` +${emotionNames.length - 3}`}
              </div>
            )}

            {/* Activité agrégée */}
            {totalMin > 0 && (
              <div
                className="text-[10px] truncate"
                style={{ color: anorexiaSurveillance && totalMin > 420 ? "#D97706" : namiPalette.slate[500] }}
              >
                🏃 {totalMin} min{actTypes.length > 0 ? ` · ${actTypes.join(", ")}` : ""}
              </div>
            )}

            {/* Symptômes */}
            {symptomNames.length > 0 && (
              <div className="text-[10px] truncate" style={{ color: namiPalette.slate[500] }}>
                🩹 {symptomNames.join(", ")}
              </div>
            )}

            {/* Pensées + */}
            {positives.length > 0 && (
              <div className="text-[10px]" style={{ color: namiPalette.teal[600] }}>
                ✨ {positives.length} pensée{positives.length > 1 ? "s" : ""} +
              </div>
            )}

            {/* Crises */}
            {canSeeCrisisDetail && crises.length > 0 && (
              <div className="text-[10px] font-semibold text-red-600">
                🚨 {crises.length} crise{crises.length > 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* ── Séparateur (si repas ou notes) ── */}
          {(meals.length > 0 || notes.length > 0) && (
            <div className="h-px mx-0.5 mb-2" style={{ backgroundColor: namiPalette.slate[100] }} />
          )}

          {/* ── Corps : repas + notes uniquement ── */}
          <div className="space-y-2 flex-1 overflow-y-auto">
            {meals.map(entry => (
              <CompactMealCard
                key={entry.id}
                entry={entry}
                careCaseId={careCaseId}
                canSeeAiMacros={canSeeAiMacros}
              />
            ))}
            {notes.map(entry => (
              <CompactNoteCard key={entry.id} entry={entry} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Alert banner ─────────────────────────────────────────────────────────────

function AlertBanner({ energyEntries, activities, anorexiaSurveillance, avgPleasure, totalActivityMin }: {
  energyEntries: JournalEntry[]; activities: JournalEntry[]
  anorexiaSurveillance: boolean; avgPleasure: number | null; totalActivityMin: number
}) {
  const alerts: string[] = []
  const lastEnergy = energyEntries.slice(0, 3)
  if (lastEnergy.length >= 3 && lastEnergy.every(e => Number((e.payload as Record<string, unknown>).energy) < 40)) {
    alerts.push("Énergie en baisse — 3 derniers check-ins < 40%")
  }
  if (anorexiaSurveillance && totalActivityMin > 420) alerts.push("Activité physique élevée — à évaluer")
  if (anorexiaSurveillance && avgPleasure === 0 && totalActivityMin > 60) alerts.push("Activité sans plaisir — à évaluer")
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

// ─── CrisisCard ───────────────────────────────────────────────────────────────

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

// ─── Composant principal ──────────────────────────────────────────────────────

export function PatientJournalView({ careCaseId, pathwayName, currentPhase, permissions }: Props) {
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const [period, setPeriod] = useState<Period>("7d")
  const [overviewWeekOffset, setOverviewWeekOffset] = useState(0)

  const { data: entries, isLoading } = useQuery({
    queryKey: ["journal", careCaseId],
    queryFn: () => api.journal.list(careCaseId),
  })

  const canSeeAiMacros    = permissions?.canSeeAiMacros ?? true
  const canSeeCrisisDetail = permissions?.canSeeCrisisDetail ?? false

  const isAnorexia      = pathwayName?.toLowerCase().includes("anorex") ?? false
  const isRestrictedPhase = ["evaluation", "stabilization", "weight_recovery"].includes(currentPhase ?? "")
  const anorexiaSurveillance = isAnorexia && isRestrictedPhase

  const filtered = useMemo(() => {
    if (!entries) return []
    const now = new Date()
    const f = entries.filter(e => {
      const d = parseISO(e.occurredAt)
      if (period === "7d")  return d >= subDays(now, 7)
      if (period === "30d") return d >= subDays(now, 30)
      return true
    }).sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    return dedup(f)
  }, [entries, period])

  // ── Vue d'ensemble — navigation semaine ───────────────────────────────────
  const overviewWeek = useMemo(() => {
    const today = new Date()
    const daysToMonday = today.getDay() === 0 ? 6 : today.getDay() - 1
    const startOfCurrentWeek = subDays(today, daysToMonday)
    const weekStart = subDays(startOfCurrentWeek, overviewWeekOffset * 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      return d
    })
  }, [overviewWeekOffset])

  const overviewWeekLabel = useMemo(() => {
    const start = overviewWeek[0]
    const end = overviewWeek[6]
    return `${format(start, "d", { locale: fr })} – ${format(end, "d MMMM", { locale: fr })}`
  }, [overviewWeek])

  const weekEntries = useMemo(() => {
    if (!entries) return []
    const start = overviewWeek[0]
    const end = new Date(overviewWeek[6])
    end.setHours(23, 59, 59, 999)
    return dedup(entries.filter(e => {
      const d = parseISO(e.occurredAt)
      return d >= start && d <= end
    }))
  }, [entries, overviewWeek])

  // ── Stats ──────────────────────────────────────────────────────────────────
  const meals      = filtered.filter(e => e.entryType === "MEAL")
  const emotions   = filtered.filter(e => e.entryType === "EMOTION")
  const activities = filtered.filter(e => e.entryType === "PHYSICAL_ACTIVITY")
  const crises     = filtered.filter(e => e.entryType === "CRISIS_EVENT")

  const energyEntries = emotions.filter(e => (e.payload as Record<string, unknown>).energy != null)
  const avgEnergy = energyEntries.length > 0
    ? Math.round(energyEntries.reduce((s, e) => s + Number((e.payload as Record<string, unknown>).energy), 0) / energyEntries.length)
    : null

  const totalActivityMin = activities.reduce((s, a) =>
    s + (Number((a.payload as Record<string, unknown>).durationMinutes) || 0), 0)
  const avgPleasure = activities.length > 0
    ? Math.round(activities.reduce((s, a) => s + (Number((a.payload as Record<string, unknown>).pleasure) || 0), 0) / activities.length * 10) / 10
    : null
  const painCount = activities.filter(a => Number((a.payload as Record<string, unknown>).pain) > 3).length

  // ── 7 colonnes fixes (7d) ou colonnes par jours avec entrées (30d/all) ────
  const sevenDaySlots = useMemo((): DaySlot[] => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(today, 6 - i)
      const dateKey = format(d, "yyyy-MM-dd")
      const rawDay = format(d, "EEE", { locale: fr })
      const dayName = rawDay.charAt(0).toUpperCase() + rawDay.slice(1) + "."
      return {
        dateKey,
        dayName,
        dayNumber: format(d, "d"),
        isToday: isSameDay(d, today),
        entries: filtered
          .filter(e => format(parseISO(e.occurredAt), "yyyy-MM-dd") === dateKey)
          .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)),
      }
    })
  }, [filtered])

  const multiDaySlots = useMemo((): DaySlot[] => {
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
        const rawDay = format(d, "EEE", { locale: fr })
        return {
          dateKey,
          dayName: rawDay.charAt(0).toUpperCase() + rawDay.slice(1) + ".",
          dayNumber: format(d, "d MMM", { locale: fr }),
          isToday: isSameDay(d, new Date()),
          entries: [...dayEntries].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)),
        }
      })
  }, [filtered])

  const slots = period === "7d" ? sevenDaySlots : multiDaySlots

  if (isLoading) return (
    <div className="p-6 space-y-3">
      <Skeleton className="h-10 w-48" />
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
        {Array.from({ length: 7 }, (_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
      </div>
    </div>
  )

  return (
    <div className="p-4 space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">
          Journal <span className="text-gray-400 font-normal">({filtered.length})</span>
        </h2>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`text-[10px] font-medium px-2.5 py-1 rounded-md transition-colors ${
                period === p.key ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
              }`}
            >
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
          {/* ── Stats row ── */}
          <div className="flex gap-3 flex-wrap">
            <StatCard
              icon={<Brain size={14} style={{ color: V }} />}
              title="Énergie"
              value={avgEnergy != null ? `${avgEnergy}%` : "—"}
              sub={energyEntries.length > 0 ? `${energyEntries.length} check-ins` : "Pas de données"}
              trend={avgEnergy != null ? (avgEnergy > 60 ? "up" : avgEnergy < 40 ? "down" : "stable") : undefined}
            />
            <StatCard
              icon={<span className="text-sm">🍽</span>}
              title="Repas enregistrés"
              value={String(meals.length)}
              sub={period === "7d" ? "cette semaine" : "sur la période"}
            />
            {!anorexiaSurveillance ? (
              <StatCard
                icon={<Activity size={14} style={{ color: T }} />}
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

          {/* ── Alert banner ── */}
          <AlertBanner
            energyEntries={energyEntries}
            activities={activities}
            anorexiaSurveillance={anorexiaSurveillance}
            avgPleasure={avgPleasure}
            totalActivityMin={totalActivityMin}
          />

          {/* ── Crises globales (si canSeeCrisisDetail) ── */}
          {crises.length > 0 && canSeeCrisisDetail && (
            <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
              <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-2">
                Événements de crise ({crises.length})
              </p>
              <div className="space-y-2">
                {crises.map(c => <CrisisCard key={c.id} entry={c} />)}
              </div>
            </div>
          )}

          {/* ── Vue d'ensemble — 3 widgets avec navigation semaine ── */}
          {entries && entries.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Vue d&apos;ensemble</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOverviewWeekOffset(prev => prev + 1)}
                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition text-sm"
                  >
                    ‹
                  </button>
                  <span className="text-[12px] font-medium text-slate-600 min-w-[120px] text-center">
                    {overviewWeekLabel}
                  </span>
                  <button
                    onClick={() => setOverviewWeekOffset(prev => Math.max(0, prev - 1))}
                    disabled={overviewWeekOffset === 0}
                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition text-sm disabled:opacity-30"
                  >
                    ›
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <OverviewMoodEnergy weekDays={overviewWeek} weekEntries={weekEntries} />
                <OverviewEmotions weekEntries={weekEntries} />
                <OverviewActivity weekDays={overviewWeek} weekEntries={weekEntries} anorexiaSurveillance={anorexiaSurveillance} />
              </div>
            </div>
          )}

          {/* ── Grille 7 colonnes (7d) ou scroll (30d/all) ── */}
          {period === "7d" ? (
            <div
              className="overflow-x-auto"
              style={{ margin: "0 -4px", padding: "0 4px" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  gap: "6px",
                  minWidth: "min(100%, 700px)",
                }}
              >
                {slots.map(slot => (
                  <DayColumn
                    key={slot.dateKey}
                    slot={slot}
                    careCaseId={careCaseId}
                    canSeeAiMacros={canSeeAiMacros}
                    anorexiaSurveillance={anorexiaSurveillance}
                    canSeeCrisisDetail={canSeeCrisisDetail}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ margin: "0 -4px", padding: "0 4px 8px" }}>
              {slots.map(slot => (
                <div key={slot.dateKey} className="shrink-0 w-[180px]">
                  <DayColumn
                    slot={slot}
                    careCaseId={careCaseId}
                    canSeeAiMacros={canSeeAiMacros}
                    anorexiaSurveillance={anorexiaSurveillance}
                    canSeeCrisisDetail={canSeeCrisisDetail}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Overview widgets ─────────────────────────────────────────────────────────

function OverviewMoodEnergy({ weekDays, weekEntries }: {
  weekDays: Date[]; weekEntries: JournalEntry[]
}) {
  const emotions = weekEntries.filter(e => e.entryType === "EMOTION")

  const dayMoods = weekDays.map(d => {
    const entry = emotions.find(e =>
      isSameDay(parseISO(e.occurredAt), d) &&
      !!(e.payload as Record<string, unknown>).mood
    )
    if (!entry) {
      // fallback: premier check-in énergie du jour
      const energyEntry = emotions.find(e => isSameDay(parseISO(e.occurredAt), d))
      return {
        mood: null,
        energy: energyEntry && (energyEntry.payload as Record<string, unknown>).energy != null
          ? Number((energyEntry.payload as Record<string, unknown>).energy)
          : null,
      }
    }
    const p = entry.payload as Record<string, unknown>
    return {
      mood: String(p.mood),
      energy: p.energy != null ? Number(p.energy) : null,
    }
  })

  const energyValues = dayMoods.filter(d => d.energy != null).map(d => d.energy!)
  const avgEnergy = energyValues.length > 0
    ? Math.round(energyValues.reduce((a, b) => a + b, 0) / energyValues.length)
    : null

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${namiPalette.violet[400]}, ${namiPalette.violet[500]})` }} />
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Humeur & énergie
      </p>
      <div className="flex justify-between gap-0.5">
        {weekDays.map((d, i) => {
          const { mood, energy } = dayMoods[i]
          const rawDay = format(d, "EEE", { locale: fr })
          const dayLabel = rawDay.charAt(0).toUpperCase() + rawDay.slice(1, 3)
          return (
            <div key={i} className="text-center flex-1">
              <p className="text-[10px] font-medium text-slate-400 mb-1">{dayLabel}</p>
              <p className="text-lg h-7 flex items-center justify-center">
                {mood ? (MOOD_EMOJI[mood] ?? "·") : <span className="text-slate-300 text-sm">·</span>}
              </p>
              <div className="w-full h-[3px] rounded-full mt-1" style={{ backgroundColor: VL }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${energy ?? 0}%`, backgroundColor: V }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="h-px bg-slate-100 my-3" />
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold" style={{ color: avgEnergy != null && avgEnergy < 40 ? V : namiPalette.slate[700] }}>
          {avgEnergy != null ? `${avgEnergy}%` : "—"}
        </span>
        <span className="text-xs text-slate-500">énergie moy.</span>
      </div>
      <p className="text-[11px] text-slate-400 mt-1">
        {energyValues.length} check-in{energyValues.length > 1 ? "s" : ""} cette semaine
      </p>
    </div>
  )
}

function OverviewEmotions({ weekEntries }: { weekEntries: JournalEntry[] }) {
  const emotions = weekEntries.filter(e => e.entryType === "EMOTION")

  const aggregated = useMemo(() => {
    const map = new Map<string, { count: number; totalIntensity: number }>()
    for (const e of emotions) {
      const p = e.payload as Record<string, unknown>
      const names = (p.emotions as string[] | undefined) ??
        (p.emotionType ? [String(p.emotionType)] : [])
      const intensity = p.intensity != null ? Number(p.intensity) : 5
      for (const name of names) {
        const existing = map.get(name) ?? { count: 0, totalIntensity: 0 }
        existing.count++
        existing.totalIntensity += intensity
        map.set(name, existing)
      }
    }
    const POSITIVE = new Set(["JOY", "joy", "PRIDE", "pride", "SERENITY", "serenity", "calm", "energetic"])
    return Array.from(map.entries())
      .map(([rawName, data]) => ({
        name: EMOTION_LABELS[rawName] ?? rawName,
        rawName,
        count: data.count,
        avgIntensity: Math.round(data.totalIntensity / data.count),
        isPositive: POSITIVE.has(rawName),
      }))
      .sort((a, b) => b.count - a.count)
  }, [emotions])

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${V}, ${T})` }} />
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Émotions de la semaine
      </p>
      {aggregated.length === 0 ? (
        <p className="text-xs text-slate-300 italic py-4">Aucune émotion enregistrée</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {aggregated.map(em => (
              <span
                key={em.rawName}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                style={{
                  backgroundColor: em.isPositive ? TL : VL,
                  color: em.isPositive ? namiPalette.teal[700] : namiPalette.violet[700],
                }}
              >
                {em.name}
                <span className="text-[9px] font-bold px-1.5 py-0 rounded-full"
                  style={{ backgroundColor: "rgba(0,0,0,0.08)" }}>
                  {em.count}
                </span>
              </span>
            ))}
          </div>
          <div className="h-px bg-slate-100 my-2" />
          <div className="space-y-1.5">
            {aggregated.slice(0, 4).map(em => {
              const pct = (em.avgIntensity / 10) * 100
              const barColor = em.isPositive ? T : V
              const bgColor  = em.isPositive ? TL : VL
              return (
                <div key={em.rawName} className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-slate-500 w-14 truncate">{em.name}</span>
                  <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ backgroundColor: bgColor }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                  </div>
                  <span className="text-[10px] font-bold w-4 text-right" style={{ color: barColor }}>
                    {em.avgIntensity}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function OverviewActivity({ weekDays, weekEntries, anorexiaSurveillance }: {
  weekDays: Date[]; weekEntries: JournalEntry[]; anorexiaSurveillance: boolean
}) {
  const activities = weekEntries.filter(e => e.entryType === "PHYSICAL_ACTIVITY")

  const dayData = weekDays.map(d => {
    const dayActs = activities.filter(a => isSameDay(parseISO(a.occurredAt), d))
    const totalMin = dayActs.reduce((s, a) => {
      const p = a.payload as Record<string, unknown>
      return s + (Number(p.durationMinutes ?? p.duration ?? 0))
    }, 0)
    const pleasures = dayActs
      .map(a => Number((a.payload as Record<string, unknown>).pleasure ?? 0))
      .filter(p => p > 0)
    const avgPleasure = pleasures.length > 0
      ? Math.round(pleasures.reduce((a, b) => a + b, 0) / pleasures.length)
      : 0
    return { totalMin, avgPleasure }
  })

  const totalMin = dayData.reduce((s, d) => s + d.totalMin, 0)
  const maxMin   = Math.max(...dayData.map(d => d.totalMin), 1)
  const allPleasures = dayData.filter(d => d.avgPleasure > 0).map(d => d.avgPleasure)
  const avgPleasure  = allPleasures.length > 0
    ? Math.round(allPleasures.reduce((a, b) => a + b, 0) / allPleasures.length * 10) / 10
    : null

  const isWarning = anorexiaSurveillance &&
    (totalMin > 420 || (avgPleasure != null && avgPleasure < 3 && totalMin > 60))

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${namiPalette.teal[400]}, ${namiPalette.teal[600]})` }} />
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Activité physique
      </p>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-2xl font-bold ${isWarning ? "text-amber-600" : ""}`}
          style={!isWarning ? { color: namiPalette.slate[700] } : undefined}>
          {totalMin}
        </span>
        <span className="text-xs text-slate-500">min cette semaine</span>
      </div>
      {/* Bargramme durée (ardoise) + plaisir (teal) empilés */}
      <div className="flex items-end gap-1 h-14 mt-3 mb-1.5">
        {dayData.map((d, i) => {
          const totalH = Math.round((d.totalMin / maxMin) * 48)
          const pleasureH = d.avgPleasure > 0 ? Math.round((d.avgPleasure / 10) * totalH) : 0
          const durationH = totalH - pleasureH
          return (
            <div key={i} className="flex-1 flex flex-col items-stretch justify-end" style={{ height: "100%" }}>
              <div style={{ flex: 1 }} />
              {durationH > 0 && (
                <div style={{ height: `${durationH}px`, backgroundColor: namiPalette.slate[300] }} />
              )}
              {pleasureH > 0 && (
                <div style={{ height: `${pleasureH}px`, backgroundColor: T, borderRadius: "3px 3px 0 0" }} />
              )}
              {totalH === 0 && (
                <div style={{ height: "2px", backgroundColor: namiPalette.slate[200] }} />
              )}
            </div>
          )
        })}
      </div>
      {/* Labels jours */}
      <div className="flex justify-between">
        {weekDays.map((d, i) => {
          const rawDay = format(d, "EEE", { locale: fr })
          return (
            <div key={i} className="flex-1 text-center">
              <span className="text-[9px] text-slate-400 font-medium">
                {rawDay.charAt(0).toUpperCase() + rawDay.slice(1, 3)}
              </span>
            </div>
          )
        })}
      </div>
      {/* Légende */}
      <div className="flex gap-3 mt-2">
        <span className="flex items-center gap-1 text-[10px] text-slate-500">
          <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: T }} /> Plaisir
        </span>
        <span className="flex items-center gap-1 text-[10px] text-slate-500">
          <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: namiPalette.slate[300] }} /> Durée
        </span>
      </div>
      {avgPleasure != null && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <p className={`text-[11px] ${isWarning ? "text-amber-600 font-medium" : "text-slate-500"}`}>
            {isWarning ? "⚠ " : ""}
            Plaisir moy. {avgPleasure}/10
            {isWarning && " — à évaluer"}
          </p>
        </div>
      )}
    </div>
  )
}
