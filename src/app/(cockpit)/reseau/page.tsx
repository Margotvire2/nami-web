"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { networkApi, type NetworkPatient } from "@/lib/api";
import Link from "next/link";
import {
  Users, CheckSquare, CalendarDays, Bell, Search, Filter,
  Clock, ArrowRight, Loader2, Building2, Lock, UserPlus,
  Globe, ChevronRight, MessageCircle, Network,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrgCard {
  id: string;
  name: string;
  type: string;
  description?: string;
  specialty?: string;
  city?: string;
  requiresApproval: boolean;
  memberCount: number;
  myMembership?: { status: string; memberRole: string } | null;
  conversations?: { id: string; name: string; _count: { messages: number } }[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ORG_TYPE_LABELS: Record<string, string> = {
  NETWORK: "Réseau",
  HOSPITAL: "Hôpital",
  HOSPITAL_SERVICE: "Service hospitalier",
  MSP: "MSP",
  CPTS: "CPTS",
  ASSOCIATION: "Association",
  PROFESSIONAL_GROUP: "Groupe pro",
  CLINIC: "Clinique",
  HEALTH_CENTER: "Centre de santé",
  PRIVATE_PRACTICE: "Cabinet",
};

const ORG_TYPE_COLORS: Record<string, string> = {
  NETWORK: "#5B4EC4",
  HOSPITAL: "#2BA89C",
  HOSPITAL_SERVICE: "#2BA89C",
  MSP: "#4F8FEC",
  CPTS: "#10B981",
  ASSOCIATION: "#F59E0B",
  PROFESSIONAL_GROUP: "#6B7280",
  CLINIC: "#8B5CF6",
  HEALTH_CENTER: "#06B6D4",
  PRIVATE_PRACTICE: "#9CA3AF",
};

const ORG_TYPE_ICONS: Record<string, string> = {
  NETWORK: "🕸",
  HOSPITAL: "🏥",
  HOSPITAL_SERVICE: "🏥",
  MSP: "🏘",
  CPTS: "🏛",
  ASSOCIATION: "🤝",
  PROFESSIONAL_GROUP: "👥",
  CLINIC: "🩺",
  HEALTH_CENTER: "💊",
  PRIVATE_PRACTICE: "🩻",
};

const SPECIALTY_LABELS: Record<string, string> = {
  tca: "TCA",
  obesity: "Obésité",
  nutrition: "Nutrition",
  pediatrics: "Pédiatrie",
  general: "Généraliste",
};

// ── API helpers ───────────────────────────────────────────────────────────────

async function fetchOrgs(token: string, params?: { type?: string; search?: string }) {
  const url = new URL(`${API}/organizations`);
  if (params?.type && params.type !== "ALL") url.searchParams.set("type", params.type);
  if (params?.search) url.searchParams.set("search", params.search);
  const r = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error(`fetchOrgs: ${r.status}`);
  const data = await r.json();
  return (Array.isArray(data) ? data : []) as OrgCard[];
}

async function fetchMyOrgs(token: string) {
  const r = await fetch(`${API}/organizations/mine`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error(`fetchMyOrgs: ${r.status}`);
  const data = await r.json();
  return (Array.isArray(data) ? data : []) as OrgCard[];
}

async function joinOrg(token: string, orgId: string, message?: string) {
  const r = await fetch(`${API}/organizations/${orgId}/join`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return r.json();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function OrgTypeBadge({ type }: { type: string }) {
  const color = ORG_TYPE_COLORS[type] ?? "#6B7280";
  const label = ORG_TYPE_LABELS[type] ?? type;
  const icon = ORG_TYPE_ICONS[type] ?? "🏢";
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
      background: `${color}18`, color, letterSpacing: "0.02em",
      display: "inline-flex", alignItems: "center", gap: 3, whiteSpace: "nowrap",
    }}>
      {icon} {label}
    </span>
  );
}

function MyOrgCard({ org }: { org: OrgCard }) {
  const activeConvs = org.conversations?.length ?? 0;
  return (
    <Link href={`/reseau/${org.id}`} className="block group">
      <div
        className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] p-4 hover:border-[rgba(91,78,196,0.2)] hover:shadow-[0_4px_16px_rgba(91,78,196,0.08)] transition-all duration-200"
        style={{ boxShadow: "0 1px 3px rgba(26,26,46,0.04)" }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center text-lg shrink-0"
            style={{ background: `${ORG_TYPE_COLORS[org.type] ?? "#6B7280"}15` }}
          >
            {ORG_TYPE_ICONS[org.type] ?? "🏢"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[14px] font-semibold text-[#1A1A2E] truncate" style={{ fontFamily: "var(--font-jakarta)" }}>
                  {org.name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <OrgTypeBadge type={org.type} />
                  <span className="text-[11px] text-[#94A3B8]">
                    {org.memberCount} membre{org.memberCount > 1 ? "s" : ""}
                    {org.city ? ` · ${org.city}` : ""}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#CBD5E1] group-hover:text-[#5B4EC4] transition-colors shrink-0 mt-0.5" strokeWidth={1.75} />
            </div>
            {activeConvs > 0 && (
              <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-[#F1F5F9]">
                <span className="flex items-center gap-1 text-[11px] text-[#64748B]">
                  <MessageCircle size={11} strokeWidth={1.75} className="text-[#5B4EC4]" />
                  {activeConvs} discussion{activeConvs > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function CatalogCard({ org, onJoin }: { org: OrgCard; onJoin: (org: OrgCard) => void }) {
  const color = ORG_TYPE_COLORS[org.type] ?? "#6B7280";
  const status = org.myMembership?.status;

  const renderButton = () => {
    if (status === "ACCEPTED") {
      return (
        <Link href={`/reseau/${org.id}`}>
          <button
            className="w-full py-2 rounded-[8px] text-[12px] font-semibold transition-all"
            style={{ background: `${color}15`, color }}
          >
            Accéder →
          </button>
        </Link>
      );
    }
    if (status === "PENDING") {
      return (
        <div className="w-full py-2 rounded-[8px] text-[12px] font-medium text-center" style={{ background: "#F1F5F9", color: "#64748B" }}>
          ⏳ Demande en attente
        </div>
      );
    }
    return (
      <button
        onClick={() => onJoin(org)}
        className="w-full py-2 rounded-[8px] text-[12px] font-semibold transition-all border"
        style={{ background: "transparent", color, borderColor: `${color}40` }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${color}12`; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
      >
        {org.requiresApproval ? <><Lock size={10} style={{ display: "inline", marginRight: 4 }} />Demander à rejoindre</> : <><UserPlus size={10} style={{ display: "inline", marginRight: 4 }} />Rejoindre</>}
      </button>
    );
  };

  return (
    <div
      className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] p-4 flex flex-col gap-3 hover:border-[rgba(91,78,196,0.2)] hover:shadow-[0_4px_16px_rgba(91,78,196,0.08)] transition-all duration-200"
      style={{ boxShadow: "0 1px 3px rgba(26,26,46,0.04)" }}
    >
      {/* Top */}
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-[10px] flex items-center justify-center text-xl shrink-0"
          style={{ background: `${color}15` }}
        >
          {ORG_TYPE_ICONS[org.type] ?? "🏢"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold text-[#1A1A2E] leading-tight mb-1.5" style={{ fontFamily: "var(--font-jakarta)" }}>
            {org.name}
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <OrgTypeBadge type={org.type} />
            {org.specialty && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] font-medium">
                {SPECIALTY_LABELS[org.specialty] ?? org.specialty}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {org.description && (
        <p className="text-[12px] text-[#64748B] leading-relaxed" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {org.description}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-2 text-[11px] text-[#94A3B8]">
        <Users size={11} strokeWidth={1.75} />
        <span>{org.memberCount} membre{org.memberCount > 1 ? "s" : ""}</span>
        {org.city && <><span>·</span><span>{org.city}</span></>}
        {!org.requiresApproval && (
          <><span>·</span><Globe size={10} strokeWidth={1.75} className="text-[#10B981]" /><span className="text-[#10B981]">Ouvert</span></>
        )}
      </div>

      {/* CTA */}
      {renderButton()}
    </div>
  );
}

// ── Join modal ─────────────────────────────────────────────────────────────────

function JoinModal({ org, onClose, onJoin }: { org: OrgCard; onClose: () => void; onJoin: (message?: string) => void }) {
  const [message, setMessage] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl" style={{ background: `${ORG_TYPE_COLORS[org.type] ?? "#6B7280"}15` }}>
            {ORG_TYPE_ICONS[org.type] ?? "🏢"}
          </div>
          <div>
            <div className="text-[15px] font-semibold text-[#1A1A2E]" style={{ fontFamily: "var(--font-jakarta)" }}>{org.name}</div>
            <div className="text-[12px] text-[#64748B]">Demande d&apos;adhésion</div>
          </div>
        </div>

        <p className="text-[13px] text-[#64748B] mb-4 leading-relaxed">
          Ce réseau nécessite une approbation. Votre demande sera transmise à l&apos;administrateur.
        </p>

        <textarea
          className="w-full h-20 p-3 rounded-[10px] border border-[rgba(26,26,46,0.1)] text-[13px] text-[#1A1A2E] placeholder:text-[#94A3B8] resize-none outline-none focus:border-[#5B4EC4] transition-colors"
          placeholder="Message optionnel : votre spécialité, votre structure, votre motivation..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-[10px] border border-[rgba(26,26,46,0.1)] text-[13px] font-medium text-[#64748B] hover:bg-[#F8F9FC] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onJoin(message || undefined)}
            className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold text-white transition-colors"
            style={{ background: "#5B4EC4" }}
          >
            Envoyer la demande
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Legacy coordinator view (kept as tab) ────────────────────────────────────

const CASE_TYPE_LABELS: Record<string, string> = { TCA: "TCA", OBESITY: "Obésité", METABOLIC: "Métabolique", MENTAL_HEALTH: "Santé mentale", PEDIATRIC: "Pédiatrie", CHRONIC_PAIN: "Douleur chronique", OTHER: "Autre" };
const CASE_TYPE_COLORS: Record<string, string> = { TCA: "#7C3AED", OBESITY: "#2563EB", METABOLIC: "#0891B2", MENTAL_HEALTH: "#7C3AED", PEDIATRIC: "#059669", CHRONIC_PAIN: "#D97706", OTHER: "#64748B" };
const STATUS_LABELS: Record<string, string> = { ACTIVE: "Actif", ON_HOLD: "En pause", CLOSED: "Clôturé", ARCHIVED: "Archivé" };
const STATUS_DOT_COLORS: Record<string, string> = { ACTIVE: "#059669", ON_HOLD: "#D97706", CLOSED: "#94A3B8", ARCHIVED: "#CBD5E1" };

function getAge(birthDate: string | null): string {
  if (!birthDate) return "—";
  const years = Math.floor((Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  return `${years} ans`;
}
function formatDate(iso: string): string { return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }); }
function formatTime(iso: string): string { return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); }
function isToday(iso: string): boolean { const d = new Date(iso); const n = new Date(); return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }

function PatientRow({ p }: { p: NetworkPatient }) {
  const typeColor = CASE_TYPE_COLORS[p.caseType] ?? "#64748B";
  const dotColor = STATUS_DOT_COLORS[p.status] ?? "#94A3B8";
  const hasOverdue = p.overdueTasksCount > 0;
  const hasAlerts = p.openAlertsCount > 0;
  const todayAppt = p.nextAppointment && isToday(p.nextAppointment.startAt);
  return (
    <Link href={`/patients/${p.careCaseId}`} className="group flex items-center gap-4 px-4 py-3.5 border-b border-[#F1F5F9] hover:bg-[rgba(91,78,196,0.03)] transition-colors">
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[12px] font-bold text-white shrink-0"
        style={{ background: `linear-gradient(135deg, ${typeColor}CC, ${typeColor}88)` }}
      >
        {p.patient.firstName?.[0] ?? "?"}{p.patient.lastName?.[0] ?? ""}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold truncate" style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}>{p.patient.firstName} {p.patient.lastName}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0" style={{ background: `${typeColor}15`, color: typeColor }}>{CASE_TYPE_LABELS[p.caseType] ?? p.caseType}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: "#64748B" }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotColor }} />
            {STATUS_LABELS[p.status] ?? p.status}
          </span>
          {p.patient.birthDate && <span className="text-[11px] text-[#94A3B8]">· {getAge(p.patient.birthDate)}</span>}
          {p.careStage && <span className="text-[11px] text-[#94A3B8] truncate">· {p.careStage}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: hasOverdue ? "#D97706" : "#94A3B8" }}>
          <CheckSquare size={13} strokeWidth={1.75} /><span>{p.pendingTasksCount}</span>
          {hasOverdue && <span className="text-[10px] font-semibold" style={{ color: "#D97706" }}>({p.overdueTasksCount} en retard)</span>}
        </div>
        {hasAlerts && <div className="flex items-center gap-1 text-[12px]" style={{ color: "#DC2626" }}><Bell size={12} strokeWidth={1.75} /><span>{p.openAlertsCount}</span></div>}
        <div className="flex items-center gap-1.5 text-[12px] min-w-[100px] justify-end" style={{ color: todayAppt ? "#5B4EC4" : "#94A3B8" }}>
          <CalendarDays size={13} strokeWidth={1.75} />
          {p.nextAppointment ? <span>{todayAppt ? <span style={{ color: "#5B4EC4", fontWeight: 600 }}>Auj. {formatTime(p.nextAppointment.startAt)}</span> : formatDate(p.nextAppointment.startAt)}</span> : <span className="text-[11px]">—</span>}
        </div>
        <div className="flex items-center gap-1 text-[12px] text-[#94A3B8] min-w-[48px] justify-end"><Users size={12} strokeWidth={1.75} /><span>{p.teamSize}</span></div>
        <ArrowRight size={14} className="text-[#CBD5E1] group-hover:text-[#5B4EC4] transition-colors shrink-0" strokeWidth={1.75} />
      </div>
    </Link>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ReseauPage() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"mine" | "explore" | "soignants">("mine");
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [searchCoord, setSearchCoord] = useState("");
  const [filterTypeCoord, setFilterTypeCoord] = useState("ALL");
  const [filterStatusCoord, setFilterStatusCoord] = useState("ACTIVE");
  const [joinTarget, setJoinTarget] = useState<OrgCard | null>(null);

  // Queries
  const myOrgsQuery = useQuery({
    queryKey: ["my-orgs"],
    queryFn: () => fetchMyOrgs(accessToken!),
    enabled: !!accessToken && tab === "mine",
  });

  const catalogQuery = useQuery({
    queryKey: ["orgs-catalog", filterType, search],
    queryFn: () => fetchOrgs(accessToken!, { type: filterType, search: search || undefined }),
    enabled: !!accessToken && tab === "explore",
  });

  const networkQuery = useQuery({
    queryKey: ["network-overview"],
    queryFn: () => networkApi.overview(accessToken!),
    enabled: !!accessToken && tab === "soignants",
    refetchInterval: 60_000,
  });

  // Join mutation
  const joinMutation = useMutation({
    mutationFn: ({ orgId, message }: { orgId: string; message?: string }) =>
      joinOrg(accessToken!, orgId, message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orgs-catalog"] });
      qc.invalidateQueries({ queryKey: ["my-orgs"] });
      setJoinTarget(null);
    },
  });

  const handleJoin = useCallback((org: OrgCard) => {
    if (org.requiresApproval) {
      setJoinTarget(org);
    } else {
      joinMutation.mutate({ orgId: org.id });
    }
  }, [joinMutation]);

  // Filtered coordinator patients
  const filteredPatients = useMemo(() => {
    if (!networkQuery.data?.patients) return [];
    return networkQuery.data.patients.filter((p) => {
      const matchSearch = !searchCoord || `${p.patient.firstName} ${p.patient.lastName}`.toLowerCase().includes(searchCoord.toLowerCase());
      const matchType = filterTypeCoord === "ALL" || p.caseType === filterTypeCoord;
      const matchStatus = filterStatusCoord === "ALL" || p.status === filterStatusCoord;
      return matchSearch && matchType && matchStatus;
    });
  }, [networkQuery.data, searchCoord, filterTypeCoord, filterStatusCoord]);

  const ORG_TYPES_LIST = ["ALL", "NETWORK", "HOSPITAL", "HOSPITAL_SERVICE", "MSP", "CPTS", "ASSOCIATION", "PROFESSIONAL_GROUP"];

  return (
    <div className="flex flex-col h-full bg-[#FAFAF8]">
      {/* Header */}
      <div className="px-8 pt-7 pb-0 shrink-0">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-[22px] font-bold text-[#1A1A2E] leading-tight" style={{ fontFamily: "var(--font-jakarta)" }}>
              Vue réseau
            </h1>
            <p className="text-[13px] text-[#64748B] mt-1">
              Vos structures, réseaux de soins et groupe de pairs
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-[rgba(26,26,46,0.06)]">
          {([
            { id: "mine", label: "Mes réseaux", icon: Network },
            { id: "explore", label: "Explorer", icon: Globe },
            { id: "soignants", label: "Réseau de soignants", icon: Users },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex items-center gap-2 px-4 py-3 text-[13px] font-medium transition-colors relative"
              style={{
                color: tab === id ? "#5B4EC4" : "#64748B",
                fontWeight: tab === id ? 600 : 400,
                borderBottom: tab === id ? "2px solid #5B4EC4" : "2px solid transparent",
                marginBottom: -1,
                fontFamily: "var(--font-jakarta)",
              }}
            >
              <Icon size={14} strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">

        {/* ── MES RÉSEAUX ── */}
        {tab === "mine" && (
          <div>
            {myOrgsQuery.isLoading && (
              <div className="flex items-center justify-center py-16 gap-3 text-[#94A3B8]">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-[13px]">Chargement de vos réseaux…</span>
              </div>
            )}
            {myOrgsQuery.isError && (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <p className="text-[13px] text-[#94A3B8]">Impossible de charger vos réseaux.</p>
                <button onClick={() => myOrgsQuery.refetch()} className="text-[12px] text-[#5B4EC4] hover:underline">Réessayer</button>
              </div>
            )}
            {!myOrgsQuery.isLoading && myOrgsQuery.data && myOrgsQuery.data.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Network size={40} className="text-[#CBD5E1]" strokeWidth={1.25} />
                <p className="text-[14px] text-[#64748B] font-medium">Vous n&apos;avez rejoint aucun réseau</p>
                <p className="text-[12px] text-[#94A3B8]">Explorez le catalogue pour rejoindre des structures et réseaux de soins</p>
                <button
                  onClick={() => setTab("explore")}
                  className="mt-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white transition-colors"
                  style={{ background: "#5B4EC4" }}
                >
                  Explorer les réseaux →
                </button>
              </div>
            )}
            {myOrgsQuery.data && myOrgsQuery.data.length > 0 && (
              <div className="grid grid-cols-1 gap-3 max-w-2xl">
                {myOrgsQuery.data.map((org) => (
                  <MyOrgCard key={org.id} org={org} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── EXPLORER ── */}
        {tab === "explore" && (
          <div>
            {/* Filters */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.75} />
                <input
                  type="text"
                  placeholder="Rechercher un réseau..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 h-9 rounded-[8px] bg-white border border-[rgba(26,26,46,0.08)] text-[13px] text-[#1A1A2E] placeholder:text-[#94A3B8] outline-none focus:border-[#5B4EC4] transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {ORG_TYPES_LIST.map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
                    style={{
                      background: filterType === t ? (t === "ALL" ? "#5B4EC4" : `${ORG_TYPE_COLORS[t] ?? "#5B4EC4"}20`) : "#F1F5F9",
                      color: filterType === t ? (t === "ALL" ? "white" : ORG_TYPE_COLORS[t] ?? "#5B4EC4") : "#64748B",
                      fontWeight: filterType === t ? 600 : 400,
                    }}
                  >
                    {t === "ALL" ? "Tous" : ORG_TYPE_LABELS[t] ?? t}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            {catalogQuery.isLoading && (
              <div className="flex items-center justify-center py-16 gap-3 text-[#94A3B8]">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-[13px]">Chargement du catalogue…</span>
              </div>
            )}
            {catalogQuery.data && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catalogQuery.data.map((org) => (
                  <CatalogCard key={org.id} org={org} onJoin={handleJoin} />
                ))}
              </div>
            )}
            {catalogQuery.data?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <Building2 size={32} className="text-[#CBD5E1]" strokeWidth={1.25} />
                <p className="text-[13px] text-[#64748B] mt-3">Aucun réseau trouvé pour ces filtres</p>
              </div>
            )}
          </div>
        )}

        {/* ── SOIGNANTS (legacy coordinator view) ── */}
        {tab === "soignants" && (
          <div className="-mx-8 -mt-6">
            {/* Filters */}
            <div className="px-8 pt-4 pb-4">
              {networkQuery.data?.stats && (
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { icon: Users, label: "Patients actifs", value: networkQuery.data.stats.totalActive, color: "#5B4EC4" },
                    { icon: CheckSquare, label: "Tâches en retard", value: networkQuery.data.stats.tasksOverdue, color: networkQuery.data.stats.tasksOverdue > 0 ? "#D97706" : "#059669" },
                    { icon: CalendarDays, label: "RDV aujourd'hui", value: networkQuery.data.stats.appointmentsToday, color: "#2BA89C" },
                    { icon: Bell, label: "Rappels ouverts", value: networkQuery.data.stats.openAlerts, color: networkQuery.data.stats.openAlerts > 0 ? "#DC2626" : "#059669" },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] px-5 py-4 flex items-center gap-4" style={{ boxShadow: "0 1px 4px rgba(26,26,46,0.04)" }}>
                      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
                        <Icon size={18} style={{ color }} strokeWidth={1.75} />
                      </div>
                      <div><p className="text-[22px] font-bold leading-none" style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}>{value}</p><p className="text-[12px] text-[#64748B] mt-0.5">{label}</p></div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-[320px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.75} />
                  <input type="text" placeholder="Rechercher un patient..." value={searchCoord} onChange={(e) => setSearchCoord(e.target.value)} className="w-full pl-8 pr-3 h-9 rounded-[8px] bg-white border border-[rgba(26,26,46,0.08)] text-[13px] text-[#1A1A2E] placeholder:text-[#94A3B8] outline-none focus:border-[#5B4EC4] transition-colors" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Filter size={13} className="text-[#94A3B8]" strokeWidth={1.75} />
                  <select value={filterTypeCoord} onChange={(e) => setFilterTypeCoord(e.target.value)} className="h-9 px-3 rounded-[8px] bg-white border border-[rgba(26,26,46,0.08)] text-[13px] text-[#1A1A2E] outline-none focus:border-[#5B4EC4] cursor-pointer">
                    <option value="ALL">Tous les parcours</option>
                    {Object.entries(CASE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <select value={filterStatusCoord} onChange={(e) => setFilterStatusCoord(e.target.value)} className="h-9 px-3 rounded-[8px] bg-white border border-[rgba(26,26,46,0.08)] text-[13px] text-[#1A1A2E] outline-none focus:border-[#5B4EC4] cursor-pointer">
                  <option value="ALL">Tous les statuts</option>
                  <option value="ACTIVE">Actifs</option>
                  <option value="ON_HOLD">En pause</option>
                  <option value="CLOSED">Clôturés</option>
                </select>
              </div>
            </div>

            <div className="mx-8 mb-6 bg-white rounded-xl border border-[rgba(26,26,46,0.06)] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(26,26,46,0.04)" }}>
              <div className="flex items-center gap-4 px-4 py-2.5 bg-[#F8F9FC] border-b border-[#F1F5F9]">
                <div className="w-9 shrink-0" /><div className="flex-1 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Patient</div>
                <div className="flex items-center gap-3 shrink-0 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                  <span className="w-[80px]">Tâches</span><span className="w-[40px]">Rappels</span><span className="w-[100px] text-right">Prochain RDV</span><span className="w-[48px] text-right">Équipe</span><span className="w-[14px]" />
                </div>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 440px)" }}>
                {networkQuery.isLoading && <div className="flex items-center justify-center py-16 gap-3 text-[#94A3B8]"><Loader2 size={20} className="animate-spin" /><span className="text-[13px]">Chargement du réseau…</span></div>}
                {!networkQuery.isLoading && filteredPatients.map((p) => <PatientRow key={p.careCaseId} p={p} />)}
                {!networkQuery.isLoading && filteredPatients.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16"><Users size={32} className="text-[#CBD5E1]" strokeWidth={1.25} /><p className="text-[13px] text-[#64748B] mt-1">Aucun patient dans votre réseau</p></div>
                )}
              </div>
              {networkQuery.data && filteredPatients.length > 0 && (
                <div className="px-4 py-2.5 border-t border-[#F1F5F9] bg-[#F8F9FC] flex items-center gap-2">
                  <Clock size={11} className="text-[#CBD5E1]" strokeWidth={1.75} />
                  <span className="text-[11px] text-[#CBD5E1]">Actualisé automatiquement · Indicateurs non cliniques destinés à l&apos;organisation du dossier</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Join modal */}
      {joinTarget && (
        <JoinModal
          org={joinTarget}
          onClose={() => setJoinTarget(null)}
          onJoin={(message) => joinMutation.mutate({ orgId: joinTarget.id, message })}
        />
      )}
    </div>
  );
}
