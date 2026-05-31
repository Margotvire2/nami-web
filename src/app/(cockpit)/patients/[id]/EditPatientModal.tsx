"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { apiWithToken, ApiError } from "@/lib/api"
import { toast } from "sonner"
import { Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  careCaseId: string
  personId: string
  initialData: {
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    birthDate?: string | null
    sex?: string | null
  }
  initialPatientFacingTitle?: string | null
  onClose: () => void
}

const PATIENT_FACING_TITLE_MAX = 80

export function EditPatientModal({ careCaseId, personId, initialData, initialPatientFacingTitle, onClose }: Props) {
  const { accessToken } = useAuthStore()
  const api = apiWithToken(accessToken!)
  const qc = useQueryClient()

  const [firstName, setFirstName] = useState(initialData.firstName)
  const [lastName, setLastName] = useState(initialData.lastName)
  const [email, setEmail] = useState(initialData.email)
  const [phone, setPhone] = useState(initialData.phone ?? "")
  const [birthDate, setBirthDate] = useState(
    initialData.birthDate ? initialData.birthDate.slice(0, 10) : ""
  )
  const [sex, setSex] = useState(initialData.sex ?? "")
  const [patientFacingTitle, setPatientFacingTitle] = useState(initialPatientFacingTitle ?? "")
  const [emailError, setEmailError] = useState("")

  const mutation = useMutation({
    mutationFn: async () => {
      // 1. Person update (firstName/lastName/email/phone/birthDate/sex)
      const data: Parameters<typeof api.persons.patch>[1] = {}
      if (firstName !== initialData.firstName) data.firstName = firstName
      if (lastName !== initialData.lastName) data.lastName = lastName
      if (email !== initialData.email) data.email = email
      const prevPhone = initialData.phone ?? ""
      if (phone !== prevPhone) data.phone = phone
      const prevBd = initialData.birthDate ? initialData.birthDate.slice(0, 10) : ""
      if (birthDate && birthDate !== prevBd) {
        data.birthDate = new Date(birthDate + "T12:00:00.000Z").toISOString()
      }
      const prevSex = initialData.sex ?? ""
      if (sex !== prevSex) data.sex = sex as "MALE" | "FEMALE" | "OTHER" | "UNKNOWN"
      const personUpdated = Object.keys(data).length > 0
      if (personUpdated) await api.persons.patch(personId, data)

      // 2. CareCase override patientFacingTitle (vide = reset au nom doux par défaut)
      const trimmed = patientFacingTitle.trim()
      const prevTitle = (initialPatientFacingTitle ?? "").trim()
      if (trimmed !== prevTitle) {
        await api.careCases.update(careCaseId, {
          patientFacingTitle: trimmed === "" ? null : trimmed,
        })
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["care-case", careCaseId] })
      toast.success("Informations mises à jour")
      onClose()
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setEmailError("Cet email est déjà utilisé")
          return
        }
        if (err.status === 403) {
          toast.error("Vous n'avez pas l'autorisation de modifier ce patient")
          return
        }
      }
      toast.error("Une erreur est survenue")
    },
  })

  function validateAndSubmit() {
    setEmailError("")
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Format d'email invalide")
      return
    }
    if (patientFacingTitle.trim().length > PATIENT_FACING_TITLE_MAX) {
      toast.error(`Nom visible patient : ${PATIENT_FACING_TITLE_MAX} caractères maximum`)
      return
    }
    mutation.mutate()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center cockpit-glass-overlay"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">Modifier les informations</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Prénom</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4]"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Prénom"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4]"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nom"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] ${
                emailError ? "border-red-400" : "border-gray-200"
              }`}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError("") }}
              placeholder="email@exemple.com"
            />
            {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
            <input
              type="tel"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4]"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06 00 00 00 00"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date de naissance</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4]"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sexe</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] bg-white"
                value={sex}
                onChange={(e) => setSex(e.target.value)}
              >
                <option value="">Non renseigné</option>
                <option value="MALE">Masculin</option>
                <option value="FEMALE">Féminin</option>
                <option value="OTHER">Autre</option>
                <option value="UNKNOWN">Inconnu</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nom visible patient
              <span className="ml-1.5 text-[10px] text-gray-400 font-normal">
                {patientFacingTitle.length}/{PATIENT_FACING_TITLE_MAX}
              </span>
            </label>
            <input
              type="text"
              maxLength={PATIENT_FACING_TITLE_MAX}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4]"
              value={patientFacingTitle}
              onChange={(e) => setPatientFacingTitle(e.target.value)}
              placeholder="Ex: Mon parcours TCA"
            />
            <p className="mt-1 text-[10px] text-gray-500">
              Si vide, un nom doux par défaut sera utilisé côté patient.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Annuler
          </Button>
          <Button
            size="sm"
            className="bg-[#5B4EC4] hover:bg-[#4A3DB3] text-white"
            onClick={validateAndSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 size={13} className="animate-spin mr-1.5" />
                Enregistrement…
              </>
            ) : (
              "Enregistrer"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
