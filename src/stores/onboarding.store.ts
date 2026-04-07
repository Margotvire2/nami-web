import { create } from "zustand"
import { persist } from "zustand/middleware"

export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7

interface Structure {
  name:       string
  type:       string
  address:    string
  city:       string
  postalCode: string
  phone?:     string
  fax?:       string
}

interface Certification {
  name:     string
  organism: string
  year?:    string
}

export interface OnboardingData {
  // Étape 1 — Identité
  specialties:          string[]
  subSpecialties:       string[]
  qualificationLevel:   string
  bio:                  string
  rppsNumber?:          string
  adeliNumber?:         string

  // Étape 2 — Exercice
  exerciseMode:         string
  conventionSector:     string
  acceptsCMU:           boolean
  acceptsALD:           boolean
  acceptsTele:          boolean

  // Étape 3 — Structures
  structures:           Structure[]

  // Étape 4 — Consultation & disponibilité
  consultationModes:    string[]
  acceptedPatientTypes: string[]
  acceptingNewPatients: boolean
  newPatientDelay:      string

  // Étape 5 — Certifications
  certifications:       Certification[]

  // Étape 6 — Réseau & visibilité
  profileVisibility:    string
  addressingScope:      string
  spokenLanguages:      string[]
  geographicZones:      string[]
}

interface OnboardingStore {
  currentStep:    OnboardingStep
  data:           Partial<OnboardingData>
  completedSteps: OnboardingStep[]

  setStep:        (step: OnboardingStep) => void
  nextStep:       () => void
  prevStep:       () => void
  setData:        (patch: Partial<OnboardingData>) => void
  updateData:     (patch: Partial<OnboardingData>) => void
  markCompleted:  (step: OnboardingStep) => void
  reset:          () => void
}

const initialData: Partial<OnboardingData> = {
  specialties:          [],
  subSpecialties:       [],
  qualificationLevel:   "GENERAL",
  bio:                  "",
  exerciseMode:         "",
  conventionSector:     "",
  acceptsCMU:           false,
  acceptsALD:           false,
  acceptsTele:          false,
  structures:           [],
  consultationModes:    [],
  acceptedPatientTypes: [],
  acceptingNewPatients: true,
  newPatientDelay:      "",
  certifications:       [],
  profileVisibility:    "",
  addressingScope:      "",
  spokenLanguages:      [],
  geographicZones:      [],
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      currentStep:    1,
      data:           initialData,
      completedSteps: [],

      setStep: (step) => set({ currentStep: step }),

      nextStep: () => {
        const current = get().currentStep
        if (current < 7) {
          set({ currentStep: (current + 1) as OnboardingStep })
        }
      },

      prevStep: () => {
        const current = get().currentStep
        if (current > 1) {
          set({ currentStep: (current - 1) as OnboardingStep })
        }
      },

      setData: (patch) =>
        set((state) => ({
          data: { ...state.data, ...patch },
        })),

      updateData: (patch) =>
        set((state) => ({
          data: { ...state.data, ...patch },
        })),

      markCompleted: (step) =>
        set((state) => ({
          completedSteps: [...new Set([...state.completedSteps, step])],
        })),

      reset: () =>
        set({
          currentStep:    1,
          data:           initialData,
          completedSteps: [],
        }),
    }),
    {
      name: "nami-onboarding",
      partialize: (state) => ({
        currentStep:    state.currentStep,
        data:           state.data,
        completedSteps: state.completedSteps,
      }),
    }
  )
)
