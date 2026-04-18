"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { apiWithToken, type NutritionAnalysisResult } from "@/lib/api"

interface Props {
  entryId: string
  careCaseId: string
  existingAnalysis?: NutritionAnalysisResult | null
}

const CONFIDENCE_LABELS = {
  high: { label: "Confiance élevée", className: "bg-emerald-100 text-emerald-700" },
  medium: { label: "Estimation moyenne", className: "bg-amber-100 text-amber-700" },
  low: { label: "Estimation approximative", className: "bg-red-100 text-red-700" },
}

function MacroBar({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const protCal = protein * 4
  const carbCal = carbs * 4
  const fatCal = fat * 9
  const total = protCal + carbCal + fatCal || 1
  const pProt = Math.round((protCal / total) * 100)
  const pCarb = Math.round((carbCal / total) * 100)
  const pFat = 100 - pProt - pCarb

  return (
    <div className="flex rounded-full overflow-hidden h-2 w-full mt-1 mb-2">
      <div style={{ width: `${pProt}%`, backgroundColor: "#7C3AED" }} title={`Protéines ${pProt}%`} />
      <div style={{ width: `${pCarb}%`, backgroundColor: "#14B8A6" }} title={`Glucides ${pCarb}%`} />
      <div style={{ width: `${Math.max(0, pFat)}%`, backgroundColor: "#94A3B8" }} title={`Lipides ${pFat}%`} />
    </div>
  )
}

export function NutritionAnalysis({ entryId, careCaseId, existingAnalysis }: Props) {
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const qc = useQueryClient()
  const [showItems, setShowItems] = useState(false)
  const [analysis, setAnalysis] = useState<NutritionAnalysisResult | null>(existingAnalysis ?? null)

  const mutation = useMutation({
    mutationFn: () => api.journal.analyzeNutrition(entryId),
    onSuccess: (result) => {
      setAnalysis(result)
      qc.invalidateQueries({ queryKey: ["journal", careCaseId] })
    },
  })

  if (!analysis) {
    return (
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-violet-600 hover:bg-violet-50 border border-violet-200 rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-60"
      >
        {mutation.isPending ? (
          <>
            <span className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            Analyse en cours…
          </>
        ) : (
          <>
            <span>🤖</span>
            Analyser les macros
          </>
        )}
      </button>
    )
  }

  const { total, items, confidence, notes } = analysis
  const confBadge = CONFIDENCE_LABELS[confidence] ?? CONFIDENCE_LABELS.medium
  const totalCal = total.protein * 4 + total.carbs * 4 + total.fat * 9 || 1
  const pProt = Math.round((total.protein * 4 / totalCal) * 100)
  const pCarb = Math.round((total.carbs * 4 / totalCal) * 100)
  const pFat = 100 - pProt - pCarb

  return (
    <div className="mt-1.5 rounded-lg border border-violet-100 bg-violet-50 p-2.5 text-[10px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-semibold text-violet-700 uppercase tracking-wider">🤖 Analyse nutritionnelle</span>
        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${confBadge.className}`}>{confBadge.label}</span>
      </div>

      {/* Calories */}
      <p className="text-lg font-bold text-violet-900 leading-none">{Math.round(total.kcal)} kcal</p>

      {/* Barre empilée macros */}
      <MacroBar protein={total.protein} carbs={total.carbs} fat={total.fat} />

      {/* Détail macros */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#7C3AED" }} />
          <span className="text-muted-foreground">Protéines</span>
          <span className="font-semibold ml-auto">{Math.round(total.protein)}g <span className="text-muted-foreground font-normal">({pProt}%)</span></span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#14B8A6" }} />
          <span className="text-muted-foreground">Glucides</span>
          <span className="font-semibold ml-auto">{Math.round(total.carbs)}g <span className="text-muted-foreground font-normal">({pCarb}%)</span></span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#94A3B8" }} />
          <span className="text-muted-foreground">Lipides</span>
          <span className="font-semibold ml-auto">{Math.round(total.fat)}g <span className="text-muted-foreground font-normal">({Math.max(0, pFat)}%)</span></span>
        </div>
        {total.fiber > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#5EEAD4" }} />
            <span className="text-muted-foreground">Fibres</span>
            <span className="font-semibold ml-auto">{Math.round(total.fiber)}g</span>
          </div>
        )}
      </div>

      {/* Liste aliments (pliable) */}
      {items && items.length > 0 && (
        <div className="mt-1.5">
          <button
            onClick={() => setShowItems(!showItems)}
            className="text-[9px] text-violet-600 hover:underline"
          >
            {showItems ? "Masquer" : `Voir les ${items.length} aliments`}
          </button>
          {showItems && (
            <ul className="mt-1 space-y-0.5">
              {items.map((item, i) => (
                <li key={i} className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate">{item.name} <span className="text-[9px]">{item.quantity}</span></span>
                  <span className="font-medium shrink-0">{Math.round(item.kcal)} kcal</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Note IA */}
      {notes && <p className="mt-1.5 text-[9px] text-muted-foreground italic">{notes}</p>}

      {/* Re-analyser */}
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="mt-1.5 text-[9px] text-violet-500 hover:underline disabled:opacity-50"
      >
        {mutation.isPending ? "Analyse en cours…" : "Ré-analyser"}
      </button>
    </div>
  )
}
