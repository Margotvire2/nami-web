"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, CareCase, type ObservationRecord } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { NamiCard } from "@/components/ui/NamiCard";
import { ShimmerCard } from "@/components/ui/shimmer";
import { CompletenessPlant, computeCompleteness } from "@/components/ui/CompletenessPlant";
import Link from "next/link";
import { Search, ChevronRight, Users, Plus, Upload, LayoutGrid, LayoutList, TrendingUp, TrendingDown, Minus, Download, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ImportModal from "./import/import-modal";
import PatientsEmptyState from "./empty-state";
import { CreatePatientModal } from "./create-patient-modal";
import type { ImportResult } from "./import/import.types";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const RISK_STYLE: Record<string, string> = {
  CRITICAL: "text-severity-critical font-semibold",
  HIGH: "text-severity-high font-semibold",
  MEDIUM: "text-severity-warning",
  LOW: "text-severity-success",
  UNKNOWN: "text-muted-foreground",
};

const RISK_DOT: Record<string, string> = {
  CRITICAL: "bg-severity-critical",
  HIGH: "bg-severity-high",
  MEDIUM: "bg-severity-warning",
  LOW: "bg-severity-success",
  UNKNOWN: "bg-muted-foreground/40",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Actif",
  PAUSED: "En pause",
  CLOSED: "Fermé",
  ARCHIVED: "Archivé",
};

const TABS = [
  { key: "all",      label: "Tous",                 filter: (c: CareCase) => true },
  { key: "active",   label: "Actifs",                filter: (c: CareCase) => c.status === "ACTIVE" },
  { key: "critical", label: "À surveiller",          filter: (c: CareCase) => ["CRITICAL", "HIGH"].includes(c.riskLevel) && c.status === "ACTIVE" },
  { key: "paused",   label: "En pause",              filter: (c: CareCase) => c.status === "PAUSED" },
  { key: "closed",   label: "Fermés",                filter: (c: CareCase) => c.status === "CLOSED" || c.status === "ARCHIVED" },
];

export default function PatientsPage() {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("active");
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [activityFilter, setActivityFilter] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const { data: cases, isLoading } = useQuery({
    queryKey: ["care-cases", "all"],
    queryFn: () => api.careCases.list(),
  });

  const allCases = cases ?? [];

  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];

  const now = Date.now();
  const filtered = allCases
    .filter(activeTab.filter)
    .filter((c) => {
      if (riskFilter && c.riskLevel !== riskFilter) return false;
      if (typeFilter && c.caseType !== typeFilter) return false;
      if (activityFilter) {
        const daysAgo = c.lastActivityAt
          ? Math.floor((now - new Date(c.lastActivityAt).getTime()) / 86400000)
          : null;
        if (activityFilter === "recent"  && (daysAgo === null || daysAgo > 7))   return false;
        if (activityFilter === "medium"  && (daysAgo === null || daysAgo <= 7 || daysAgo > 30)) return false;
        if (activityFilter === "stale"   && (daysAgo === null || daysAgo <= 30)) return false;
        if (activityFilter === "never"   && daysAgo !== null)                    return false;
      }
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        c.patient.firstName.toLowerCase().includes(q) ||
        c.patient.lastName.toLowerCase().includes(q) ||
        c.caseTitle.toLowerCase().includes(q) ||
        c.caseType.toLowerCase().includes(q)
      );
    })
    .sort((a, b) =>
      (b.lastActivityAt ?? b.startDate) > (a.lastActivityAt ?? a.startDate) ? 1 : -1
    );

  const types = [...new Set(allCases.map((c) => c.caseType))];

  const stalePatients = allCases.filter((c) => {
    if (c.status !== "ACTIVE") return false;
    if (!c.lastActivityAt) return true;
    return Math.floor((now - new Date(c.lastActivityAt).getTime()) / 86400000) > 7;
  });

  function exportCSV() {
    const headers = ["Nom", "Prénom", "Date de naissance", "Pathologie", "Statut", "Indicateur", "Ouverture dossier", "Dernière activité", "Membres équipe"];
    const RISK_FR: Record<string, string> = { CRITICAL: "Critique", HIGH: "Élevé", MEDIUM: "Modéré", LOW: "Faible", UNKNOWN: "Inconnu" };
    const STATUS_FR: Record<string, string> = { ACTIVE: "Actif", PAUSED: "En pause", CLOSED: "Fermé", ARCHIVED: "Archivé" };
    const rows = filtered.map((c) => [
      c.patient.lastName,
      c.patient.firstName,
      c.patient.birthDate ? new Date(c.patient.birthDate).toLocaleDateString("fr-FR") : "",
      c.caseType,
      STATUS_FR[c.status] ?? c.status,
      RISK_FR[c.riskLevel] ?? c.riskLevel,
      new Date(c.startDate).toLocaleDateString("fr-FR"),
      c.lastActivityAt ? new Date(c.lastActivityAt).toLocaleDateString("fr-FR") : "",
      String(c._count.members),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${v.replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `patients-nami-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-card px-8 py-6 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-page-title">Patients</h1>
            <p className="text-caption text-muted-foreground mt-1">
              {isLoading ? "…" : `${filtered.length} dossier${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un patient…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs w-56"
              />
            </div>
            <div className="flex items-center border rounded h-8 overflow-hidden">
              <button onClick={() => setViewMode("table")} className={`px-2 h-full flex items-center transition-colors ${viewMode === "table" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}><LayoutList size={13} /></button>
              <button onClick={() => setViewMode("cards")} className={`px-2 h-full flex items-center transition-colors ${viewMode === "cards" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}><LayoutGrid size={13} /></button>
            </div>
            <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8" onClick={exportCSV} disabled={filtered.length === 0} title={`Exporter ${filtered.length} dossier(s) en CSV`}>
              <Download size={12} /> Export CSV
            </Button>
            <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8" onClick={() => setImportOpen(true)}>
              <Upload size={12} /> Importer
            </Button>
            <Button size="sm" className="text-xs gap-1.5 h-8" onClick={() => setCreateOpen(true)}>
              <Plus size={12} /> Nouveau patient
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs + filtres */}
      <div className="bg-card px-6 shrink-0">
        <div className="flex items-end justify-between gap-4">
          {/* Onglets avec underline animé */}
          <div className="nami-tabs flex-1" style={{ borderBottom: "1px solid #E8ECF4" }}>
            {TABS.map((t) => {
              const count = allCases.filter(t.filter).length;
              const isActive = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`nami-tab flex items-center gap-1.5${isActive ? " active" : ""}`}
                >
                  {t.label}
                  {count > 0 && (
                    <span className={`min-w-[16px] h-[16px] px-0.5 rounded-full text-[9px] font-bold flex items-center justify-center ${
                      isActive ? "bg-[#5B4EC4] text-white" : "bg-[#E8ECF4] text-[#94A3B8]"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Filtres rapides */}
          <div className="flex items-center gap-2 pb-1.5">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="text-xs border border-[#E8ECF4] rounded-lg px-2 py-1 bg-white text-[#64748B] h-7 focus:outline-none focus:border-[#5B4EC4]"
            >
              <option value="">Risque</option>
              {([["CRITICAL", "Critique"], ["HIGH", "Élevé"], ["MEDIUM", "Modéré"], ["LOW", "Faible"], ["UNKNOWN", "Inconnu"]] as const).map(([r, label]) => (
                <option key={r} value={r}>{label}</option>
              ))}
            </select>
            {types.length > 0 && (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs border border-[#E8ECF4] rounded-lg px-2 py-1 bg-white text-[#64748B] h-7 focus:outline-none focus:border-[#5B4EC4]"
              >
                <option value="">Pathologie</option>
                {types.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="text-xs border border-[#E8ECF4] rounded-lg px-2 py-1 bg-white text-[#64748B] h-7 focus:outline-none focus:border-[#5B4EC4]"
            >
              <option value="">Activité</option>
              <option value="recent">Active &lt; 7j</option>
              <option value="medium">7 à 30j sans activité</option>
              <option value="stale">&gt; 30j sans activité</option>
              <option value="never">Jamais d&apos;activité</option>
            </select>
          </div>
        </div>
      </div>

      {/* Widget patients inactifs > 7j */}
      {!isLoading && stalePatients.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-2.5 shrink-0 flex items-center gap-3">
          <div className="flex items-center gap-2 text-amber-700 shrink-0">
            <Clock size={13} className="shrink-0" />
            <span className="text-xs font-semibold">{stalePatients.length} patient{stalePatients.length > 1 ? "s" : ""} actif{stalePatients.length > 1 ? "s" : ""} sans activité depuis &gt; 7j</span>
          </div>
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {stalePatients.slice(0, 5).map((c) => (
              <span key={c.id} className="text-[11px] text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full truncate max-w-[120px]">
                {c.patient.firstName} {c.patient.lastName}
              </span>
            ))}
            {stalePatients.length > 5 && (
              <span className="text-[11px] text-amber-500">+{stalePatients.length - 5}</span>
            )}
          </div>
          <button
            onClick={() => { setTab("active"); setActivityFilter("stale"); }}
            className="shrink-0 text-[11px] font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors"
          >
            Voir tous →
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          viewMode === "cards" ? (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <ShimmerCard key={i} />)}
            </div>
          ) : (
            <div className="p-6 space-y-2">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
            </div>
          )
        ) : allCases.length === 0 ? (
          <PatientsEmptyState
            onImport={() => setImportOpen(true)}
            onCreateManual={() => setCreateOpen(true)}
          />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Users size={24} className="text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Aucun dossier trouvé.</p>
          </div>
        ) : viewMode === "cards" ? (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((c, idx) => (
              <div key={c.id} className="nami-stagger-item" style={{ animationDelay: `${idx * 0.05}s` }}>
                <PatientCard careCase={c} />
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/20 sticky top-0">
              <tr>
                <th className="text-left px-6 py-2.5 text-xs font-medium text-muted-foreground">Patient</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Type de suivi</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Statut</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Risque</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Équipe</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Dernier événement</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((c) => (
                <PatientRow key={c.id} careCase={c} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={(result: ImportResult) => {
          toast.success(`${result.success} patient${result.success !== 1 ? "s" : ""} importé${result.success !== 1 ? "s" : ""}`);
          queryClient.invalidateQueries({ queryKey: ["care-cases"] });
        }}
      />
      <CreatePatientModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

function PatientRow({ careCase: c }: { careCase: CareCase }) {
  return (
    <tr className="hover:bg-muted/30 transition-colors group cursor-pointer">
      <td className="px-6 py-3">
        <Link href={`/patients/${c.id}`} className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-semibold text-primary shrink-0">
            {c.patient.firstName[0]}{c.patient.lastName[0]}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">
              {c.patient.firstName} {c.patient.lastName}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">{c.caseTitle}</p>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3">
        <Link href={`/patients/${c.id}`}>
          <span className="text-xs text-muted-foreground">{c.caseType}</span>
        </Link>
      </td>
      <td className="px-4 py-3">
        <Link href={`/patients/${c.id}`}>
          <span className="text-xs">{STATUS_LABEL[c.status] ?? c.status}</span>
        </Link>
      </td>
      <td className="px-4 py-3">
        <Link href={`/patients/${c.id}`}>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${RISK_DOT[c.riskLevel]}`} />
            <span className={`text-xs ${RISK_STYLE[c.riskLevel]}`}>{({ CRITICAL: "Critique", HIGH: "Élevé", MEDIUM: "Modéré", LOW: "Faible", UNKNOWN: "Inconnu" })[c.riskLevel] ?? c.riskLevel}</span>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3">
        <Link href={`/patients/${c.id}`}>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users size={11} />
            {c._count.members}
          </div>
        </Link>
      </td>
      <td className="px-4 py-3">
        <Link href={`/patients/${c.id}`}>
          <span className="text-xs text-muted-foreground">
            {c.lastActivityAt ? daysAgo(c.lastActivityAt) : "—"}
          </span>
        </Link>
      </td>
      <td className="px-4 py-3 text-right">
        <Link href={`/patients/${c.id}`}>
          <ChevronRight size={14} className="text-muted-foreground/0 group-hover:text-muted-foreground/50 ml-auto transition-colors" />
        </Link>
      </td>
    </tr>
  );
}

function daysAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "aujourd'hui";
  if (days === 1) return "hier";
  return `il y a ${days}j`;
}

// ─── Patient Card (vue grille) ────────────────────────────────────────────────

const RISK_BADGE: Record<string, string> = {
  CRITICAL: "bg-red-50 text-red-700 border-red-200",
  HIGH:     "bg-orange-50 text-orange-700 border-orange-200",
  MEDIUM:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  LOW:      "bg-green-50 text-green-700 border-green-200",
  UNKNOWN:  "bg-muted text-muted-foreground border-border",
};
const RISK_LABEL: Record<string, string> = {
  CRITICAL: "Critique", HIGH: "Élevé", MEDIUM: "Modéré", LOW: "Faible", UNKNOWN: "Inconnu",
};
const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700", "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",    "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
];
function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function PatientCard({ careCase: c }: { careCase: CareCase }) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);

  const { data: obsData } = useQuery({
    queryKey: ["weight-sparkline", c.id],
    queryFn: () => api.observations.list(c.id, { metricKey: "weight_kg", limit: 8 }),
    staleTime: 5 * 60 * 1000,
    enabled: !!accessToken,
  });

  const points = (obsData?.observations ?? [] as ObservationRecord[])
    .filter((o) => o.valueNumeric !== null)
    .sort((a, b) => new Date(a.effectiveAt).getTime() - new Date(b.effectiveAt).getTime())
    .map((o) => ({ v: o.valueNumeric as number }));

  const currentWeight = points.length > 0 ? points[points.length - 1].v : null;
  const delta = points.length >= 2 ? +(points[points.length - 1].v - points[0].v).toFixed(1) : null;

  const TrendIcon = delta === null ? null : delta > 0.5 ? TrendingUp : delta < -0.5 ? TrendingDown : Minus;
  const trendColor = delta === null ? "" : delta > 0.5 ? "text-orange-500" : delta < -0.5 ? "text-green-600" : "text-blue-500";

  return (
    <Link href={`/patients/${c.id}`}>
      <NamiCard variant="depth" padding="none" className="p-4 cursor-pointer group">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${avatarColor(c.patient.firstName + c.patient.lastName)}`}>
              {c.patient.firstName[0]}{c.patient.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{c.patient.firstName} {c.patient.lastName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{c.caseType}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CompletenessPlant
              percentage={computeCompleteness(c)}
              size={36}
              showTooltip={true}
            />
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${RISK_BADGE[c.riskLevel]}`}>
              {RISK_LABEL[c.riskLevel]}
            </span>
          </div>
        </div>

        {/* Sparkline poids */}
        <div className="mb-3 h-10">
          {points.length >= 3 ? (
            <ResponsiveContainer width="100%" height={40}>
              <AreaChart data={points} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                <defs>
                  <linearGradient id={`grad-${c.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#4F46E5" strokeWidth={1.5} fill={`url(#grad-${c.id})`} dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-10 flex items-center">
              <div className="w-full border-t border-dashed border-border/60" />
            </div>
          )}
        </div>

        {/* Indicateurs clés */}
        <div className="flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-3">
            {currentWeight !== null ? (
              <span className="font-semibold text-foreground">{currentWeight} kg</span>
            ) : (
              <span className="text-muted-foreground">— kg</span>
            )}
            {TrendIcon && delta !== null && (
              <span className={`flex items-center gap-0.5 font-medium ${trendColor}`}>
                <TrendIcon size={11} />
                {delta > 0 ? "+" : ""}{delta} kg
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1"><Users size={11} />{c._count.members}</span>
            <span>{c.lastActivityAt ? daysAgo(c.lastActivityAt) : "jamais"}</span>
          </div>
        </div>
      </NamiCard>
    </Link>
  );
}
