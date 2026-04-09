"use client"

import { useState } from "react"
import { useOnboardingStore } from "@/stores/onboarding.store"
import { useAuthStore } from "@/lib/store"
import { apiWithToken } from "@/lib/api"
import { Info, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const CONSULTATION_MODES = [
  { id: "IN_PERSON",        label: "Présentiel",        description: "Consultation au cabinet ou en structure" },
  { id: "TELECONSULTATION", label: "Téléconsultation",  description: "Vidéo — cadre HAS obligatoire" },
  { id: "HOME_VISIT",       label: "Visite à domicile", description: "Déplacement chez le patient" },
]

const PATIENT_TYPES = [
  { id: "adult",      label: "Adultes" },
  { id: "child",      label: "Enfants (< 12 ans)" },
  { id: "adolescent", label: "Adolescents (12-18 ans)" },
  { id: "elderly",    label: "Personnes âgées" },
  { id: "pregnant",   label: "Femmes enceintes" },
  { id: "perinatal",  label: "Périnatalité" },
  { id: "disability", label: "Situations de handicap" },
  { id: "precarity",  label: "Grande précarité" },
  { id: "athlete",    label: "Sportifs" },
]

const DELAY_OPTIONS = [
  { id: "WITHIN_WEEK",  label: "Sous une semaine" },
  { id: "WITHIN_MONTH", label: "Sous un mois" },
  { id: "OVER_MONTH",   label: "Plus d'un mois" },
]

export function StepConsultation() {
  const { data, updateData, nextStep, prevStep, markCompleted } = useOnboardingStore()
  const { accessToken } = useAuthStore()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const hasTeleconsult = data.consultationModes?.includes("TELECONSULTATION")

  const validate = () => {
    const e: Record<string, string> = {}
    if (!data.consultationModes?.length) e.consultationModes = "Sélectionnez au moins un mode"
    if (!data.acceptedPatientTypes?.length) e.acceptedPatientTypes = "Sélectionnez au moins un type de patient"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const toggle = (key: "consultationModes" | "acceptedPatientTypes", id: string) => {
    const current = (data[key] as string[]) || []
    updateData({
      [key]: current.includes(id) ? current.filter(v => v !== id) : [...current, id],
    })
  }

  const handleNext = async () => {
    if (!validate()) return
    if (!accessToken) { setErrors({ form: "Session expirée." }); return }

    setLoading(true)
    try {
      await apiWithToken(accessToken).onboarding.saveConsultation({
        consultationModes:    data.consultationModes!,
        acceptedPatientTypes: data.acceptedPatientTypes!,
        acceptingNewPatients: data.acceptingNewPatients ?? true,
        newPatientDelay:      data.newPatientDelay,
      })
      markCompleted(4)
      nextStep()
    } catch (err: unknown) {
      setErrors({ form: err instanceof Error ? err.message : "Erreur serveur" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-neutral-800">Modalités de consultation</h2>
        <p className="text-sm text-neutral-500 mt-1">Ces informations guident les adressages des confrères</p>
      </div>

      {/* Modes — multi-select, pas de "Hybride" */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-700">
          Mode(s) de consultation <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-neutral-400">Sélectionnez tous ceux que vous pratiquez.</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {CONSULTATION_MODES.map(mode => {
            const isSelected = data.consultationModes?.includes(mode.id)
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => toggle("consultationModes", mode.id)}
                className={cn(
                  "text-left p-4 rounded-xl border-2 transition-all",
                  isSelected ? "border-teal-500 bg-teal-50" : "border-neutral-200 hover:border-neutral-300 bg-white"
                )}
              >
                <p className="font-medium text-sm text-neutral-800">{mode.label}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{mode.description}</p>
              </button>
            )
          })}
        </div>

        {hasTeleconsult && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              La téléconsultation doit respecter le cadre défini par la HAS 
              (consentement patient, continuité des soins, compte-rendu au médecin traitant).
            </p>
          </div>
        )}
        {errors.consultationModes && (
          <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.consultationModes}</p>
        )}
      </div>

      {/* Types de patients — labels français */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-700">
          Patientèle acceptée <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {PATIENT_TYPES.map(type => {
            const isSelected = data.acceptedPatientTypes?.includes(type.id)
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => toggle("acceptedPatientTypes", type.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm border transition-all",
                  isSelected ? "bg-teal-500 text-white border-teal-500" : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
                )}
              >
                {type.label}
              </button>
            )
          })}
        </div>
        {errors.acceptedPatientTypes && (
          <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.acceptedPatientTypes}</p>
        )}
      </div>

      {/* Nouveaux patients */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-700">Nouveaux patients</label>
        <label className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-50">
          <div>
            <p className="text-sm font-medium text-neutral-700">J&apos;accepte de nouveaux patients</p>
            <p className="text-xs text-neutral-400 mt-0.5">Visible sur votre fiche et pour les adressages</p>
          </div>
          <input
            type="checkbox"
            checked={data.acceptingNewPatients !== false}
            onChange={(e) => updateData({ acceptingNewPatients: e.target.checked })}
            className="rounded border-neutral-300 text-teal-500"
          />
        </label>

        {data.acceptingNewPatients !== false && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-600">Délai pour un nouveau patient</label>
            <div className="grid grid-cols-3 gap-2">
              {DELAY_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateData({ newPatientDelay: opt.id })}
                  className={cn(
                    "p-3 rounded-xl border-2 text-xs transition-all",
                    data.newPatientDelay === opt.id
                      ? "border-teal-500 bg-teal-50 font-medium text-teal-700"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {errors.form && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" /> {errors.form}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button type="button" onClick={prevStep}
          className="flex-1 py-3 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
          Retour
        </button>
        <button type="button" onClick={handleNext} disabled={loading}
          className="flex-1 py-3 rounded-xl bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Enregistrement…" : "Continuer"}
        </button>
      </div>
    </div>
  )
}
