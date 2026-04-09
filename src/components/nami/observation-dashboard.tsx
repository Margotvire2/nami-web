"use client"

import { AlertTriangle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KEY_TO_METRIC, interpretValue } from "@/lib/metricCatalog"

interface LatestObservation {
  metricKey: string
  label: string
  value: number | string | boolean
  unit?: string
  effectiveAt: string
  source: string
}

interface ObservationDashboardProps {
  latestByDomain: Record<string, LatestObservation[]>
  alerts: { title: string; severity: string; status: string }[]
  patientSex?: "MALE" | "FEMALE"
  patientAge?: number
}

const domainLabels: Record<string, string> = {
  anthropometry: "Anthropométrie",
  vital: "Constantes vitales",
  biology: "Biologie",
  ecg: "ECG",
  puberty: "Puberté",
  gynecology: "Cycles",
  bone: "Osseux",
  psychiatric: "Psychiatrique",
  nutrition_behavior: "Comportement alimentaire",
  psychomotor: "Psychomotricité",
  psychology: "Psychologie",
  dental: "Dentaire",
  nursing: "IDE",
}

const domainOrder = [
  "anthropometry", "vital", "biology", "ecg",
  "nutrition_behavior", "psychiatric", "psychology",
  "psychomotor", "puberty", "gynecology", "bone", "dental", "nursing",
]

const severityColors: Record<string, string> = {
  CRITICAL: "border-red-300 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  HIGH: "border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
  WARNING: "border-yellow-300 bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
  INFO: "border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
}

const INTERP_DOT: Record<string, string> = {
  green: "bg-emerald-500",
  orange: "bg-amber-500",
  red: "bg-red-500",
  gray: "bg-gray-300",
}

const INTERP_BADGE: Record<string, string> = {
  green: "text-emerald-600 bg-emerald-50",
  orange: "text-amber-600 bg-amber-50",
  red: "text-red-600 bg-red-50",
  gray: "text-gray-400",
}

export function ObservationDashboard({ latestByDomain, alerts, patientSex, patientAge }: ObservationDashboardProps) {
  const openAlerts = alerts.filter((a) => a.status === "OPEN")

  return (
    <div className="space-y-4">
      {/* Active alerts */}
      {openAlerts.length > 0 && (
        <Card size="sm" className="border-red-200 bg-red-50/50 dark:bg-red-950/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="size-4" />
              {openAlerts.length} alerte{openAlerts.length > 1 ? "s" : ""} active{openAlerts.length > 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {openAlerts.map((alert, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-2 rounded-lg border p-2 text-sm",
                  severityColors[alert.severity] || severityColors.INFO
                )}
              >
                {alert.severity === "CRITICAL" ? (
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                ) : (
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                )}
                <div>
                  <p className="font-medium">{alert.title}</p>
                  <Badge variant="outline" className="mt-1 text-[10px]">{alert.severity}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Metrics by domain */}
      {domainOrder
        .filter((d) => latestByDomain[d] && latestByDomain[d].length > 0)
        .map((domain) => (
          <Card key={domain} size="sm">
            <CardHeader className="border-b py-2">
              <CardTitle className="text-xs">{domainLabels[domain] || domain}</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-0.5">
              {latestByDomain[domain].map((obs) => {
                const def = KEY_TO_METRIC[obs.metricKey]
                const numericValue = typeof obs.value === "number" ? obs.value : null
                const interp = def && numericValue != null
                  ? interpretValue(numericValue, def, patientSex, patientAge)
                  : { color: "gray" as const, label: "—", rangeStr: "" }

                return (
                  <div key={obs.metricKey} className="flex items-center gap-2 text-sm py-1 px-1 rounded hover:bg-muted/30 transition-colors">
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", INTERP_DOT[interp.color])} />
                    <span className="text-muted-foreground truncate flex-1 text-xs">
                      {def?.label ?? obs.label}
                    </span>
                    <span className="font-semibold whitespace-nowrap tabular-nums">
                      {typeof obs.value === "boolean"
                        ? obs.value ? "Oui" : "Non"
                        : typeof obs.value === "number"
                          ? obs.value % 1 === 0 ? obs.value : obs.value.toFixed(2)
                          : obs.value}
                      {(obs.unit || def?.unit) && (
                        <span className="text-xs font-normal text-muted-foreground ml-0.5">
                          {obs.unit ?? def?.unit ?? ""}
                        </span>
                      )}
                    </span>
                    {interp.rangeStr && (
                      <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                        ({interp.rangeStr})
                      </span>
                    )}
                    {interp.label !== "—" && (
                      <span className={cn(
                        "text-[9px] font-medium px-1 py-0.5 rounded whitespace-nowrap",
                        INTERP_BADGE[interp.color]
                      )}>
                        {interp.label}
                      </span>
                    )}
                    <span className="text-[9px] text-muted-foreground/50 whitespace-nowrap">
                      {new Date(obs.effectiveAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        ))}

      {/* Empty state */}
      {Object.keys(latestByDomain).length === 0 && openAlerts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Aucune observation enregistrée pour ce patient.</p>
          <p className="text-xs mt-1">Les données apparaîtront ici après la première saisie.</p>
        </div>
      )}
    </div>
  )
}
