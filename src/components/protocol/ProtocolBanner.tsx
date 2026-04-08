"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import {
  CheckCircle2, Circle, Clock, Lock, ArrowRight, Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// ─── Types ──────────────────────────────────────────────────────────────────

interface ProtocolStep {
  order: number
  key: string
  label: string
  role: string
  duration: number
  required?: boolean
  autoNotifyNext?: boolean
}

interface StepResult {
  stepKey: string
  completedBy: string
  completedAt: string
  notes: string | null
  status: string
}

interface ActiveProtocol {
  active: boolean
  execution?: {
    id: string
    status: string
    scheduledDate: string
    currentStep: number
    startedAt: string | null
    protocol: { name: string; steps: ProtocolStep[]; estimatedDuration: number | null }
    stepResults: StepResult[]
    patient: { firstName: string; lastName: string }
  }
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  NURSE: "IDE", DIETITIAN: "Diét", PSYCHOLOGIST: "Psy", PSYCHIATRIST: "Psy",
  GENERAL_PRACTITIONER: "MG", ADAPTED_PHYSICAL_ACTIVITY: "APA",
  TECHNICIAN: "Tech", PSYCHOMOTRICIST: "Psychomot", OTHER: "Autre",
}

const ROLE_COLORS: Record<string, string> = {
  NURSE: "#3B82F6", DIETITIAN: "#F59E0B", PSYCHOLOGIST: "#8B5CF6",
  PSYCHIATRIST: "#7C3AED", GENERAL_PRACTITIONER: "#10B981",
  ADAPTED_PHYSICAL_ACTIVITY: "#06B6D4", TECHNICIAN: "#6B7280",
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ProtocolBanner({ careCaseId }: { careCaseId: string }) {
  const { accessToken } = useAuthStore()
  const qc = useQueryClient()
  const [confirmStep, setConfirmStep] = useState<string | null>(null)
  const [notes, setNotes] = useState("")

  const { data } = useQuery<ActiveProtocol>({
    queryKey: ["active-protocol", careCaseId],
    queryFn: async () => {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      const res = await fetch(`${API}/protocols/care-cases/${careCaseId}/active-protocol`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      return res.json()
    },
    enabled: !!accessToken,
    refetchInterval: 30000,
  })

  const completeMutation = useMutation({
    mutationFn: async ({ executionId, stepKey }: { executionId: string; stepKey: string }) => {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      const res = await fetch(`${API}/protocols/executions/${executionId}/complete-step`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ stepKey, notes: notes || undefined }),
      })
      if (!res.ok) throw new Error("Erreur")
      return res.json()
    },
    onSuccess: (data: { next?: { label: string } }) => {
      qc.invalidateQueries({ queryKey: ["active-protocol", careCaseId] })
      setConfirmStep(null)
      setNotes("")
      const nextLabel = data.next?.label
      toast.success(nextLabel ? `Étape terminée — ${nextLabel} notifié ✨` : "Protocole terminé ✨")
    },
    onError: () => toast.error("Erreur lors de la complétion"),
  })

  if (!data?.active || !data.execution) return null

  const { execution } = data
  const steps = execution.protocol.steps
  const results = execution.stepResults
  const completedKeys = new Set(results.map((r) => r.stepKey))

  return (
    <div className="rounded-xl border bg-card shadow-sm mb-5 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">🏥</span>
          <span className="text-sm font-semibold">{execution.protocol.name}</span>
          <span className="text-xs text-muted-foreground">
            · {format(parseISO(execution.scheduledDate), "d MMMM yyyy", { locale: fr })}
          </span>
        </div>
        <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
          {results.length}/{steps.length} étapes
        </span>
      </div>

      {/* Steps */}
      <div className="px-5 py-4 flex items-start gap-1 overflow-x-auto">
        {steps.map((step, i) => {
          const isCompleted = completedKeys.has(step.key)
          const isCurrent = i === execution.currentStep && !isCompleted
          const isPending = i > execution.currentStep && !isCompleted
          const result = results.find((r) => r.stepKey === step.key)
          const roleColor = ROLE_COLORS[step.role] ?? "#6B7280"

          return (
            <div key={step.key} className="flex items-start">
              {/* Step card */}
              <div className={`flex flex-col items-center w-[90px] shrink-0 ${isPending ? "opacity-40" : ""}`}>
                {/* Status icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 ${
                  isCompleted ? "bg-emerald-100" :
                  isCurrent ? "bg-blue-100 animate-pulse" :
                  "bg-muted"
                }`}>
                  {isCompleted ? <CheckCircle2 size={16} className="text-emerald-600" /> :
                   isCurrent ? <Clock size={16} className="text-blue-600" /> :
                   isPending ? <Lock size={13} className="text-muted-foreground" /> :
                   <Circle size={16} className="text-muted-foreground" />}
                </div>

                {/* Role badge */}
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded mb-1" style={{ backgroundColor: roleColor + "15", color: roleColor }}>
                  {ROLE_LABELS[step.role] ?? step.role}
                </span>

                {/* Label */}
                <p className="text-[10px] font-medium text-center leading-tight line-clamp-2">{step.label}</p>

                {/* Sub info */}
                {isCompleted && result && (
                  <p className="text-[9px] text-emerald-600 mt-0.5">
                    {format(parseISO(result.completedAt), "HH:mm")}
                  </p>
                )}
                {isCurrent && (
                  <button
                    onClick={() => setConfirmStep(step.key)}
                    className="text-[9px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1 hover:bg-blue-100 transition-colors"
                  >
                    Terminer
                  </button>
                )}
                {isPending && (
                  <p className="text-[9px] text-muted-foreground mt-0.5">{step.duration}min</p>
                )}
              </div>

              {/* Arrow */}
              {i < steps.length - 1 && (
                <div className="flex items-center pt-3 px-0.5">
                  <ArrowRight size={12} className={isCompleted ? "text-emerald-400" : "text-border"} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Confirm dialog (inline) */}
      {confirmStep && (
        <div className="px-5 py-3 border-t bg-blue-50/50">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold">
                Terminer &quot;{steps.find((s) => s.key === confirmStep)?.label}&quot; ?
              </p>
              <input
                className="mt-1.5 w-full text-xs border rounded-md px-2 py-1.5 bg-white"
                placeholder="Notes (optionnel)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setConfirmStep(null)}>
              Annuler
            </Button>
            <Button size="sm" className="text-xs h-7" disabled={completeMutation.isPending}
              onClick={() => completeMutation.mutate({ executionId: execution.id, stepKey: confirmStep })}>
              {completeMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : "Confirmer"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
