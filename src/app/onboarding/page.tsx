"use client"

import { useOnboardingStore } from "@/stores/onboarding.store"
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress"
import { StepIdentity }       from "@/components/onboarding/steps/StepIdentity"
import { StepExercise }       from "@/components/onboarding/steps/StepExercise"
import { StepStructures }     from "@/components/onboarding/steps/StepStructures"
import { StepConsultation }   from "@/components/onboarding/steps/StepConsultation"
import { StepCertifications } from "@/components/onboarding/steps/StepCertifications"
import { StepNetwork }        from "@/components/onboarding/steps/StepNetwork"
import { StepConfirmation }   from "@/components/onboarding/steps/StepConfirmation"
import type { OnboardingStep } from "@/stores/onboarding.store"

const STEPS: Record<OnboardingStep, React.ComponentType> = {
  1: StepIdentity,
  2: StepExercise,
  3: StepStructures,
  4: StepConsultation,
  5: StepCertifications,
  6: StepNetwork,
  7: StepConfirmation,
}

export default function OnboardingPage() {
  const { currentStep } = useOnboardingStore()
  const StepComponent = STEPS[currentStep]

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <OnboardingProgress currentStep={currentStep} totalSteps={7} />
        <StepComponent />
      </div>
    </div>
  )
}
