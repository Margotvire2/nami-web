"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, Alert, CareCase } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { ClipboardList, CheckCircle2, Clock, FileText, Info } from "lucide-react";

// ─── Constantes ──────────────────────────────────────────────────────────────
// [LEGAL] Wording conforme : indicateurs de complétude, jamais "alerte clinique"

const SEVERITY_META: Record<string, { label: string; className: string; order: number }> = {
  CRITICAL: { label: "À traiter en priorité", className: "bg-severity-critical-bg text-severity-critical-foreground border-severity-critical-border", order: 0 },
  HIGH:     { label: "À compléter",           className: "bg-severity-high-bg text-severity-high-foreground border-severity-high-border",             order: 1 },
  WARNING:  { label: "À vérifier",            className: "bg-severity-warning-bg text-severity-warning-foreground border-severity-warning-border",    order: 2 },
  INFO:     { label: "Information",            className: "bg-severity-info-bg text-severity-info-foreground border-severity-info-border",             order: 3 },
};

const ALERT_TYPE_LABEL: Record<string, string> = {
  PATIENT_INACTIVE: "Activité patient à vérifier",
  NO_FOLLOW_UP_SCHEDULED: "Prochain rendez-vous à planifier",
  MISSING_DOCUMENT: "Document à compléter",
  SYMPTOM_ESCALATION: "Élément à documenter",
  INCOMPLETE_CARE_TEAM: "Équipe à compléter",
  OVERDUE_TASK: "Tâche en retard",
  REFERRAL_PENDING_TOO_LONG: "Adressage en attente de réponse",
};

const STATUS_TABS = [
  { key: "OPEN", label: "Ouvertes" },
  { key: "ACKNOWLEDGED", label: "Vues" },
  { key: "RESOLVED", label: "Résolues" },
  { key: "all", label: "Toutes" },
] as const;

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AlertesPage() {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("OPEN");

  // Charger les care cases + alertes de chacun
  const { data: cases, isLoading: loadingCases } = useQuery({
    queryKey: ["care-cases", "all"],
    queryFn: () => api.careCases.list(),
  });

  const caseIds = useMemo(() => (cases ?? []).map((c) => c.id), [cases]);

  const { data: allAlerts, isLoading: loadingAlerts } = useQuery({
    queryKey: ["alerts", "all", caseIds],
    queryFn: async () => {
      const results = await Promise.all(
        caseIds.map(async (id) => {
          const alerts = await api.alerts.list(id);
          return alerts.map((a) => ({ ...a, _careCaseId: id }));
        })
      );
      return results.flat();
    },
    enabled: caseIds.length > 0,
  });

  const isLoading = loadingCases || loadingAlerts;
  const alerts = allAlerts ?? [];

  // Filtrage
  const filtered = useMemo(() => {
    const list = statusFilter === "all" ? alerts : alerts.filter((a) => a.status === statusFilter);
    return list.sort((a, b) => {
      const sa = SEVERITY_META[a.severity]?.order ?? 9;
      const sb = SEVERITY_META[b.severity]?.order ?? 9;
      if (sa !== sb) return sa - sb;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [alerts, statusFilter]);

  // Lookup care case
  const caseMap = useMemo(() => {
    const m = new Map<string, CareCase>();
    for (const c of cases ?? []) m.set(c.id, c);
    return m;
  }, [cases]);

  // Compteurs
  const openCount = alerts.filter((a) => a.status === "OPEN").length;
  const criticalCount = alerts.filter((a) => a.status === "OPEN" && (a.severity === "CRITICAL" || a.severity === "HIGH")).length;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-muted/10">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-semibold flex items-center gap-2">
              <ClipboardList size={16} /> Organisation des dossiers
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Indicateurs de complétude de vos dossiers patients
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            {openCount > 0 && <span className="text-foreground font-medium">{openCount} élément{openCount > 1 ? "s" : ""} à traiter</span>}
            {criticalCount > 0 && <span className="text-amber-600 font-semibold">{criticalCount} prioritaire{criticalCount > 1 ? "s" : ""}</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-card px-6 shrink-0">
        <div className="flex">
          {STATUS_TABS.map((t) => {
            const count = t.key === "all" ? alerts.length : alerts.filter((a) => a.status === t.key).length;
            return (
              <button
                key={t.key}
                onClick={() => setStatusFilter(t.key)}
                className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px flex items-center gap-1.5 ${
                  statusFilter === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                    statusFilter === t.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <CheckCircle2 size={28} className="text-green-400 mb-3" />
            <p className="text-sm font-medium text-green-600 mb-1">
              Tous les éléments du dossier sont à jour
            </p>
            <p className="text-xs text-muted-foreground">
              Aucun élément de complétude ne nécessite votre attention.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-4 space-y-2">
            {filtered.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert as Alert & { _careCaseId: string }}
                careCase={caseMap.get((alert as Alert & { _careCaseId: string })._careCaseId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Carte alerte ────────────────────────────────────────────────────────────

function AlertCard({ alert, careCase }: {
  alert: Alert & { _careCaseId: string };
  careCase?: CareCase;
}) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const qc = useQueryClient();

  const ack = useMutation({
    mutationFn: () => api.alerts.update(alert._careCaseId, alert.id, { status: "ACKNOWLEDGED" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["alerts"] }); toast.success("Alerte acquittée"); },
  });

  const resolve = useMutation({
    mutationFn: () => api.alerts.update(alert._careCaseId, alert.id, { status: "RESOLVED" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["alerts"] }); toast.success("Alerte résolue"); },
  });

  const sevMeta = SEVERITY_META[alert.severity] ?? SEVERITY_META.INFO;
  const typeLabel = ALERT_TYPE_LABEL[alert.alertType] ?? alert.alertType;
  const isOpen = alert.status === "OPEN";
  const isAcked = alert.status === "ACKNOWLEDGED";

  return (
    <div className={`rounded-xl border bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${
      isOpen ? "border-l-[3px]" : ""
    } ${isOpen && alert.severity === "CRITICAL" ? "border-l-red-500" : isOpen && alert.severity === "HIGH" ? "border-l-orange-400" : isOpen ? "border-l-yellow-400" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${sevMeta.className}`}>
              {sevMeta.label}
            </span>
            <span className="text-[10px] text-muted-foreground">{typeLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium">{alert.title}</p>
            <span title="Indicateur de complétude du dossier — non clinique" className="cursor-help">
              <Info size={12} className="text-muted-foreground/50" />
            </span>
          </div>
          {alert.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{alert.description}</p>}

          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
            {careCase && (
              <Link href={`/patients/${careCase.id}`} className="hover:text-foreground flex items-center gap-1">
                <FileText size={10} /> {careCase.patient.firstName} {careCase.patient.lastName}
              </Link>
            )}
            <span className="flex items-center gap-1">
              <Clock size={10} /> {new Date(alert.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isOpen && (
            <Button size="sm" variant="outline" className="text-[10px] h-7 px-2" onClick={() => ack.mutate()} disabled={ack.isPending}>
              Vu
            </Button>
          )}
          {(isOpen || isAcked) && (
            <Button size="sm" variant="outline" className="text-[10px] h-7 px-2 text-green-600" onClick={() => resolve.mutate()} disabled={resolve.isPending}>
              Résolu
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
