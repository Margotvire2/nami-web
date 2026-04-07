"use client"

import { useState } from "react"
import { useOnboardingStore } from "@/stores/onboarding.store"
import { useAuthStore } from "@/lib/store"
import { apiWithToken } from "@/lib/api"
import { Info, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const LANGUAGES = [
  { id: "fr", label: "Français" },
  { id: "en", label: "Anglais" },
  { id: "es", label: "Espagnol" },
  { id: "ar", label: "Arabe" },
  { id: "pt", label: "Portugais" },
  { id: "de", label: "Allemand" },
  { id: "it", label: "Italien" },
  { id: "ru", label: "Russe" },
  { id: "zh", label: "Mandarin" },
  { id: "wo", label: "Wolof" },
  { id: "am", label: "Amazigh" },
  { id: "tr", label: "Turc" },
]

// [LEGAL] RGPD Art.5 — minimisation et transparence
// Valeurs alignées sur l'enum ProfileVisibility du backend
const VISIBILITY_OPTIONS = [
  {
    id:          "ALL",
    label:       "Profil public",
    description: "Visible par tous les professionnels inscrits sur la plateforme",
    icon:        "\uD83C\uDF10",
  },
  {
    id:          "VERIFIED_ONLY",
    label:       "Professionnels vérifiés uniquement",
    description: "Visible uniquement par les profils ayant un RPPS validé",
    icon:        "\uD83C\uDFE5",
  },
  {
    id:          "PRIVATE",
    label:       "Profil privé",
    description: "Non visible — vous initiez les contacts vous-même",
    icon:        "\uD83D\uDD12",
  },
]

// [LEGAL] Adressage ne peut être conditionné à une contrepartie (Art. R4127-23 CSP)
// Valeurs alignées sur l'enum AddressingScope du backend
const ADDRESSING_SCOPE_OPTIONS = [
  {
    id:          "LOCAL",
    label:       "Local",
    description: "Adressages dans votre secteur géographique proche",
  },
  {
    id:          "REGIONAL",
    label:       "Régional",
    description: "Adressages à l'échelle de votre région",
  },
  {
    id:          "NATIONAL",
    label:       "National",
    description: "Adressages sur toute la France",
  },
]

export function StepNetwork() {
  const { data, updateData, nextStep, prevStep, markCompleted } = useOnboardingStore()
  const { accessToken } = useAuthStore()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const toggle = (key: "spokenLanguages", id: string) => {
    const current = (data[key] as string[]) || []
    updateData({
      [key]: current.includes(id)
        ? current.filter((v) => v !== id)
        : [...current, id],
    })
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!data.profileVisibility) e.profileVisibility = "Choisissez un niveau de visibilité"
    if (!data.addressingScope) e.addressingScope = "Choisissez vos préférences d'adressage"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = async () => {
    if (!validate()) return
    if (!accessToken) {
      setErrors({ form: "Session expirée, veuillez vous reconnecter." })
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await apiWithToken(accessToken).onboarding.saveNetwork({
        spokenLanguages:   data.spokenLanguages ?? [],
        geographicZones:   data.geographicZones ?? [],
        profileVisibility: data.profileVisibility!,
        addressingScope:   data.addressingScope!,
      })
      markCompleted(6)
      nextStep()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur serveur"
      setErrors({ form: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-neutral-800">
          Réseau & Visibilité
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Contrôlez qui peut vous voir et vous adresser des patients
        </p>
      </div>

      {/* [LEGAL] Info RGPD */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          Ces paramètres sont modifiables à tout moment depuis vos réglages.
          Conformément au RGPD, vous pouvez demander la suppression de votre
          profil à tout moment.
        </p>
      </div>

      {/* Langues */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-700">
          Langues parlées
        </label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => {
            const isSelected = data.spokenLanguages?.includes(lang.id)
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => toggle("spokenLanguages", lang.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border transition-all",
                  isSelected
                    ? "bg-teal-500 text-white border-teal-500"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
                )}
              >
                {lang.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Zones géographiques */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">
          Zones géographiques
          <span className="text-neutral-400 font-normal ml-2">(optionnel)</span>
        </label>
        <input
          type="text"
          value={(data.geographicZones || []).join(", ")}
          onChange={(e) =>
            updateData({
              geographicZones: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          placeholder="Ex: Paris 11e, Paris 20e, Montreuil..."
          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
        />
        <p className="text-xs text-neutral-400">Séparez par des virgules</p>
      </div>

      {/* Visibilité */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-700">
          Visibilité du profil <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {VISIBILITY_OPTIONS.map((opt) => {
            const isSelected = data.profileVisibility === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateData({ profileVisibility: opt.id })}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3",
                  isSelected
                    ? "border-teal-500 bg-teal-50"
                    : "border-neutral-200 hover:border-neutral-300 bg-white"
                )}
              >
                <span className="text-lg">{opt.icon}</span>
                <div>
                  <p className="font-medium text-sm text-neutral-800">{opt.label}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{opt.description}</p>
                </div>
              </button>
            )
          })}
        </div>
        {errors.profileVisibility && (
          <p className="text-xs text-red-500">{errors.profileVisibility}</p>
        )}
      </div>

      {/* Scope d'adressage */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-700">
          Qui peut m&apos;adresser des patients ? <span className="text-red-500">*</span>
        </label>

        {/* [LEGAL] Info anti-contrepartie */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            L&apos;adressage entre professionnels ne peut être conditionné à aucune
            contrepartie financière ou avantage (Art. R4127-23 CSP).
          </p>
        </div>

        <div className="space-y-2">
          {ADDRESSING_SCOPE_OPTIONS.map((opt) => {
            const isSelected = data.addressingScope === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateData({ addressingScope: opt.id })}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all",
                  isSelected
                    ? "border-teal-500 bg-teal-50"
                    : "border-neutral-200 hover:border-neutral-300 bg-white"
                )}
              >
                <p className="font-medium text-sm text-neutral-800">{opt.label}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{opt.description}</p>
              </button>
            )
          })}
        </div>
        {errors.addressingScope && (
          <p className="text-xs text-red-500">{errors.addressingScope}</p>
        )}
      </div>

      {/* Erreur globale */}
      {errors.form && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errors.form}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={prevStep}
          className="flex-1 py-3 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Retour
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={loading}
          className="flex-1 py-3 rounded-xl bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Enregistrement..." : "Continuer"}
        </button>
      </div>
    </div>
  )
}
