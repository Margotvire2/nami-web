"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { networkApi, type NetworkProvider } from "@/lib/api";
import { formatProviderSpecialty } from "@/lib/provider-display";
import Link from "next/link";
import {
  Users, Search, Loader2, Building2, Lock, UserPlus,
  Globe, ChevronRight, MessageCircle, Network,
} from "lucide-react";
import { toast } from "sonner";

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
  myPendingRequest?: { id: string; status: string } | null;
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
  const isAccepted = org.myMembership?.status === "ACTIVE";
  const isPending = !isAccepted && !!org.myPendingRequest;

  const renderButton = () => {
    if (isAccepted) {
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
    if (isPending) {
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
                {formatProviderSpecialty(org.specialty)}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center cockpit-glass-overlay" onClick={onClose}>
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
          className="w-full h-20 p-3 rounded-[10px] border border-[rgba(26,26,46,0.1)] text-[13px] text-[#1A1A2E] placeholder:text-[#94A3B8] resize-none outline-none focus:border-[#5B4EC4] focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30 transition-colors"
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

// ── Réseau de soignants ───────────────────────────────────────────────────────

const PROFESSION_LABELS: Record<string, string> = {
  MEDECIN: "Médecin",
  DIETICIEN: "Diététicien·ne",
  KINE: "Masseur-kinésithérapeute",
  IDE: "Infirmier·ère",
  SAGE_FEMME: "Sage-femme",
  PSY: "Psychologue",
  OSTEO: "Ostéopathe",
  PHARMA: "Pharmacien·ne",
  ORTHOPHONISTE: "Orthophoniste",
  PEDICURE: "Pédicure-podologue",
  ERGO: "Ergothérapeute",
  AIDE_SOIGNANT: "Aide-soignant·e",
};

function ProviderCard({ p }: { p: NetworkProvider }) {
  const initials = `${p.person.firstName?.[0] ?? ""}${p.person.lastName?.[0] ?? ""}`.toUpperCase() || "?";
  const profLabel = PROFESSION_LABELS[p.provider?.profession ?? ""] ?? p.provider?.profession ?? "Professionnel";
  const primarySpec = p.provider?.specialties?.[0];
  const city = p.provider?.consultationCity;

  return (
    <div
      className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] p-4 flex items-start gap-3 hover:border-[rgba(91,78,196,0.2)] hover:shadow-[0_4px_16px_rgba(91,78,196,0.08)] transition-all duration-200"
      style={{ boxShadow: "0 1px 3px rgba(26,26,46,0.04)" }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0"
        style={{ background: "linear-gradient(135deg, #5B4EC4CC, #5B4EC488)" }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-[#1A1A2E]" style={{ fontFamily: "var(--font-jakarta)" }}>
          {p.person.firstName} {p.person.lastName}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: "#5B4EC415", color: "#5B4EC4" }}>
            {profLabel}
          </span>
          {primarySpec && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] font-medium">
              {formatProviderSpecialty(primarySpec)}
            </span>
          )}
          {city && <span className="text-[11px] text-[#94A3B8]">· {city}</span>}
        </div>
        {p.organizations.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {p.organizations.map((org) => (
              <span
                key={org.id}
                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: `${ORG_TYPE_COLORS[org.type] ?? "#6B7280"}12`, color: ORG_TYPE_COLORS[org.type] ?? "#64748B" }}
              >
                {ORG_TYPE_ICONS[org.type] ?? "🏢"} {org.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ReseauPage() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"mine" | "explore" | "soignants">("mine");
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [searchProviders, setSearchProviders] = useState("");
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

  const networkProvidersQuery = useQuery({
    queryKey: ["network-providers"],
    queryFn: () => networkApi.providers(accessToken!),
    enabled: !!accessToken && tab === "soignants",
  });

  // Join mutation
  const joinMutation = useMutation({
    mutationFn: ({ orgId, message }: { orgId: string; message?: string }) =>
      joinOrg(accessToken!, orgId, message),
    onSuccess: (data) => {
      if (data?.status === "ACTIVE" && data?.message === "Déjà membre") {
        toast.info("Vous êtes déjà membre de cette organisation.");
      } else if (data?.status === "PENDING" && data?.message) {
        toast.info("Demande déjà envoyée — en attente d'approbation.");
      } else if (data?.status === "PENDING") {
        toast.success("Demande envoyée. En attente d'approbation de l'administrateur.");
      } else if (data?.status === "ACTIVE") {
        toast.success("Vous avez rejoint l'organisation.");
      }
      qc.invalidateQueries({ queryKey: ["orgs-catalog"] });
      qc.invalidateQueries({ queryKey: ["my-orgs"] });
      setJoinTarget(null);
    },
    onError: () => toast.error("Impossible d'envoyer la demande, réessayez."),
  });

  const handleJoin = useCallback((org: OrgCard) => {
    if (org.requiresApproval) {
      setJoinTarget(org);
    } else {
      joinMutation.mutate({ orgId: org.id });
    }
  }, [joinMutation]);

  // Filtered providers
  const filteredProviders = useMemo(() => {
    if (!networkProvidersQuery.data) return [];
    if (!searchProviders.trim()) return networkProvidersQuery.data;
    const q = searchProviders.toLowerCase();
    return networkProvidersQuery.data.filter((p) =>
      `${p.person.firstName ?? ""} ${p.person.lastName ?? ""}`.toLowerCase().includes(q) ||
      (p.provider?.profession && (PROFESSION_LABELS[p.provider.profession] ?? "").toLowerCase().includes(q)) ||
      p.organizations.some((o) => o.name.toLowerCase().includes(q))
    );
  }, [networkProvidersQuery.data, searchProviders]);

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
                  className="w-full pl-8 pr-3 h-9 rounded-[8px] bg-white border border-[rgba(26,26,46,0.08)] text-[13px] text-[#1A1A2E] placeholder:text-[#94A3B8] outline-none focus:border-[#5B4EC4] focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30 transition-colors"
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

        {/* ── SOIGNANTS ── */}
        {tab === "soignants" && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1 min-w-[200px] max-w-[320px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.75} />
                <input
                  type="text"
                  placeholder="Rechercher un soignant..."
                  value={searchProviders}
                  onChange={(e) => setSearchProviders(e.target.value)}
                  className="w-full pl-8 pr-3 h-9 rounded-[8px] bg-white border border-[rgba(26,26,46,0.08)] text-[13px] text-[#1A1A2E] placeholder:text-[#94A3B8] outline-none focus:border-[#5B4EC4] focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30 transition-colors"
                />
              </div>
            </div>

            {networkProvidersQuery.isLoading && (
              <div className="flex items-center justify-center py-16 gap-3 text-[#94A3B8]">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-[13px]">Chargement des soignants…</span>
              </div>
            )}

            {networkProvidersQuery.isError && (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <p className="text-[13px] text-[#94A3B8]">Impossible de charger les soignants.</p>
                <button onClick={() => networkProvidersQuery.refetch()} className="text-[12px] text-[#5B4EC4] hover:underline">Réessayer</button>
              </div>
            )}

            {!networkProvidersQuery.isLoading && networkProvidersQuery.data && (
              filteredProviders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Users size={40} className="text-[#CBD5E1]" strokeWidth={1.25} />
                  {networkProvidersQuery.data.length === 0 ? (
                    <>
                      <p className="text-[14px] text-[#64748B] font-medium">Aucun soignant dans vos réseaux</p>
                      <p className="text-[12px] text-[#94A3B8]">Rejoignez des réseaux pour retrouver vos confrères ici</p>
                      <button
                        onClick={() => setTab("explore")}
                        className="mt-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white transition-colors"
                        style={{ background: "#5B4EC4" }}
                      >
                        Explorer les réseaux →
                      </button>
                    </>
                  ) : (
                    <p className="text-[13px] text-[#64748B]">Aucun résultat pour « {searchProviders} »</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
                  {filteredProviders.map((p) => (
                    <ProviderCard key={p.personId} p={p} />
                  ))}
                </div>
              )
            )}
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
