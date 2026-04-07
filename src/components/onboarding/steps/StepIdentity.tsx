"use client"

import { useState } from "react"
import { useOnboardingStore } from "@/stores/onboarding.store"
import { useAuthStore } from "@/lib/store"
import { apiWithToken, type OnboardingIdentityInput } from "@/lib/api"
import { SpecialtyAutocomplete } from "@/components/SpecialtyAutocomplete"
import { AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function StepIdentity() {
  const { data, setData, nextStep, markCompleted } = useOnboardingStore()
  const { accessToken } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const canNext = (data.specialties?.length ?? 0) > 0

  const handleNext = async () => {
    if (!canNext) {
      setError("Sélectionnez au moins une spécialité.")
      return
    }
    if (!accessToken) {
      setError("Session expirée, veuillez vous reconnecter.")
      return
    }

    setError(null)
    setLoading(true)

    try {
      const payload: OnboardingIdentityInput = {
        specialties:        data.specialties!,
        subSpecialties:     data.subSpecialties ?? [],
        qualificationLevel: data.qualificationLevel ?? "GENERAL",
        bio:                data.bio ?? undefined,
        rppsNumber:         data.rppsNumber ?? undefined,
        adeliNumber:        data.adeliNumber ?? undefined,
      }

      await apiWithToken(accessToken).onboarding.saveIdentity(payload)
      markCompleted(1)
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
          Votre identité professionnelle
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Ces informations apparaîtront sur votre fiche dans l&apos;annuaire.
        </p>
      </div>

      {/* Spécialités */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">
          Spécialité(s) <span className="text-red-500">*</span>
        </label>
        <SpecialtyAutocomplete
          value={data.specialties || []}
          onChange={(v) => setData({ specialties: v })}
          max={3}
          placeholder="Rechercher une spécialité..."
        />
        <p className="text-xs text-neutral-400">
          Choisissez jusqu&apos;à 3 spécialités. Elles apparaîtront sur votre profil public.
        </p>
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">
          Votre approche
          <span className="text-neutral-400 font-normal ml-2">(optionnel)</span>
        </label>
        <textarea
          value={data.bio || ""}
          onChange={(e) => setData({ bio: e.target.value.slice(0, 500) })}
          maxLength={500}
          rows={3}
          placeholder="Décrivez votre approche, vos spécialisations, ce qui vous caractérise..."
          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-300"
        />
        <p className="text-xs text-neutral-400 text-right">
          {(data.bio || "").length}/500
        </p>
      </div>

      {/* Nav */}
      <div className="flex gap-3 pt-2">
        <div className="flex-1" />
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
