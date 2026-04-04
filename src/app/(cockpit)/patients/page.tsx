"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, CareCase } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Search, ChevronRight, Users, AlertTriangle, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const [tab, setTab] = useState("active");
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data: cases, isLoading } = useQuery({
    queryKey: ["care-cases", "all"],
    queryFn: () => api.careCases.list(),
  });

  const allCases = cases ?? [];

  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];

  const filtered = allCases
    .filter(activeTab.filter)
    .filter((c) => {
      if (riskFilter && c.riskLevel !== riskFilter) return false;
      if (typeFilter && c.caseType !== typeFilter) return false;
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
            <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8" onClick={() => toast.info("Création de dossier bientôt disponible")}>
              <Plus size={12} /> Nouveau dossier
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs + filtres */}
      <div className="border-b bg-card px-6 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex">
            {TABS.map((t) => {
              const count = allCases.filter(t.filter).length;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px flex items-center gap-1.5 ${
                    tab === t.key
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                  {count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                      tab === t.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Filtres rapides */}
          <div className="flex items-center gap-2 py-1.5">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="text-xs border rounded px-2 py-1 bg-background text-muted-foreground h-7"
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
                className="text-xs border rounded px-2 py-1 bg-background text-muted-foreground h-7"
              >
                <option value="">Type de suivi</option>
                {types.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 space-y-2">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Users size={24} className="text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Aucun dossier trouvé.</p>
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
