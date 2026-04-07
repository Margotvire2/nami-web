"use client"

import { useOnboardingStore } from "@/stores/onboarding.store"
import { useAuthStore } from "@/lib/store"
import { apiWithToken, type OnboardingStructureInput } from "@/lib/api"
import { useState } from "react"
import { Plus, Trash2, AlertCircle, MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Structure {
  name:       string
  type:       string
  address:    string
  city:       string
  postalCode: string
  phone?:     string
  fax?:       string
}

const STRUCTURE_TYPES = [
  "Cabinet individuel",
  "Cabinet de groupe",
  "Maison de santé pluriprofessionnelle (MSP)",
  "Centre de santé",
  "Hôpital public",
  "Clinique privée",
  "EHPAD",
  "HAD",
  "Autre",
]

const EMPTY_STRUCTURE: Structure = {
  name:       "",
  type:       "",
  address:    "",
  city:       "",
  postalCode: "",
  phone:      "",
  fax:        "",
}

// Input extrait hors du composant pour éviter la perte de focus au re-render
function FormInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label:        string
  value:        string
  onChange:     (v: string) => void
  placeholder?: string
  required?:    boolean
  type?:        string
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-neutral-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      />
    </div>
  )
}

export function StepStructures() {
  const { data, setData, nextStep, prevStep, markCompleted } = useOnboardingStore()
  const { accessToken } = useAuthStore()

  const structures: Structure[] = (data.structures as Structure[]) ?? []

  const [adding,  setAdding]  = useState(false)
  const [form,    setForm]    = useState<Structure>(EMPTY_STRUCTURE)
  const [error,   setError]   = useState<string | null>(null)
  const [formErr, setFormErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isFormValid =
    form.name.trim() &&
    form.type &&
    form.address.trim() &&
    form.city.trim() &&
    /^\d{5}$/.test(form.postalCode)

  const handleAdd = () => {
    if (!isFormValid) {
      setFormErr("Veuillez remplir tous les champs obligatoires.")
      return
    }
    setData({ structures: [...structures, { ...form }] })
    setForm(EMPTY_STRUCTURE)
    setAdding(false)
    setFormErr(null)
  }

  const handleRemove = (index: number) => {
    setData({
      structures: structures.filter((_, i) => i !== index),
    })
  }

  const handleNext = async () => {
    if (structures.length === 0) {
      setError("Veuillez ajouter au moins une structure d'exercice.")
      return
    }
    if (!accessToken) {
      setError("Session expirée, veuillez vous reconnecter.")
      return
    }

    setError(null)
    setLoading(true)

    try {
      await apiWithToken(accessToken).onboarding.saveStructures(
        structures as OnboardingStructureInput[]
      )
      markCompleted(3)
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
          Structures d&apos;exercice
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Indiquez où vous exercez. Ces lieux apparaîtront sur votre profil.
        </p>
      </div>

      {/* Liste des structures ajoutées */}
      {structures.length > 0 && (
        <div className="space-y-2">
          {structures.map((s, i) => (
            <div
              key={i}
              className="flex items-start justify-between p-3 rounded-xl border border-neutral-200 bg-neutral-50"
            >
              <div className="flex gap-2">
                <MapPin className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-neutral-800">{s.name}</p>
                  <p className="text-xs text-neutral-500">
                    {s.type} &middot; {s.address}, {s.postalCode} {s.city}
                  </p>
                  {s.phone && (
                    <p className="text-xs text-neutral-400">{s.phone}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="text-neutral-400 hover:text-red-500 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      {adding ? (
        <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 space-y-3">
          <h3 className="text-sm font-medium text-neutral-700">
            Nouvelle structure
          </h3>

          <FormInput
            label="Nom de la structure"
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            placeholder="Cabinet Dr. Martin"
            required
          />

          {/* Type */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-600">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">Sélectionner...</option>
              {STRUCTURE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <FormInput
            label="Adresse"
            value={form.address}
            onChange={(v) => setForm((f) => ({ ...f, address: v }))}
            placeholder="12 rue de la Paix"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Code postal"
              value={form.postalCode}
              onChange={(v) => setForm((f) => ({ ...f, postalCode: v }))}
              placeholder="75001"
              required
            />
            <FormInput
              label="Ville"
              value={form.city}
              onChange={(v) => setForm((f) => ({ ...f, city: v }))}
              placeholder="Paris"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Téléphone"
              value={form.phone ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              placeholder="01 23 45 67 89"
              type="tel"
            />
            <FormInput
              label="Fax"
              value={form.fax ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, fax: v }))}
              placeholder="01 23 45 67 89"
              type="tel"
            />
          </div>

          {formErr && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {formErr}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setAdding(false); setFormErr(null) }}
              className="flex-1 py-2 rounded-lg border border-neutral-200 text-xs text-neutral-600 hover:bg-neutral-50 transition"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 py-2 rounded-lg bg-teal-600 text-white text-xs font-medium hover:bg-teal-700 transition"
            >
              Ajouter
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-neutral-200 text-sm text-neutral-500 hover:border-teal-400 hover:text-teal-600 transition"
        >
          <Plus className="h-4 w-4" />
          Ajouter une structure
        </button>
      )}

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
            structures.length > 0 && !loading
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
