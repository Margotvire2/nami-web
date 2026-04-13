"use client"

import { useState, useMemo } from "react"
import { useOnboardingStore } from "@/stores/onboarding.store"
import { useAuthStore } from "@/lib/store"
import { apiWithToken, type OnboardingIdentityInput } from "@/lib/api"
import { PROFESSIONS, EXPERTISE_THEMES, PROFESSION_THEME_MAP } from "@/lib/data/specialties"
import { AlertCircle, Loader2, Search, X, Check, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORY_LABELS: Record<string, string> = {
  medical: "Médecins",
  paramedical: "Paramédicaux",
  sante_mentale: "Santé mentale",
  social: "Social & médico-social",
  sport: "Sport & bien-être",
}

const CATEGORY_ORDER = ["medical", "paramedical", "sante_mentale", "social", "sport"]

export function StepIdentity() {
  const { data, setData, nextStep, markCompleted } = useOnboardingStore()
  const { accessToken } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [professionSearch, setProfessionSearch] = useState("")
  const [expertiseSearch, setExpertiseSearch] = useState("")
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null)

  const selectedProfession = PROFESSIONS.find(p => p.id === data.professionType)
  const expertiseDomains = data.specialties ?? []

  // Filter professions by search
  const filteredProfessions = useMemo(() => {
    if (!professionSearch.trim()) return null // show categories
    const q = professionSearch.toLowerCase()
    return PROFESSIONS.filter(p => p.label.toLowerCase().includes(q))
  }, [professionSearch])

  // Get relevant themes for selected profession
  const relevantThemes = useMemo(() => {
    if (!data.professionType) return []
    const themeIds = PROFESSION_THEME_MAP[data.professionType] ?? []
    return EXPERTISE_THEMES.filter(t => themeIds.includes(t.id))
  }, [data.professionType])

  // Filter expertise by search
  const filteredThemes = useMemo(() => {
    if (!expertiseSearch.trim()) return relevantThemes
    const q = expertiseSearch.toLowerCase()
    return relevantThemes
      .map(t => ({
        ...t,
        domains: t.domains.filter(d => d.label.toLowerCase().includes(q)),
      }))
      .filter(t => t.domains.length > 0)
  }, [relevantThemes, expertiseSearch])

  const selectProfession = (id: string) => {
    setData({
      professionType: id,
      specialties: [], // reset expertise when changing profession
    })
    setProfessionSearch("")
  }

  const toggleExpertise = (id: string) => {
    const current = expertiseDomains
    if (current.includes(id)) {
      setData({ specialties: current.filter(s => s !== id) })
    } else {
      if (current.length >= 5) return
      setData({ specialties: [...current, id] })
    }
  }

  // Champ identifiant professionnel (RPPS ou ADELI) selon la profession
  const identifierType = selectedProfession?.hasRPPS
    ? "rpps"
    : selectedProfession?.hasADELI
    ? "adeli"
    : null

  const identifierValue =
    identifierType === "rpps"  ? (data.rppsNumber  ?? "") :
    identifierType === "adeli" ? (data.adeliNumber ?? "") : ""

  const isIdentifierValid =
    identifierType === null ||
    (identifierType === "rpps"  && /^\d{11}$/.test(data.rppsNumber  ?? "")) ||
    (identifierType === "adeli" && /^\d{9}$/.test(data.adeliNumber  ?? ""))

  const canNext = !!data.professionType && expertiseDomains.length > 0 && isIdentifierValid

  const handleNext = async () => {
    if (!data.professionType) {
      setError("Sélectionnez votre profession.")
      return
    }
    if (expertiseDomains.length === 0) {
      setError("Sélectionnez au moins un domaine d'expertise.")
      return
    }
    if (identifierType && !isIdentifierValid) {
      const label = identifierType === "rpps" ? "RPPS (11 chiffres)" : "ADELI (9 chiffres)"
      setError(`Numéro ${label} invalide.`)
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
        specialties: [data.professionType, ...expertiseDomains],
        subSpecialties: expertiseDomains,
        qualificationLevel: data.qualificationLevel ?? "GENERAL",
        bio: data.bio ?? undefined,
        rppsNumber: data.rppsNumber ?? undefined,
        adeliNumber: data.adeliNumber ?? undefined,
      }
      await apiWithToken(accessToken).onboarding.saveIdentity(payload)
      markCompleted(1)
      nextStep()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur serveur")
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

      {/* ── 1. Profession (single select) ── */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-700">
          Votre profession <span className="text-red-500">*</span>
        </label>

        {selectedProfession ? (
          <div className="flex items-center justify-between p-3 rounded-xl border-2 border-teal-500 bg-teal-50">
            <div>
              <p className="text-sm font-medium text-teal-800">{selectedProfession.label}</p>
              <p className="text-[10px] text-teal-600 mt-0.5">
                {selectedProfession.hasRPPS ? "RPPS" : selectedProfession.hasADELI ? "ADELI" : ""}
                {selectedProfession.hasConvention ? " · Conventionné" : ""}
              </p>
            </div>
            <button
              onClick={() => setData({ professionType: "", specialties: [] })}
              className="text-teal-600 hover:text-teal-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                value={professionSearch}
                onChange={(e) => setProfessionSearch(e.target.value)}
                placeholder="Rechercher votre profession..."
                className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
            </div>

            {/* Results */}
            <div className="max-h-64 overflow-y-auto border rounded-xl">
              {filteredProfessions ? (
                // Search results
                filteredProfessions.length > 0 ? (
                  <div className="p-2 space-y-0.5">
                    {filteredProfessions.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectProfession(p.id)}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-teal-50 transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="p-4 text-xs text-neutral-400 text-center">Aucun résultat</p>
                )
              ) : (
                // Categories
                CATEGORY_ORDER.map(cat => {
                  const profs = PROFESSIONS.filter(p => p.category === cat)
                  return (
                    <div key={cat}>
                      <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-neutral-400 bg-neutral-50 border-b">
                        {CATEGORY_LABELS[cat]}
                      </p>
                      <div className="p-1">
                        {profs.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => selectProfession(p.id)}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-teal-50 transition-colors"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 2. N° RPPS / ADELI (shown once profession selected) ── */}
      {selectedProfession && identifierType && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">
            N° {identifierType === "rpps" ? "RPPS" : "ADELI"}{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={identifierValue}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, identifierType === "rpps" ? 11 : 9)
                identifierType === "rpps"
                  ? setData({ rppsNumber: v })
                  : setData({ adeliNumber: v })
              }}
              placeholder={identifierType === "rpps" ? "Ex : 10007322976" : "Ex : 759912345"}
              className={cn(
                "w-full px-3 py-2.5 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-300",
                identifierValue && !isIdentifierValid
                  ? "border-red-300 focus:ring-red-200"
                  : "border-neutral-200"
              )}
            />
            {identifierValue && isIdentifierValid && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500 pointer-events-none" />
            )}
          </div>
          <p className="text-xs text-neutral-400 flex items-start gap-1">
            <Info className="w-3 h-3 shrink-0 mt-0.5" />
            Votre numéro figure sur votre carte CPS ou sur{" "}
            <a
              href="https://annuaire.sante.fr"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-neutral-600"
            >
              annuaire.sante.fr
            </a>
          </p>
          {identifierValue && !isIdentifierValid && (
            <p className="text-xs text-red-500">
              {identifierType === "rpps"
                ? "Le numéro RPPS doit contenir exactement 11 chiffres."
                : "Le numéro ADELI doit contenir exactement 9 chiffres."}
            </p>
          )}
        </div>
      )}

      {/* ── 3. Domaines d'expertise (multi select, shown after profession) ── */}
      {data.professionType && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-neutral-700">
            Domaines d&apos;expertise <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-neutral-400">
            Choisissez jusqu&apos;à 5 domaines. Ils apparaîtront sur votre profil.
          </p>

          {/* Selected chips */}
          {expertiseDomains.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {expertiseDomains.map(id => {
                const theme = EXPERTISE_THEMES.find(t => t.domains.some(d => d.id === id))
                const domain = theme?.domains.find(d => d.id === id)
                return (
                  <span
                    key={id}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700 border border-teal-200"
                  >
                    {domain?.label ?? id}
                    <button onClick={() => toggleExpertise(id)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )
              })}
              <span className="text-[10px] text-neutral-400 self-center ml-1">
                {expertiseDomains.length}/5
              </span>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              value={expertiseSearch}
              onChange={(e) => setExpertiseSearch(e.target.value)}
              placeholder="Rechercher un domaine..."
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>

          {/* Themes accordion */}
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {filteredThemes.map(theme => {
              const isOpen = expandedTheme === theme.id || expertiseSearch.trim()
              const selectedInTheme = theme.domains.filter(d => expertiseDomains.includes(d.id)).length
              return (
                <div key={theme.id} className="border rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedTheme(isOpen && !expertiseSearch.trim() ? null : theme.id)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                      <span>{theme.icon}</span> {theme.label}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {selectedInTheme > 0 ? (
                        <span className="text-teal-600 font-medium">{selectedInTheme} sélectionné{selectedInTheme > 1 ? "s" : ""}</span>
                      ) : (
                        `${theme.domains.length}`
                      )}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="p-2.5 flex flex-wrap gap-1.5 border-t">
                      {theme.domains.map(domain => {
                        const isSelected = expertiseDomains.includes(domain.id)
                        const isDisabled = !isSelected && expertiseDomains.length >= 5
                        return (
                          <button
                            key={domain.id}
                            type="button"
                            onClick={() => toggleExpertise(domain.id)}
                            disabled={isDisabled}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-xs border transition-all flex items-center gap-1",
                              isSelected
                                ? "bg-teal-500 text-white border-teal-500"
                                : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300",
                              isDisabled && "opacity-30 cursor-not-allowed"
                            )}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                            {domain.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Bio ── */}
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
          placeholder="Décrivez votre approche, ce qui vous caractérise..."
          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-300"
        />
        <p className="text-xs text-neutral-400 text-right">{(data.bio || "").length}/500</p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}

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
