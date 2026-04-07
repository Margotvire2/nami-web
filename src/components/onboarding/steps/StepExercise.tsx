"use client"

import { useOnboardingStore } from "@/stores/onboarding.store"
import { useAuthStore } from "@/lib/store"
import { apiWithToken, type OnboardingExerciseInput } from "@/lib/api"
import { useState } from "react"
import { AlertCircle, Info, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const EXERCISE_MODES = [
  {
    id:          "LIBERAL",
    label:       "Libéral",
    description: "Cabinet privé, honoraires libres ou conventionnés",
  },
  {
    id:          "SALARIED",
    label:       "Salarié",
    description: "Hôpital, clinique, structure employeuse",
  },
  {
    id:          "MIXED",
    label:       "Mixte",
    description: "Libéral + activité salariée",
  },
  {
    id:          "HOSPITAL",
    label:       "Hospitalier pur",
    description: "Exclusivement en établissement de santé",
  },
]

const CONVENTION_SECTORS = [
  {
    id:          "SECTOR_1",
    label:       "Secteur 1",
    description: "Honoraires opposables — pas de dépassement",
  },
  {
    id:          "SECTOR_2",
    label:       "Secteur 2",
    description: "Honoraires libres avec tact et mesure",
  },
  {
    id:          "SECTOR_3",
    label:       "Secteur 3",
    description: "Non conventionné",
  },
  {
    id:          "OPTAM",
    label:       "OPTAM / OPTAM-CO",
    description: "Option tarifaire maîtrisée",
  },
]

export function StepExercise() {
  const { data, setData, nextStep, prevStep, markCompleted } = useOnboardingStore()
  const { accessToken } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const requiresSector =
    data.exerciseMode === "LIBERAL" || data.exerciseMode === "MIXED"

  const canNext =
    !!data.exerciseMode &&
    (!requiresSector || !!data.conventionSector)

  const handleNext = async () => {
    if (!canNext) {
      setError("Veuillez compléter les champs obligatoires.")
      return
    }
    if (!accessToken) {
      setError("Session expirée, veuillez vous reconnecter.")
      return
    }

    setError(null)
    setLoading(true)

    try {
      const payload: OnboardingExerciseInput = {
        exerciseMode:     data.exerciseMode!,
        conventionSector: requiresSector ? data.conventionSector : undefined,
        acceptsCMU:       data.acceptsCMU ?? false,
        acceptsALD:       data.acceptsALD ?? false,
        acceptsTele:      data.acceptsTele ?? false,
      }

      await apiWithToken(accessToken).onboarding.saveExercise(payload)
      markCompleted(2)
      nextStep()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur serveur"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-800">
          Mode d&apos;exercice
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Ces informations sont affichées publiquement sur votre profil.
        </p>
      </div>

      {/* Mode d'exercice */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">
          Type d&apos;exercice <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 gap-2">
          {EXERCISE_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setData({ exerciseMode: mode.id })}
              className={cn(
                "flex flex-col items-start p-3 rounded-xl border text-left transition",
                data.exerciseMode === mode.id
                  ? "border-teal-500 bg-teal-50"
                  : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
              )}
            >
              <span className="text-sm font-medium text-neutral-800">
                {mode.label}
              </span>
              <span className="text-xs text-neutral-500 mt-0.5">
                {mode.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Secteur conventionnel — affiché si libéral ou mixte */}
      {/* [LEGAL] Obligation d'affichage du secteur — Art. R4127-53 CSP */}
      {requiresSector && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">
            Secteur de conventionnement <span className="text-red-500">*</span>
          </label>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex gap-2 text-xs text-blue-700">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Le secteur est une information réglementaire que vous êtes tenu
              d&apos;afficher. Toute fausse déclaration engage votre responsabilité.
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {CONVENTION_SECTORS.map((sector) => (
              <button
                key={sector.id}
                type="button"
                onClick={() => setData({ conventionSector: sector.id })}
                className={cn(
                  "flex flex-col items-start p-3 rounded-xl border text-left transition",
                  data.conventionSector === sector.id
                    ? "border-teal-500 bg-teal-50"
                    : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                )}
              >
                <span className="text-sm font-medium text-neutral-800">
                  {sector.label}
                </span>
                <span className="text-xs text-neutral-500 mt-0.5">
                  {sector.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Options complémentaires */}
      {/* [LEGAL] CMU/CSS/ALD — info publique engageante */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">
          Options
        </label>
        <div className="space-y-2">
          {[
            {
              key:   "acceptsCMU" as const,
              label: "Accepte CMU / Complémentaire Santé Solidaire (CSS)",
            },
            {
              key:   "acceptsALD" as const,
              label: "Accepte les patients en ALD (Affection Longue Durée)",
            },
            {
              key:   "acceptsTele" as const,
              label: "Propose la téléconsultation",
            },
          ].map((opt) => (
            <label
              key={opt.key}
              className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition"
            >
              <input
                type="checkbox"
                checked={!!data[opt.key]}
                onChange={(e) => setData({ [opt.key]: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-neutral-700">{opt.label}</span>
            </label>
          ))}
        </div>

        {/* [LEGAL] Téléconsultation — rappel cadre HAS */}
        {data.acceptsTele && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex gap-2 text-xs text-amber-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              La téléconsultation doit respecter le cadre défini par la HAS
              (consentement patient, continuité des soins, compte-rendu).
            </span>
          </div>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={prevStep}
          className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition"
        >
          Retour
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={loading}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2",
            canNext && !loading
              ? "bg-teal-600 text-white hover:bg-teal-700"
              : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
          )}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Enregistrement…" : "Continuer"}
        </button>
      </div>
    </div>
  )
}
