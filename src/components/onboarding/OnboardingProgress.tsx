"use client"

import { useOnboardingStore, type OnboardingStep } from "@/stores/onboarding.store"
import { cn } from "@/lib/utils"

const STEP_LABELS = [
  "Identité",
  "Exercice",
  "Structures",
  "Consultation",
  "Formations",
  "Réseau",
  "Confirmation",
]

interface Props {
  currentStep: number
  totalSteps:  number
}

export function OnboardingProgress({ currentStep, totalSteps }: Props) {
  const { completedSteps, setStep } = useOnboardingStore()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          Étape {currentStep} sur {totalSteps}
        </p>
        <p className="text-sm font-medium text-neutral-700">
          {STEP_LABELS[currentStep - 1]}
        </p>
      </div>

      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = (i + 1) as OnboardingStep
          const isCompleted = completedSteps.includes(step)
          const isCurrent   = currentStep === step
          const isClickable = isCompleted

          return (
            <button
              key={step}
              onClick={() => isClickable && setStep(step)}
              disabled={!isClickable}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                isCompleted && "bg-teal-500 cursor-pointer hover:bg-teal-600",
                isCurrent  && !isCompleted && "bg-teal-400",
                !isCompleted && !isCurrent && "bg-neutral-200"
              )}
            />
          )
        })}
      </div>
    </div>
  )
}
