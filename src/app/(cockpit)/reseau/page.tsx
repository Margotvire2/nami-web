"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { networkApi, type NetworkPatient } from "@/lib/api";
import Link from "next/link";
import {
  Users,
  CheckSquare,
  CalendarDays,
  Bell,
  Search,
  Filter,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CASE_TYPE_LABELS: Record<string, string> = {
  TCA:          "TCA",
  OBESITY:      "Obésité",
  METABOLIC:    "Métabolique",
  MENTAL_HEALTH: "Santé mentale",
  PEDIATRIC:    "Pédiatrie",
  CHRONIC_PAIN: "Douleur chronique",
  OTHER:        "Autre",
};

const CASE_TYPE_COLORS: Record<string, string> = {
  TCA:          "#7C3AED",
  OBESITY:      "#2563EB",
  METABOLIC:    "#0891B2",
  MENTAL_HEALTH: "#7C3AED",
  PEDIATRIC:    "#059669",
  CHRONIC_PAIN: "#D97706",
  OTHER:        "#64748B",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE:   "Actif",
  ON_HOLD:  "En pause",
  CLOSED:   "Clôturé",
  ARCHIVED: "Archivé",
};

const STATUS_DOT_COLORS: Record<string, string> = {
  ACTIVE:   "#059669",
  ON_HOLD:  "#D97706",
  CLOSED:   "#94A3B8",
  ARCHIVED: "#CBD5E1",
};

function getAge(birthDate: string | null): string {
  if (!birthDate) return "—";
  const birth = new Date(birthDate);
  const diff = Date.now() - birth.getTime();
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return `${years} ans`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  sub?: string;
}) {
  return (
    <div
      className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] px-5 py-4 flex items-center gap-4"
      style={{ boxShadow: "0 1px 4px rgba(26,26,46,0.04)" }}
    >
      <div
        className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
        style={{ background: `${color}15` }}
      >
        <Icon size={18} style={{ color }} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p
          className="text-[22px] font-bold leading-none"
          style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
        >
          {value}
        </p>
        <p className="text-[12px] text-[#64748B] mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-[#94A3B8] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Patient row ──────────────────────────────────────────────────────────────

function PatientRow({ p }: { p: NetworkPatient }) {
  const typeColor = CASE_TYPE_COLORS[p.caseType] ?? "#64748B";
  const dotColor = STATUS_DOT_COLORS[p.status] ?? "#94A3B8";
  const hasOverdue = p.overdueTasksCount > 0;
  const hasAlerts = p.openAlertsCount > 0;
  const todayAppt = p.nextAppointment && isToday(p.nextAppointment.startAt);

  return (
    <Link
      href={`/patients/${p.careCaseId}`}
      className="group flex items-center gap-4 px-4 py-3.5 border-b border-[#F1F5F9] hover:bg-[rgba(91,78,196,0.03)] transition-colors"
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[12px] font-bold text-white shrink-0"
        style={{ background: `linear-gradient(135deg, ${typeColor}CC, ${typeColor}88)` }}
      >
        {p.patient.firstName[0]}{p.patient.lastName[0]}
      </div>

      {/* Patient + cas */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-[13px] font-semibold truncate"
            style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
          >
            {p.patient.firstName} {p.patient.lastName}
          </span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0"
            style={{ background: `${typeColor}15`, color: typeColor }}
          >
            {CASE_TYPE_LABELS[p.caseType] ?? p.caseType}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="inline-flex items-center gap-1 text-[11px]"
            style={{ color: "#64748B" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: dotColor }}
            />
            {STATUS_LABELS[p.status] ?? p.status}
          </span>
          {p.patient.birthDate && (
            <span className="text-[11px] text-[#94A3B8]">
              · {getAge(p.patient.birthDate)}
            </span>
          )}
          {p.careStage && (
            <span className="text-[11px] text-[#94A3B8] truncate">
              · {p.careStage}
            </span>
          )}
        </div>
      </div>

      {/* Indicateurs */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Tâches */}
        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: hasOverdue ? "#D97706" : "#94A3B8" }}>
          <CheckSquare size={13} strokeWidth={1.75} />
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{p.pendingTasksCount}</span>
          {hasOverdue && (
            <span className="text-[10px] font-semibold" style={{ color: "#D97706" }}>
              ({p.overdueTasksCount} en retard)
            </span>
          )}
        </div>

        {/* Alertes */}
        {hasAlerts && (
          <div className="flex items-center gap-1 text-[12px]" style={{ color: "#DC2626" }}>
            <Bell size={12} strokeWidth={1.75} />
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{p.openAlertsCount}</span>
          </div>
        )}

        {/* Prochain RDV */}
        <div
          className="flex items-center gap-1.5 text-[12px] min-w-[100px] justify-end"
          style={{ color: todayAppt ? "#5B4EC4" : "#94A3B8" }}
        >
          <CalendarDays size={13} strokeWidth={1.75} />
          {p.nextAppointment ? (
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              {todayAppt ? (
                <span style={{ color: "#5B4EC4", fontWeight: 600 }}>
                  Auj. {formatTime(p.nextAppointment.startAt)}
                </span>
              ) : (
                formatDate(p.nextAppointment.startAt)
              )}
            </span>
          ) : (
            <span className="text-[11px]">—</span>
          )}
        </div>

        {/* Équipe */}
        <div className="flex items-center gap-1 text-[12px] text-[#94A3B8] min-w-[48px] justify-end">
          <Users size={12} strokeWidth={1.75} />
          <span>{p.teamSize}</span>
        </div>

        <ArrowRight
          size={14}
          className="text-[#CBD5E1] group-hover:text-[#5B4EC4] transition-colors shrink-0"
          strokeWidth={1.75}
        />
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReseauPage() {
  const { accessToken } = useAuthStore();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ACTIVE");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["network-overview"],
    queryFn: () => networkApi.overview(accessToken!),
    enabled: !!accessToken,
    refetchInterval: 60_000,
  });

  const filtered = useMemo(() => {
    if (!data?.patients) return [];
    return data.patients.filter((p) => {
      const matchSearch =
        !search ||
        `${p.patient.firstName} ${p.patient.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        p.caseTitle.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === "ALL" || p.caseType === filterType;
      const matchStatus = filterStatus === "ALL" || p.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [data, search, filterType, filterStatus]);

  const caseTypes = useMemo(() => {
    if (!data?.patients) return [];
    return [...new Set(data.patients.map((p) => p.caseType))];
  }, [data]);

  return (
    <div className="flex flex-col h-full bg-[#FAFAF8]">
      {/* Header */}
      <div className="px-8 pt-7 pb-5 shrink-0">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1
              className="text-[22px] font-bold text-[#1A1A2E] leading-tight"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              Vue réseau
            </h1>
            <p className="text-[13px] text-[#64748B] mt-1">
              Tous les patients de votre équipe — tâches, RDV et indicateurs de complétude
            </p>
          </div>
        </div>

        {/* Stats bar */}
        {data?.stats && (
          <div className="grid grid-cols-4 gap-3 mt-5">
            <StatCard
              icon={Users}
              label="Patients actifs"
              value={data.stats.totalActive}
              color="#5B4EC4"
            />
            <StatCard
              icon={CheckSquare}
              label="Tâches en retard"
              value={data.stats.tasksOverdue}
              color={data.stats.tasksOverdue > 0 ? "#D97706" : "#059669"}
            />
            <StatCard
              icon={CalendarDays}
              label="RDV aujourd'hui"
              value={data.stats.appointmentsToday}
              color="#2BA89C"
            />
            <StatCard
              icon={Bell}
              label="Rappels ouverts"
              value={data.stats.openAlerts}
              color={data.stats.openAlerts > 0 ? "#DC2626" : "#059669"}
            />
          </div>
        )}

        {/* Filtres */}
        <div className="flex items-center gap-3 mt-5 flex-wrap">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              strokeWidth={1.75}
            />
            <input
              type="text"
              placeholder="Rechercher un patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 h-9 rounded-[8px] bg-white border border-[rgba(26,26,46,0.08)] text-[13px] text-[#1A1A2E] placeholder:text-[#94A3B8] outline-none focus:border-[#5B4EC4] transition-colors"
              style={{ fontFamily: "var(--font-jakarta)" }}
            />
          </div>

          {/* Type de parcours */}
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-[#94A3B8]" strokeWidth={1.75} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-9 px-3 rounded-[8px] bg-white border border-[rgba(26,26,46,0.08)] text-[13px] text-[#1A1A2E] outline-none focus:border-[#5B4EC4] cursor-pointer"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              <option value="ALL">Tous les parcours</option>
              {caseTypes.map((t) => (
                <option key={t} value={t}>{CASE_TYPE_LABELS[t] ?? t}</option>
              ))}
            </select>
          </div>

          {/* Statut */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 px-3 rounded-[8px] bg-white border border-[rgba(26,26,46,0.08)] text-[13px] text-[#1A1A2E] outline-none focus:border-[#5B4EC4] cursor-pointer"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actifs</option>
            <option value="ON_HOLD">En pause</option>
            <option value="CLOSED">Clôturés</option>
          </select>

          {data && (
            <span className="text-[12px] text-[#94A3B8] ml-auto">
              {filtered.length} patient{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 mx-8 mb-6 bg-white rounded-xl border border-[rgba(26,26,46,0.06)] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(26,26,46,0.04)" }}>
        {/* En-tête colonnes */}
        <div className="flex items-center gap-4 px-4 py-2.5 bg-[#F8F9FC] border-b border-[#F1F5F9]">
          <div className="w-9 shrink-0" />
          <div className="flex-1 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Patient</div>
          <div className="flex items-center gap-3 shrink-0 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">
            <span className="w-[80px]">Tâches</span>
            <span className="w-[40px]">Rappels</span>
            <span className="w-[100px] text-right">Prochain RDV</span>
            <span className="w-[48px] text-right">Équipe</span>
            <span className="w-[14px]" />
          </div>
        </div>

        {/* Contenu */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 340px)" }}>
          {isLoading && (
            <div className="flex items-center justify-center py-16 gap-3 text-[#94A3B8]">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-[13px]">Chargement du réseau…</span>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="text-[13px] text-[#DC2626]">Erreur lors du chargement</p>
              <p className="text-[12px] text-[#94A3B8]">Vérifiez votre connexion et réessayez</p>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Users size={32} className="text-[#CBD5E1]" strokeWidth={1.25} />
              <p className="text-[13px] text-[#64748B] mt-1">
                {data?.patients.length === 0
                  ? "Aucun patient dans votre réseau pour l'instant"
                  : "Aucun résultat pour ces filtres"}
              </p>
              {data?.patients.length === 0 && (
                <p className="text-[12px] text-[#94A3B8]">
                  Créez un dossier patient pour le voir apparaître ici
                </p>
              )}
            </div>
          )}

          {!isLoading && !isError && filtered.map((p) => (
            <PatientRow key={p.careCaseId} p={p} />
          ))}
        </div>

        {/* Footer info */}
        {data && filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-[#F1F5F9] bg-[#F8F9FC] flex items-center gap-2">
            <Clock size={11} className="text-[#CBD5E1]" strokeWidth={1.75} />
            <span className="text-[11px] text-[#CBD5E1]">
              Actualisé automatiquement · Indicateurs non cliniques destinés à l'organisation du dossier
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
