"use client"

import { useState } from "react"
import { useOnboardingStore } from "@/stores/onboarding.store"
import { useAuthStore } from "@/lib/store"
import { apiWithToken, type OnboardingCertificationInput } from "@/lib/api"
import { Plus, Trash2, ShieldCheck, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// [LEGAL] Liste contrôlée — évite intitulés trompeurs (Art. R4127-39 CSP)
const CERTIFICATION_SUGGESTIONS = [
  // Psychothérapeutiques
  { id: "emdr",              label: "EMDR",                                     category: "Psychothérapie" },
  { id: "tcc",               label: "TCC (Thérapies Cognitivo-Comportementales)", category: "Psychothérapie" },
  { id: "act",               label: "ACT (Acceptance & Commitment Therapy)",    category: "Psychothérapie" },
  { id: "ifs",               label: "IFS (Internal Family Systems)",            category: "Psychothérapie" },
  { id: "therapie_familiale",label: "Thérapie familiale",                       category: "Psychothérapie" },
  { id: "hypnose",           label: "Hypnose thérapeutique",                    category: "Psychothérapie" },
  { id: "pleine_conscience", label: "Mindfulness / MBSR",                       category: "Psychothérapie" },
  { id: "schema",            label: "Thérapie des schémas",                     category: "Psychothérapie" },
  { id: "imago",             label: "Thérapie Imago",                           category: "Psychothérapie" },

  // Somatiques
  { id: "sophrologie",       label: "Sophrologie",                              category: "Approches corps-esprit" },
  { id: "yoga_therapeutique",label: "Yoga thérapeutique",                       category: "Approches corps-esprit" },

  // DIU / DU
  { id: "diu_douleur",       label: "DIU Douleur",                              category: "DIU / DU" },
  { id: "du_addictologie",   label: "DU Addictologie",                          category: "DIU / DU" },
  { id: "diu_sommeil",       label: "DIU Sommeil",                              category: "DIU / DU" },
  { id: "du_tca",            label: "DU Troubles du Comportement Alimentaire",  category: "DIU / DU" },
  { id: "du_nutrition",      label: "DU Nutrition",                             category: "DIU / DU" },

  // Neuropsychologie
  { id: "bilan_neuro",       label: "Bilan neuropsychologique",                 category: "Neuropsychologie" },

  // Rééducation
  { id: "bobath",            label: "Concept Bobath",                           category: "Rééducation" },

  // Clinique spécialisée
  { id: "violence_conj",     label: "Prise en charge violences conjugales",     category: "Clinique spécialisée" },
  { id: "trauma_complexe",   label: "Trauma complexe / Dissociation",           category: "Clinique spécialisée" },
  { id: "deuil",             label: "Accompagnement du deuil",                  category: "Clinique spécialisée" },
  { id: "precarite",         label: "Santé & précarité",                        category: "Clinique spécialisée" },
  { id: "interculturalite",  label: "Clinique interculturelle",                 category: "Clinique spécialisée" },
]

const CURRENT_YEAR = new Date().getFullYear()

interface Certification {
  name:         string
  organization: string
  year:         number
}

export function StepCertifications() {
  const { data, setData, nextStep, prevStep, markCompleted } = useOnboardingStore()
  const { accessToken } = useAuthStore()

  // Les certifications vivent dans le store (persistées)
  const certifications: Certification[] = (data.certifications ?? []).map((c) => ({
    name:         c.name,
    organization: c.organism,
    year:         c.year ? Number(c.year) : CURRENT_YEAR,
  }))

  const setCertifications = (list: Certification[]) =>
    setData({
      certifications: list.map((c) => ({
        name:     c.name,
        organism: c.organization,
        year:     c.year ? String(c.year) : undefined,
      }))
    })

  const [showForm, setShowForm]       = useState(false)
  const [customInput, setCustomInput] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const [form, setForm] = useState<Certification>({
    name:         "",
    organization: "",
    year:         CURRENT_YEAR,
  })

  const addCertification = () => {
    if (!form.name.trim()) return
    setCertifications([...certifications, form])
    setForm({ name: "", organization: "", year: CURRENT_YEAR })
    setShowForm(false)
    setCustomInput(false)
  }

  const remove = (i: number) => {
    setCertifications(certifications.filter((_, idx) => idx !== i))
  }

  const handleNext = async () => {
    if (!accessToken) {
      setError("Session expirée, veuillez vous reconnecter.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const payload: OnboardingCertificationInput[] = certifications.map((c) => ({
        name:         c.name,
        organization: c.organization,
        year:         c.year,
      }))
      await apiWithToken(accessToken).onboarding.saveCertifications(payload)
      markCompleted(5)
      nextStep()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur serveur"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const grouped = CERTIFICATION_SUGGESTIONS.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof CERTIFICATION_SUGGESTIONS>)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-800">
          Formations & Certifications
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Optionnel — permet aux confrères de cibler vos compétences spécifiques
        </p>
      </div>

      {/* [LEGAL] Avertissement déontologique */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
        <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Honnêteté & déontologie</p>
          <p className="mt-0.5">
            N&apos;indiquez que les formations réellement effectuées.
            Toute information trompeuse engage votre responsabilité
            disciplinaire (Art. R4127-39 CSP).
          </p>
        </div>
      </div>

      {/* Certifications ajoutées */}
      {certifications.length > 0 && (
        <div className="space-y-2">
          {certifications.map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-white"
            >
              <div>
                <p className="text-sm font-medium text-neutral-800">{c.name}</p>
                <p className="text-xs text-neutral-400">
                  {c.organization} {c.year && `— ${c.year}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-neutral-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire */}
      {showForm ? (
        <div className="border-2 border-teal-200 rounded-xl p-5 space-y-4 bg-teal-50/30">
          {!customInput ? (
            <>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {Object.entries(grouped).map(([cat, items]) => (
                  <div key={cat}>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                      {cat}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setForm({ ...form, name: item.label })}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs border transition-all",
                            form.name === item.label
                              ? "bg-teal-500 text-white border-teal-500"
                              : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCustomInput(true)}
                className="text-xs text-teal-600 underline"
              >
                Ma formation ne figure pas dans la liste
              </button>
            </>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-600">
                Intitulé de la formation
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex : DIU Tabacologie"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-600">Organisme</label>
              <input
                type="text"
                value={form.organization}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                placeholder="Université, Institut..."
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-600">Année</label>
              <input
                type="number"
                value={form.year}
                min={1980}
                max={CURRENT_YEAR}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || CURRENT_YEAR })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setCustomInput(false) }}
              className="flex-1 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={addCertification}
              disabled={!form.name.trim()}
              className="flex-1 py-2 rounded-lg bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 disabled:opacity-40"
            >
              Ajouter
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-xl border-2 border-dashed border-neutral-300 text-sm text-neutral-500 hover:border-teal-300 hover:text-teal-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter une formation
        </button>
      )}

      {/* Erreur */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
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
          {certifications.length === 0
            ? (loading ? "Enregistrement…" : "Passer cette étape")
            : (loading ? "Enregistrement…" : "Continuer")}
        </button>
      </div>
    </div>
  )
}
