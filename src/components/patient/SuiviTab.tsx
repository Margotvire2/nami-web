"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { apiWithToken } from "@/lib/api"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceArea } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Pencil, FileText, Scale, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react"
import { getMetricRange, getValueColor, getQuestionnaireScoring, calculateTDEE } from "@/lib/metricRanges"
import { ALL_BIO_KEYS } from "@/lib/metricCatalog"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

// ─── Types ──────────────────────────────────────────────────────────────────

interface Props {
  careCaseId: string
  pathwayKey: string
  personId?: string
  patient: { firstName: string; lastName: string; birthDate: string | null; sex?: string }
  height: number | null
  napValue: number | null
  napDescription: string | null
}

interface ObsRecord {
  metricKey: string; label: string;
  value: number | string | boolean | null;
  valueNumeric?: number | null;
  unit: string | null; effectiveAt: string; domain: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function numVal(o: ObsRecord | undefined): number | null {
  if (!o) return null
  if (o.valueNumeric != null) return o.valueNumeric
  if (typeof o.value === "number") return o.value
  if (typeof o.value === "string") { const n = parseFloat(o.value); return isNaN(n) ? null : n }
  return null
}

function calcAge(birthDate: string | null): number | null {
  if (!birthDate) return null
  return Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 3600000))
}

function getBMILabel(bmi: number, pw: string): { label: string; color: string } {
  if (pw.includes("anorex") || pw.includes("tca")) {
    if (bmi < 13) return { label: "Dénutrition extrême", color: "red" }
    if (bmi < 15) return { label: "Dénutrition sévère", color: "red" }
    if (bmi < 16) return { label: "Dénutrition modérée", color: "orange" }
    if (bmi < 17.5) return { label: "Maigreur", color: "orange" }
    if (bmi < 18.5) return { label: "Insuffisance pondérale", color: "yellow" }
    return { label: "Poids normal", color: "green" }
  }
  if (pw.includes("obes")) {
    if (bmi >= 40) return { label: "Obésité morbide", color: "red" }
    if (bmi >= 35) return { label: "Obésité sévère", color: "red" }
    if (bmi >= 30) return { label: "Obésité modérée", color: "orange" }
    if (bmi >= 25) return { label: "Surpoids", color: "yellow" }
    return { label: "Poids normal", color: "green" }
  }
  if (bmi < 18.5) return { label: "Insuffisance pondérale", color: "orange" }
  if (bmi < 25) return { label: "Poids normal", color: "green" }
  if (bmi < 30) return { label: "Surpoids", color: "yellow" }
  return { label: "Obésité", color: "red" }
}

const COLOR_MAP: Record<string, string> = {
  red: "text-red-600 bg-red-50 border-red-200",
  orange: "text-orange-600 bg-orange-50 border-orange-200",
  yellow: "text-amber-600 bg-amber-50 border-amber-200",
  green: "text-emerald-600 bg-emerald-50 border-emerald-200",
  gray: "text-gray-500 bg-gray-50 border-gray-200",
}

const NAP_OPTIONS = [
  { value: 1.2, label: "1.2 — Alité / immobilisé" },
  { value: 1.3, label: "1.3 — Sédentaire strict" },
  { value: 1.4, label: "1.4 — Sédentaire avec activité légère" },
  { value: 1.5, label: "1.5 — Activité légère (1-2x/sem)" },
  { value: 1.6, label: "1.6 — Activité modérée (3-4x/sem)" },
  { value: 1.7, label: "1.7 — Actif (5+/sem)" },
  { value: 1.8, label: "1.8 — Très actif (sport quotidien)" },
]

const QUESTIONNAIRE_CONFIG: Record<string, string[]> = {
  "tca.anorexia": ["eat26_score", "phq9_score", "gad7_score"],
  "tca.bulimia": ["eat26_score", "phq9_score", "gad7_score"],
  "tca": ["eat26_score", "phq9_score", "gad7_score"],
  "obesity": ["phq9_score"],
  default: ["phq9_score"],
}

const QUESTIONNAIRE_LABELS: Record<string, { name: string; maxScore: number; code: string }> = {
  phq9_score: { name: "PHQ-9", maxScore: 27, code: "phq9" },
  gad7_score: { name: "GAD-7", maxScore: 21, code: "gad7" },
  eat26_score: { name: "EAT-26", maxScore: 78, code: "eat26" },
}

// ─── Component ──────────────────────────────────────────────────────────────

export function SuiviTab({ careCaseId, pathwayKey, personId, patient, height, napValue, napDescription }: Props) {
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const qc = useQueryClient()
  const [editDialog, setEditDialog] = useState(false)
  const [weightDialog, setWeightDialog] = useState(false)
  const [newWeight, setNewWeight] = useState("")
  // Edit patient data form
  const [editBirthDate, setEditBirthDate] = useState(patient.birthDate ? patient.birthDate.split("T")[0] : "")
  const [editSex, setEditSex] = useState(patient.sex ?? "FEMALE")
  const [editHeight, setEditHeight] = useState(String(height ?? ""))
  const [editNap, setEditNap] = useState(napValue ?? 1.4)
  const [editNapDesc, setEditNapDesc] = useState(napDescription ?? "")
  const [editWeight, setEditWeight] = useState("")

  const age = calcAge(patient.birthDate)
  const sex = (patient.sex ?? "FEMALE") as "MALE" | "FEMALE"

  // Fetch latest observations
  const { data: latestObs, isLoading } = useQuery({
    queryKey: ["observations-latest", careCaseId],
    queryFn: () => api.observations.latest(careCaseId),
    enabled: !!accessToken,
  })

  // Fetch trajectory for weight chart
  const { data: trajectoryData } = useQuery({
    queryKey: ["trajectory", careCaseId, ["weight_kg"], "90d"],
    queryFn: () => api.trajectory.get(careCaseId, ["weight_kg", "heart_rate_bpm"], "90d"),
    enabled: !!accessToken,
  })

  // Mutations
  const weightMutation = useMutation({
    mutationFn: () => {
      const val = parseFloat(newWeight.replace(",", "."))
      if (isNaN(val)) throw new Error("Poids invalide")
      return api.observations.create(careCaseId, [{ metricKey: "weight_kg", valueNumeric: val, effectiveAt: new Date().toISOString() }])
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["observations-latest"] })
      qc.invalidateQueries({ queryKey: ["trajectory"] })
      setWeightDialog(false)
      setNewWeight("")
      toast.success("Pesée enregistrée")
    },
  })

  const editMutation = useMutation({
    mutationFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

      // 1. Update care case (height, NAP)
      await api.careCases.update(careCaseId, {
        height: editHeight ? parseFloat(editHeight) : undefined,
        napValue: editNap,
        napDescription: editNapDesc || undefined,
      } as Record<string, unknown>)

      // 2. Update person (birthDate, sex)
      if (personId && (editBirthDate || editSex)) {
        const personRes = await fetch(`${API}/persons/${personId}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(editBirthDate ? { birthDate: editBirthDate + "T00:00:00.000Z" } : {}),
            ...(editSex ? { sex: editSex } : {}),
          }),
        })
        if (!personRes.ok) {
          console.error("[SAVE] PATCH persons error:", personRes.status, await personRes.text())
        }
      }

      // 3. Save weight if changed
      const w = parseFloat(editWeight.replace(",", "."))
      if (!isNaN(w) && w > 0) {
        await api.observations.create(careCaseId, [{ metricKey: "weight_kg", valueNumeric: w, effectiveAt: new Date().toISOString() }])
      }
    },
    onSuccess: () => {
      // Invalidate all relevant queries to refresh data
      qc.invalidateQueries({ queryKey: ["care-case"] })
      qc.invalidateQueries({ queryKey: ["observations-latest"] })
      qc.invalidateQueries({ queryKey: ["trajectory"] })
      qc.invalidateQueries({ queryKey: ["care-cases"] })
      setEditDialog(false)
      toast.success("Données mises à jour")
    },
  })

  // Derive key values
  const obs = useMemo(() => {
    const map = new Map<string, ObsRecord>()
    if (latestObs) {
      // Handle both array and { latest: Record<key, obs[]> } formats
      const raw = latestObs as unknown
      const entries: ObsRecord[] = Array.isArray(raw)
        ? raw
        : typeof raw === "object" && raw !== null && "latest" in (raw as Record<string, unknown>)
          ? Object.values((raw as { latest: Record<string, ObsRecord[]> }).latest).flat()
          : []
      for (const o of entries) {
        if (o.metricKey && !map.has(o.metricKey)) map.set(o.metricKey, o)
      }
    }
    return map
  }, [latestObs])

  const currentWeight = numVal(obs.get("weight_kg"))
  const currentBMI = currentWeight && height ? currentWeight / ((height / 100) ** 2) : null
  const currentFC = numVal(obs.get("heart_rate_bpm"))

  // Weight chart data
  const weightSeries = trajectoryData?.series?.find((s: { metricKey: string }) => s.metricKey === "weight_kg")
  const weightChartData = weightSeries?.dataPoints?.map((p: { date: string; value: number }) => ({
    date: format(parseISO(p.date), "d/MM"),
    poids: p.value,
  })) ?? []

  // Target weight for anorexia
  const isAnorexia = pathwayKey.includes("anorex") || pathwayKey.includes("tca")
  const isObesity = pathwayKey.includes("obes")
  const targetBMI = isAnorexia ? (age && age < 18 ? 17.5 : 18.5) : null
  const targetWeight = targetBMI && height ? Math.round(targetBMI * (height / 100) ** 2 * 10) / 10 : null
  const firstWeight = weightSeries?.dataPoints?.[0]?.value ?? currentWeight
  const progression = targetWeight && firstWeight && currentWeight
    ? Math.min(100, Math.max(0, Math.round(((currentWeight - firstWeight) / (targetWeight - firstWeight)) * 100)))
    : null

  // Besoins
  const tdee = currentWeight && height && age && napValue
    ? calculateTDEE(currentWeight, height, age, sex, napValue)
    : null

  // BMI label
  const bmiInfo = currentBMI ? getBMILabel(currentBMI, pathwayKey) : null

  // Questionnaires
  const qKeys = QUESTIONNAIRE_CONFIG[pathwayKey] ?? QUESTIONNAIRE_CONFIG[pathwayKey.split(".").slice(0, 2).join(".")] ?? QUESTIONNAIRE_CONFIG[pathwayKey.split(".")[0]] ?? QUESTIONNAIRE_CONFIG.default

  if (isLoading) return <div className="p-6 space-y-4"><Skeleton className="h-32" /><Skeleton className="h-40" /><Skeleton className="h-32" /></div>

  return (
    <div className="p-6 max-w-4xl space-y-5">
      {/* ── SECTION 1 — Synthèse rapide ── */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">📊 Synthèse clinique</h3>
          <Button size="sm" variant="outline" className="text-[10px] h-6 gap-1" onClick={() => setEditDialog(true)}><Pencil size={10} /> Modifier</Button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5 text-sm">
            <p className="font-medium">
              {patient.firstName} {patient.lastName}
              <span className="text-muted-foreground font-normal"> · {age ? `${age} ans` : "Âge inconnu"} · {sex === "FEMALE" ? "F" : "M"} · {height ? `${height} cm` : "Taille ?"}</span>
            </p>
            {currentWeight && currentBMI && bmiInfo && (
              <p>
                Poids : <span className="font-semibold">{currentWeight} kg</span> · IMC : <span className="font-semibold">{currentBMI.toFixed(1)}</span>
                <span className={`ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${COLOR_MAP[bmiInfo.color]}`}>{bmiInfo.label}</span>
              </p>
            )}
            <p className="text-muted-foreground text-xs flex items-center gap-1">
              NAP : {napValue ?? "?"} — {napDescription ?? "Non renseigné"}
              <button onClick={() => setEditDialog(true)} className="text-primary hover:underline ml-1"><Pencil size={10} /></button>
            </p>
            {tdee && <p className="text-xs text-muted-foreground">Besoins estimés : <span className="font-medium text-foreground">{tdee} kcal/jour</span></p>}
            {!tdee && <p className="text-[10px] text-amber-600 flex items-center gap-1"><AlertTriangle size={10} /> Données insuffisantes pour calculer les besoins</p>}
          </div>
          {/* Delta */}
          <DeltaCard obs={obs} pathwayKey={pathwayKey} sex={sex} age={age ?? 0} height={height ?? undefined} />
        </div>
      </div>

      {/* ── SECTION 2 — Bilan biologique ── */}
      <BioSection obs={obs} pathwayKey={pathwayKey} />

      {/* ── SECTION 3 — Suivi pondéral ── */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Scale size={14} /> Suivi pondéral</h3>
          <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setWeightDialog(true)}>Saisir une pesée</Button>
        </div>

        {currentWeight && currentBMI && (
          <div className="space-y-2 text-sm mb-3">
            <p>Poids actuel : <span className="font-semibold">{currentWeight} kg</span> ({obs.get("weight_kg")?.effectiveAt ? format(parseISO(obs.get("weight_kg")!.effectiveAt), "d MMM", { locale: fr }) : ""})</p>
            {bmiInfo && <p>IMC : <span className="font-semibold">{currentBMI.toFixed(1)}</span> <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${COLOR_MAP[bmiInfo.color]}`}>{bmiInfo.label}</span></p>}
            {targetWeight && (
              <>
                <p className="text-xs text-muted-foreground">Objectif : IMC ≥ {targetBMI} → ~{targetWeight} kg</p>
                {progression !== null && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${progression >= 80 ? "bg-emerald-500" : progression >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${progression}%` }} />
                    </div>
                    <span className="text-xs font-medium">{progression}%</span>
                  </div>
                )}
              </>
            )}
            {currentFC && (
              <p className="text-xs">FC repos : <span className="font-semibold">{currentFC} bpm</span>
                {currentFC < 45 && <span className="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-red-50 text-red-600 border-red-200">Bradycardie sévère</span>}
                {currentFC >= 45 && currentFC < 55 && <span className="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-orange-50 text-orange-600 border-orange-200">Limite basse</span>}
                {currentFC >= 55 && currentFC < 100 && <span className="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-emerald-50 text-emerald-600 border-emerald-200">Normal</span>}
              </p>
            )}
          </div>
        )}

        {/* Mini chart */}
        {weightChartData.length >= 3 && (
          <div className="h-[140px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightChartData}>
                <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 9 }} width={35} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                {targetWeight && <ReferenceArea y1={targetWeight} y2={targetWeight + 20} fill="#10B981" fillOpacity={0.08} />}
                <Line type="monotone" dataKey="poids" stroke="#4F46E5" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── SECTION 4 — Questionnaires ── */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">📋 Questionnaires</h3>
        <div className="space-y-3">
          {qKeys.map((key) => {
            const o = obs.get(key)
            const cfg = QUESTIONNAIRE_LABELS[key]
            const val = numVal(o)
            if (val == null || !cfg) return null
            const scoring = getQuestionnaireScoring(cfg.code, val)
            return (
              <div key={key} className="flex items-center gap-3 text-sm">
                <span className="font-semibold w-16">{cfg.name}</span>
                <span className="font-bold">{val}/{cfg.maxScore}</span>
                {scoring && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${scoring.colorClass}`}>{scoring.label}</span>}
                <span className="text-xs text-muted-foreground ml-auto">{o?.effectiveAt ? format(parseISO(o.effectiveAt), "d MMM yyyy", { locale: fr }) : ""}</span>
              </div>
            )
          })}
          {qKeys.every((k) => numVal(obs.get(k)) == null) && (
            <p className="text-xs text-muted-foreground">Aucun questionnaire complété.</p>
          )}
        </div>
      </div>

      {/* ── Dialogs ── */}
      <Dialog open={weightDialog} onOpenChange={setWeightDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Saisir une pesée</DialogTitle></DialogHeader>
          <Input type="number" step="0.1" placeholder="Poids en kg" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} autoFocus />
          <Button onClick={() => weightMutation.mutate()} disabled={!newWeight || weightMutation.isPending}>
            {weightMutation.isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Données du patient</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Date de naissance</label>
              <Input type="date" value={editBirthDate} onChange={(e) => setEditBirthDate(e.target.value)} className="h-8 text-xs mt-1" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Sexe</label>
              <select className="w-full border rounded-md p-2 text-xs mt-1" value={editSex} onChange={(e) => setEditSex(e.target.value)}>
                <option value="FEMALE">Féminin</option>
                <option value="MALE">Masculin</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Taille (cm)</label>
              <Input type="number" value={editHeight} onChange={(e) => setEditHeight(e.target.value)} placeholder="165" className="h-8 text-xs mt-1" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Poids actuel (kg)</label>
              <Input type="number" step="0.1" value={editWeight} onChange={(e) => setEditWeight(e.target.value)} placeholder={currentWeight ? String(currentWeight) : "42.0"} className="h-8 text-xs mt-1" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">NAP — Niveau d&apos;activité physique</label>
              <select className="w-full border rounded-md p-2 text-xs mt-1" value={editNap} onChange={(e) => setEditNap(parseFloat(e.target.value))}>
                {NAP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Description activité</label>
              <Input value={editNapDesc} onChange={(e) => setEditNapDesc(e.target.value)} placeholder="Lycéenne, transports en commun..." className="h-8 text-xs mt-1" />
            </div>
          </div>
          <Button onClick={() => editMutation.mutate()} disabled={editMutation.isPending} className="mt-2">
            {editMutation.isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function DeltaCard({ obs, pathwayKey, sex, age, height }: {
  obs: Map<string, ObsRecord>; pathwayKey: string; sex: string; age: number; height?: number
}) {
  const keys = ["weight_kg", "heart_rate_bpm", "potassium_mmol", "phosphore_mmol", "phq9_score", "eat26_score"]
  const deltas = keys.map((k) => {
    const o = obs.get(k)
    const v = numVal(o)
    if (v == null) return null
    const range = getMetricRange(k, pathwayKey, { sex: sex as "MALE" | "FEMALE", age, height, currentWeight: v })
    const color = getValueColor(v, range)
    return { key: k, label: o!.label, value: v, unit: o!.unit, color }
  }).filter(Boolean)

  if (deltas.length === 0) return null

  return (
    <div className="space-y-1">
      <p className="text-[10px] font-medium text-muted-foreground">DERNIÈRES VALEURS</p>
      {deltas.map((d) => d && (
        <div key={d.key} className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${d.color === "green" ? "bg-emerald-500" : d.color === "orange" ? "bg-amber-500" : d.color === "red" ? "bg-red-500" : "bg-gray-300"}`} />
          <span className="text-muted-foreground w-24 truncate">{d.label}</span>
          <span className="font-semibold">{d.value} {d.unit ?? ""}</span>
        </div>
      ))}
    </div>
  )
}

function BioSection({ obs, pathwayKey }: { obs: Map<string, ObsRecord>; pathwayKey: string }) {
  // Priority keys per pathway (shown first)
  const priorityKeys = pathwayKey.includes("anorex") || pathwayKey.includes("tca")
    ? ["potassium_mmol", "phosphorus_mmol", "albumin_g_l", "hemoglobin_g_dl", "calcium_mmol", "magnesium_mmol"]
    : pathwayKey.includes("obes")
      ? ["hba1c_percent", "fasting_glycemia_mmol", "total_cholesterol_mmol", "ldl_mmol", "hdl_mmol", "triglycerides_mmol"]
      : []

  // Collect ALL bio observations (from catalog or bio_ prefix)

  const allBio: ObsRecord[] = []
  obs.forEach((o, key) => {
    if (ALL_BIO_KEYS.has(key) || key.startsWith("bio_")) {
      allBio.push(o)
    }
  })

  if (allBio.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">🧪 Dernier bilan biologique</h3>
        <p className="text-xs text-muted-foreground">Aucun bilan biologique importé. Importez un PDF via l&apos;onglet Documents.</p>
      </div>
    )
  }

  // Sort: priority keys first, then alphabetical
  const prioritySet = new Set(priorityKeys)
  allBio.sort((a, b) => {
    const aP = prioritySet.has(a.metricKey) ? 0 : 1
    const bP = prioritySet.has(b.metricKey) ? 0 : 1
    if (aP !== bP) return aP - bP
    return (a.label ?? a.metricKey).localeCompare(b.label ?? b.metricKey)
  })

  const latestDate = allBio.reduce((max, v) => v.effectiveAt > max ? v.effectiveAt : max, "")

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">🧪 Dernier bilan biologique</h3>
        <span className="text-[10px] text-muted-foreground">
          {latestDate ? format(parseISO(latestDate), "d MMMM yyyy", { locale: fr }) : ""}
          {" · "}{allBio.length} valeurs
        </span>
      </div>
      <div className="grid md:grid-cols-2 gap-x-6 gap-y-1.5">
        {allBio.map((o) => {
          const bv = numVal(o)
          if (bv == null) return null
          const range = getMetricRange(o.metricKey, pathwayKey, { sex: "FEMALE", age: 16 })
          const color = getValueColor(bv, range)
          const rangeLabel = range?.green ? `(${range.green.min}–${range.green.max})` : ""
          return (
            <div key={o.metricKey} className="flex items-center gap-2 text-sm py-0.5">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${color === "green" ? "bg-emerald-500" : color === "orange" ? "bg-amber-500" : color === "red" ? "bg-red-500" : "bg-gray-300"}`} />
              <span className="text-muted-foreground truncate flex-1">{o.label}</span>
              <span className="font-semibold whitespace-nowrap">{bv} {o.unit ?? ""}</span>
              {color !== "gray" && (
                <span className={`text-[9px] font-medium px-1 py-0.5 rounded ${COLOR_MAP[color]}`}>
                  {color === "green" ? "N" : color === "orange" ? "⚠" : "‼"} {rangeLabel}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
