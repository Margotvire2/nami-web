"use client"

import { AlertTriangle, AlertCircle, CheckCircle2, TrendingDown, TrendingUp, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import telesurveillanceData from "@/lib/data/telesurveillance-tca.json"

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

// Find alert thresholds for a given metric from telesurveillance data
function findAlerts(metricKey: string): { condition: string; severity: string; message: string }[] {
  const allAlerts: { condition: string; severity: string; message: string }[] = []
  for (const pro of telesurveillanceData.professionals) {
    for (const ds of pro.datasets) {
      for (const field of ds.fields) {
        if (field.id === metricKey && "alerts" in field && field.alerts) {
          allAlerts.push(...(field.alerts as any[]))
        }
      }
    }
  }
  return allAlerts
}

function isAlertTriggered(metricKey: string, value: number | string | boolean): string | null {
  const alerts = findAlerts(metricKey)
  for (const alert of alerts) {
    if (typeof value === "number") {
      const match = alert.condition.match(/([<>]=?)\s*([\d.]+)/)
      if (match) {
        const op = match[1]
        const threshold = parseFloat(match[2])
        if (
          (op === "<" && value < threshold) ||
          (op === "<=" && value <= threshold) ||
          (op === ">" && value > threshold) ||
          (op === ">=" && value >= threshold)
        ) {
          return alert.severity
        }
      }
    }
    if (typeof value === "boolean" && alert.condition === "true" && value) {
      return alert.severity
    }
  }
  return null
}

export function ObservationDashboard({ latestByDomain, alerts }: ObservationDashboardProps) {
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
            <CardContent className="pt-2">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {latestByDomain[domain].map((obs) => {
                  const alertSeverity = typeof obs.value === "number" || typeof obs.value === "boolean"
                    ? isAlertTriggered(obs.metricKey, obs.value)
                    : null

                  return (
                    <div
                      key={obs.metricKey}
                      className={cn(
                        "rounded-lg border p-2",
                        alertSeverity === "critical" && "border-red-300 bg-red-50 dark:bg-red-950/20",
                        alertSeverity === "high" && "border-orange-300 bg-orange-50 dark:bg-orange-950/20"
                      )}
                    >
                      <p className="text-[10px] text-muted-foreground truncate">{obs.label}</p>
                      <p className="text-lg font-semibold tabular-nums">
                        {typeof obs.value === "boolean"
                          ? obs.value ? "Oui" : "Non"
                          : obs.value}
                        {obs.unit && <span className="text-xs font-normal text-muted-foreground ml-0.5">{obs.unit}</span>}
                      </p>
                      <p className="text-[9px] text-muted-foreground/60">
                        {new Date(obs.effectiveAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  )
                })}
              </div>
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
