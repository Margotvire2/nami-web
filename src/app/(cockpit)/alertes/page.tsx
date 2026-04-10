"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, Alert } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import {
  ClipboardList, CheckCircle2, Clock, ExternalLink,
  Bell, AlertTriangle, Info, ChevronDown, ChevronRight,
  Eye, X, Shield,
} from "lucide-react";
import { EmptyState } from "@/components/nami/EmptyState";

// ─── Constantes ───────────────────────────────────────────────────────────────
// [LEGAL] Wording conforme MDR : indicateurs de complétude, jamais "alerte clinique"

const SEVERITY_CONFIG: Record<string, {
  label: string; groupLabel: string; icon: React.FC<{ size?: number; className?: string }>;
  borderColor: string; bgColor: string; textColor: string; badgeCls: string; order: number;
}> = {
  CRITICAL: {
    label: "Prioritaire", groupLabel: "À traiter en priorité",
    icon: (p) => <AlertTriangle {...p} />,
    borderColor: "border-l-red-500", bgColor: "bg-red-50/60", textColor: "text-red-700",
    badgeCls: "bg-red-100 text-red-700 border border-red-200",
    order: 0,
  },
  HIGH: {
    label: "Important", groupLabel: "À compléter",
    icon: (p) => <Shield {...p} />,
    borderColor: "border-l-orange-400", bgColor: "bg-orange-50/50", textColor: "text-orange-700",
    badgeCls: "bg-orange-100 text-orange-700 border border-orange-200",
    order: 1,
  },
  WARNING: {
    label: "À vérifier", groupLabel: "À vérifier",
    icon: (p) => <Clock {...p} />,
    borderColor: "border-l-yellow-400", bgColor: "bg-yellow-50/40", textColor: "text-yellow-700",
    badgeCls: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    order: 2,
  },
  INFO: {
    label: "Information", groupLabel: "Pour information",
    icon: (p) => <Info {...p} />,
    borderColor: "border-l-blue-300", bgColor: "bg-blue-50/30", textColor: "text-blue-600",
    badgeCls: "bg-blue-100 text-blue-600 border border-blue-200",
    order: 3,
  },
};

// Règles → label MDR-safe
const TRIGGER_LABELS: Record<string, string> = {
  TCA_POTASSIUM_BAS: "Kaliémie",
  TCA_POTASSIUM_CRITIQUE: "Kaliémie critique",
  TCA_BRADYCARDIE: "Fréquence cardiaque",
  TCA_BRADYCARDIE_CRITIQUE: "Fréquence cardiaque critique",
  TCA_HYPOTHERMIE: "Température",
  TCA_HYPOTHERMIE_CRITIQUE: "Température critique",
  TCA_IMC_BAS: "IMC",
  TCA_IMC_CRITIQUE: "IMC critique",
  TCA_PHOSPHORE_BAS: "Phosphore",
  TCA_PHOSPHORE_CRITIQUE: "Phosphore critique",
  TCA_HYPOGLYCEMIE: "Glycémie",
  TCA_ALBUMINE_BASSE: "Albumine",
  TCA_HYPONATREMIE: "Sodium",
  TCA_HYPONATREMIE_CRITIQUE: "Sodium critique",
  TCA_HYPOTENSION: "Tension artérielle",
  TCA_NEUTROPENIE: "Neutrophiles",
  TCA_MAGNESIUM_BAS: "Magnésium",
  TCA_PERTE_POIDS_5PCT: "Évolution pondérale",
  OBE_HBA1C_ELEVE: "HbA1c",
  OBE_HBA1C_TRES_ELEVE: "HbA1c critique",
  OBE_GLYCEMIE_DIABETE: "Glycémie à jeun",
  OBE_TRIGLYCERIDES_ELEVES: "Triglycérides",
  OBE_HDL_BAS: "HDL",
  OBE_TA_ELEVEE: "Tension artérielle",
  OBE_TA_CRITIQUE: "Tension artérielle critique",
  OBE_HOMA_IR_ELEVE: "HOMA-IR",
  OBE_LDL_ELEVE: "LDL",
  OBE_HYPERURICEMIE: "Acide urique",
  OBE_ALAT_NASH: "ALAT",
  OBE_PRISE_POIDS_5PCT: "Évolution pondérale",
  OBE_NUTRITION_ABSENTE: "Suivi nutritionnel",
};

const STATUS_TABS = [
  { key: "OPEN",         label: "Ouvertes" },
  { key: "ACKNOWLEDGED", label: "Vues" },
  { key: "RESOLVED",     label: "Résolues" },
  { key: "all",          label: "Toutes" },
] as const;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "il y a moins d'1h";
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `il y a ${d}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AlertesPage() {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("OPEN");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const { data: allAlerts = [], isLoading } = useQuery({
    queryKey: ["alerts", "global", statusFilter],
    queryFn: () => api.alerts.listAll(statusFilter !== "all" ? { status: statusFilter } : {}),
    staleTime: 30_000,
  });

  // Compteurs pour les tabs
  const { data: countData = [] } = useQuery({
    queryKey: ["alerts", "global", "all"],
    queryFn: () => api.alerts.listAll(),
    staleTime: 30_000,
  });

  const tabCounts = useMemo(() => {
    const m: Record<string, number> = { all: countData.length };
    for (const a of countData) m[a.status] = (m[a.status] ?? 0) + 1;
    return m;
  }, [countData]);

  // Stats header
  const criticalOpen = allAlerts.filter((a) => a.status === "OPEN" && a.severity === "CRITICAL").length;
  const highOpen = allAlerts.filter((a) => a.status === "OPEN" && a.severity === "HIGH").length;

  // Grouper par sévérité
  const grouped = useMemo(() => {
    const groups: Record<string, Alert[]> = {};
    for (const a of allAlerts) {
      if (!groups[a.severity]) groups[a.severity] = [];
      groups[a.severity].push(a);
    }
    return Object.entries(groups).sort(
      ([sa], [sb]) => (SEVERITY_CONFIG[sa]?.order ?? 9) - (SEVERITY_CONFIG[sb]?.order ?? 9)
    );
  }, [allAlerts]);

  // Mutation bulk acknowledge (groupe entier)
  const bulkAck = useMutation({
    mutationFn: async (alerts: Alert[]) => {
      await Promise.all(
        alerts
          .filter((a) => a.status === "OPEN")
          .map((a) => api.alerts.update(a.careCaseId, a.id, { status: "ACKNOWLEDGED" }))
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      toast.success("Groupe acquitté");
    },
  });

  const toggleGroup = (sev: string) =>
    setCollapsed((c) => ({ ...c, [sev]: !c[sev] }));

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
              Indicateurs de complétude et données à vérifier sur vos patients
            </p>
          </div>
          {/* Stats */}
          <div className="flex items-center gap-3 text-[11px]">
            {criticalOpen > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-100 text-red-700 font-semibold">
                <AlertTriangle size={11} /> {criticalOpen} prioritaire{criticalOpen > 1 ? "s" : ""}
              </span>
            )}
            {highOpen > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-100 text-orange-700 font-medium">
                <Shield size={11} /> {highOpen} important{highOpen > 1 ? "s" : ""}
              </span>
            )}
            {criticalOpen === 0 && highOpen === 0 && allAlerts.filter(a => a.status === "OPEN").length === 0 && (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <CheckCircle2 size={11} /> Tous les dossiers sont à jour
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-card px-6 shrink-0">
        <div className="flex">
          {STATUS_TABS.map((t) => {
            const count = tabCounts[t.key] ?? 0;
            return (
              <button
                key={t.key}
                onClick={() => setStatusFilter(t.key)}
                className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px flex items-center gap-1.5 ${
                  statusFilter === t.key
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
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

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : grouped.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Aucun élément à traiter"
            description={statusFilter === "OPEN"
              ? "Tous les dossiers sont à jour — aucun indicateur actif."
              : "Aucun élément dans cette catégorie."}
          />
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-5 space-y-5">
            {grouped.map(([severity, alerts]) => {
              const cfg = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.INFO;
              const isCollapsed = collapsed[severity];
              const openInGroup = alerts.filter((a) => a.status === "OPEN").length;

              return (
                <section key={severity}>
                  {/* En-tête groupe */}
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => toggleGroup(severity)}
                      className="flex items-center gap-2 text-xs font-semibold text-foreground hover:text-foreground/80 transition-colors"
                    >
                      <cfg.icon size={13} className={cfg.textColor} />
                      <span>{cfg.groupLabel}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${cfg.badgeCls}`}>
                        {alerts.length}
                      </span>
                      {isCollapsed
                        ? <ChevronRight size={13} className="text-muted-foreground" />
                        : <ChevronDown size={13} className="text-muted-foreground" />}
                    </button>

                    {/* Tout acquitter */}
                    {!isCollapsed && openInGroup > 1 && statusFilter === "OPEN" && (
                      <button
                        onClick={() => bulkAck.mutate(alerts)}
                        disabled={bulkAck.isPending}
                        className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                      >
                        <Eye size={10} /> Tout marquer comme vu
                      </button>
                    )}
                  </div>

                  {/* Cartes */}
                  {!isCollapsed && (
                    <div className="space-y-2">
                      {alerts.map((alert) => (
                        <AlertCard
                          key={alert.id}
                          alert={alert}
                          cfg={cfg}
                          onMutated={() => qc.invalidateQueries({ queryKey: ["alerts"] })}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Carte alerte ─────────────────────────────────────────────────────────────

function AlertCard({
  alert, cfg, onMutated,
}: {
  alert: Alert;
  cfg: typeof SEVERITY_CONFIG[string];
  onMutated: () => void;
}) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);

  const mutate = useMutation({
    mutationFn: (status: string) =>
      api.alerts.update(alert.careCaseId, alert.id, { status }),
    onSuccess: (_, status) => {
      onMutated();
      const labels: Record<string, string> = {
        ACKNOWLEDGED: "Marqué comme vu",
        RESOLVED: "Marqué comme résolu",
        DISMISSED: "Ignoré",
      };
      toast.success(labels[status] ?? "Mis à jour");
    },
  });

  const isOpen = alert.status === "OPEN";
  const isAcked = alert.status === "ACKNOWLEDGED";
  const patient = alert.careCase?.patient;
  const triggerLabel = TRIGGER_LABELS[alert.triggerSource] ?? alert.triggerSource;

  return (
    <div className={`rounded-xl border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4
      ${isOpen ? `border-l-[3px] ${cfg.borderColor}` : "border-border/60"}
    `}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${cfg.badgeCls}`}>
              {cfg.label}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
              {triggerLabel}
            </span>
          </div>

          {/* Titre */}
          <p className="text-sm font-medium leading-snug">{alert.title}</p>

          {/* Description */}
          {alert.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {alert.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground flex-wrap">
            {patient && alert.careCase && (
              <Link
                href={`/patients/${alert.careCase.id}`}
                className="hover:text-foreground flex items-center gap-1 font-medium transition-colors"
              >
                <ExternalLink size={10} />
                {patient.firstName} {patient.lastName}
              </Link>
            )}
            <span className="flex items-center gap-1">
              <Clock size={10} /> {timeAgo(alert.createdAt)}
            </span>
            {alert.resolvedAt && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 size={10} /> Résolu {timeAgo(alert.resolvedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {(isOpen || isAcked) && (
          <div className="flex flex-col gap-1.5 shrink-0">
            {isOpen && (
              <Button
                size="sm" variant="outline"
                className="text-[10px] h-7 px-2 gap-1"
                onClick={() => mutate.mutate("ACKNOWLEDGED")}
                disabled={mutate.isPending}
              >
                <Eye size={10} /> Vu
              </Button>
            )}
            <Button
              size="sm" variant="outline"
              className="text-[10px] h-7 px-2 gap-1 text-green-600 hover:text-green-700 hover:border-green-300"
              onClick={() => mutate.mutate("RESOLVED")}
              disabled={mutate.isPending}
            >
              <CheckCircle2 size={10} /> Résolu
            </Button>
            <Button
              size="sm" variant="ghost"
              className="text-[10px] h-7 px-2 gap-1 text-muted-foreground hover:text-foreground"
              onClick={() => mutate.mutate("DISMISSED")}
              disabled={mutate.isPending}
            >
              <X size={10} /> Ignorer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
