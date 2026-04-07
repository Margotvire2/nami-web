"use client"

import { useState } from "react"
import { Save, AlertTriangle, ChevronDown, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import telesurveillanceData from "@/lib/data/telesurveillance-tca.json"

interface ObservationValue {
  metricKey: string
  value: string
}

interface ObservationFormProps {
  professionalRole: string
  careCaseId: string
  onSubmit: (observations: { metricKey: string; valueNumeric?: number; valueText?: string; valueBoolean?: boolean; source: "PROVIDER_ENTRY" }[]) => void
}

const roleLabels: Record<string, string> = {
  "medecin-generaliste": "Médecin généraliste",
  "psychiatre": "Psychiatre",
  "psychologue": "Psychologue",
  "dieteticien": "Diététicien(ne)",
  "psychomotricien": "Psychomotricien(ne)",
  "gynecologue": "Gynécologue",
  "endocrinologue": "Endocrinologue",
  "dentiste": "Dentiste",
  "assistante-sociale": "Assistante sociale",
  "ide-liberal": "IDE libéral(e)",
}

export function ObservationForm({ professionalRole, careCaseId, onSubmit }: ObservationFormProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["0"]))
  const [saving, setSaving] = useState(false)

  const professional = telesurveillanceData.professionals.find((p) => p.id === professionalRole)
  if (!professional) return <p className="text-sm text-muted-foreground">Rôle professionnel non trouvé.</p>

  function toggleSection(idx: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  function setValue(fieldId: string, value: string) {
    setValues((prev) => ({ ...prev, [fieldId]: value }))
  }

  function handleSubmit() {
    setSaving(true)
    const observations = Object.entries(values)
      .filter(([, v]) => v !== "" && v !== undefined)
      .map(([key, val]) => {
        const numVal = parseFloat(val)
        const boolVal = val === "true" ? true : val === "false" ? false : undefined
        return {
          metricKey: key,
          valueNumeric: !isNaN(numVal) && boolVal === undefined ? numVal : undefined,
          valueText: isNaN(numVal) && boolVal === undefined ? val : undefined,
          valueBoolean: boolVal,
          source: "PROVIDER_ENTRY" as const satisfies "PROVIDER_ENTRY",
        }
      })

    onSubmit(observations)
    setSaving(false)
  }

  const filledCount = Object.values(values).filter((v) => v !== "").length
  const totalFields = professional.datasets.reduce((acc, ds) => acc + ds.fields.length, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-base font-semibold">
            Saisie — {roleLabels[professionalRole] || professional.label}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filledCount} / {totalFields} champs renseignés
          </p>
        </div>
        <Button onClick={handleSubmit} disabled={filledCount === 0 || saving} size="sm">
          <Save className="size-4" />
          Enregistrer
        </Button>
      </div>

      {/* Progress */}
      <div className="h-1.5 rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${totalFields > 0 ? (filledCount / totalFields) * 100 : 0}%` }}
        />
      </div>

      {/* Datasets */}
      {professional.datasets.map((dataset, dsIdx) => {
        const idx = String(dsIdx)
        const isExpanded = expandedSections.has(idx)
        const filledInSection = dataset.fields.filter((f) => values[f.id] && values[f.id] !== "").length

        return (
          <Card key={dataset.category} size="sm">
            <button
              onClick={() => toggleSection(idx)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-muted/30 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span className="flex-1 text-sm font-medium">{dataset.label}</span>
              <Badge variant="secondary" className="text-[10px]">
                {filledInSection}/{dataset.fields.length}
              </Badge>
            </button>

            {isExpanded && (
              <CardContent className="border-t pt-3 space-y-3">
                {dataset.fields.map((field) => (
                  <FieldInput
                    key={field.id}
                    field={field}
                    value={values[field.id] || ""}
                    onChange={(v) => setValue(field.id, v)}
                  />
                ))}
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: any
  value: string
  onChange: (v: string) => void
}) {
  const hasAlert = field.alerts && field.alerts.length > 0

  if (field.type === "boolean") {
    return (
      <div className="flex items-center justify-between">
        <label className="text-sm text-muted-foreground">{field.label}</label>
        <div className="flex gap-1.5">
          <button
            onClick={() => onChange(value === "true" ? "" : "true")}
            className={cn(
              "rounded-lg border px-3 py-1 text-xs font-medium transition-all",
              value === "true" ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted/50"
            )}
          >
            Oui
          </button>
          <button
            onClick={() => onChange(value === "false" ? "" : "false")}
            className={cn(
              "rounded-lg border px-3 py-1 text-xs font-medium transition-all",
              value === "false" ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted/50"
            )}
          >
            Non
          </button>
        </div>
      </div>
    )
  }

  if (field.type === "select") {
    return (
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">{field.label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
        >
          <option value="">—</option>
          {field.options?.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    )
  }

  // Default: number or text input
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <label className="text-xs text-muted-foreground">{field.label}</label>
        {field.unit && <span className="text-[10px] text-muted-foreground/60">({field.unit})</span>}
        {hasAlert && <AlertTriangle className="size-3 text-orange-400" />}
      </div>
      <input
        type={field.type === "number" || field.type === "computed" ? "number" : "text"}
        step={field.precision ? Math.pow(10, -field.precision) : "any"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.unit ? `en ${field.unit}` : ""}
        className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
      />
      {field.notes && <p className="text-[10px] text-muted-foreground/60">{field.notes}</p>}
    </div>
  )
}
