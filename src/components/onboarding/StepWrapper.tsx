"use client"

import { useOnboardingStore } from "@/stores/onboarding.store"

interface Props {
  title:       string
  description: string
  onNext:      () => void
  children:    React.ReactNode
  nextLabel?:  string
  isLoading?:  boolean
}

export function StepWrapper({
  title,
  description,
  onNext,
  children,
  nextLabel = "Continuer",
  isLoading = false,
}: Props) {
  const { currentStep, prevStep } = useOnboardingStore()

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-neutral-800">{title}</h1>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>

      <div className="space-y-6">
        {children}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
        {currentStep > 1 ? (
          <button
            onClick={prevStep}
            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            &larr; Retour
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={onNext}
          disabled={isLoading}
          className="px-6 py-2.5 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "..." : nextLabel}
        </button>
      </div>
    </div>
  )
}
