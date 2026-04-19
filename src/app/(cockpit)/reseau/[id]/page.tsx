"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, MessageCircle, Loader2, Lock, UserPlus } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface OrgDetail {
  id: string;
  name: string;
  type: string;
  description?: string;
  specialty?: string;
  city?: string;
  address?: string;
  website?: string;
  requiresApproval: boolean;
  memberCount: number;
  myMembership?: { status: string; memberRole: string } | null;
  members?: Array<{ personId: string; firstName: string; lastName: string; photoUrl?: string; memberRole: string; providerProfile?: { specialty?: string } }>;
  conversations?: Array<{ id: string; name: string; _count: { messages: number }; messages?: Array<{ content: string; createdAt: string }> }>;
}

const ORG_TYPE_LABELS: Record<string, string> = {
  NETWORK: "Réseau", HOSPITAL: "Hôpital", HOSPITAL_SERVICE: "Service hospitalier",
  MSP: "MSP", CPTS: "CPTS", ASSOCIATION: "Association", PROFESSIONAL_GROUP: "Groupe pro",
};
const ORG_TYPE_COLORS: Record<string, string> = {
  NETWORK: "#5B4EC4", HOSPITAL: "#2BA89C", HOSPITAL_SERVICE: "#2BA89C",
  MSP: "#4F8FEC", CPTS: "#10B981", ASSOCIATION: "#F59E0B", PROFESSIONAL_GROUP: "#6B7280",
};
const ORG_TYPE_ICONS: Record<string, string> = {
  NETWORK: "🕸", HOSPITAL: "🏥", HOSPITAL_SERVICE: "🏥", MSP: "🏘", CPTS: "🏛", ASSOCIATION: "🤝", PROFESSIONAL_GROUP: "👥",
};

type Member = NonNullable<OrgDetail["members"]>[0];

function MemberCard({ m }: { m: Member }) {
  const initials = `${m.firstName[0]}${m.lastName[0]}`;
  return (
    <div className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] p-4 hover:border-[rgba(91,78,196,0.15)] transition-all" style={{ boxShadow: "0 1px 3px rgba(26,26,46,0.04)" }}>
      <div className="flex items-start gap-3">
        {m.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.photoUrl} className="w-10 h-10 rounded-full object-cover shrink-0" alt="" />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg, #5B4EC4, #2BA89C)" }}>{initials}</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-[#1A1A2E]" style={{ fontFamily: "var(--font-jakarta)" }}>{m.firstName} {m.lastName}</div>
          {m.providerProfile?.specialty && <div className="text-[11px] text-[#64748B] mt-0.5">{m.providerProfile.specialty}</div>}
          <div className="text-[10px] text-[#94A3B8] mt-0.5 capitalize">{m.memberRole.toLowerCase()}</div>
        </div>
      </div>
    </div>
  );
}

export default function OrgDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"accueil" | "membres" | "discussions" | "infos">("accueil");

  const { data: org, isLoading } = useQuery<OrgDetail>({
    queryKey: ["org", id],
    queryFn: async () => {
      const r = await fetch(`${API}/organizations/${id}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      return r.json();
    },
    enabled: !!accessToken && !!id,
  });

  const joinMutation = useMutation({
    mutationFn: async (message?: string) => {
      const r = await fetch(`${API}/organizations/${id}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org", id] }),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-full bg-[#FAFAF8]">
      <Loader2 size={24} className="animate-spin text-[#5B4EC4]" />
    </div>
  );

  if (!org) return <div className="p-8 text-[#64748B]">Organisation introuvable</div>;

  const isMember = org.myMembership?.status === "ACCEPTED";
  const isPending = org.myMembership?.status === "PENDING";
  const color = ORG_TYPE_COLORS[org.type] ?? "#5B4EC4";

  const TABS = [
    { id: "accueil", label: "Accueil", icon: "🏠" },
    ...(isMember ? [
      { id: "membres", label: `Membres (${org.memberCount})`, icon: "👥" },
      { id: "discussions", label: "Discussions", icon: "💬" },
    ] : []),
    { id: "infos", label: "Infos", icon: "ℹ️" },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-[#FAFAF8]">
      {/* Header */}
      <div className="px-8 pt-6 pb-0 shrink-0 bg-white border-b border-[rgba(26,26,46,0.06)]">
        <Link href="/reseau" className="flex items-center gap-2 text-[12px] text-[#64748B] hover:text-[#5B4EC4] transition-colors mb-4">
          <ArrowLeft size={14} strokeWidth={1.75} /> Vue réseau
        </Link>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${color}15` }}>
            {ORG_TYPE_ICONS[org.type] ?? "🏢"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[20px] font-bold text-[#1A1A2E] leading-tight" style={{ fontFamily: "var(--font-jakarta)" }}>{org.name}</h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: `${color}18`, color }}>
                    {ORG_TYPE_ICONS[org.type]} {ORG_TYPE_LABELS[org.type] ?? org.type}
                  </span>
                  <span className="text-[12px] text-[#94A3B8]">{org.memberCount} membres{org.city ? ` · ${org.city}` : ""}</span>
                </div>
              </div>
              {/* Join / status */}
              {!isMember && !isPending && (
                <button
                  onClick={() => joinMutation.mutate(undefined)}
                  disabled={joinMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white transition-colors shrink-0"
                  style={{ background: "#5B4EC4" }}
                >
                  {org.requiresApproval ? <><Lock size={13} /> Demander à rejoindre</> : <><UserPlus size={13} /> Rejoindre</>}
                </button>
              )}
              {isPending && (
                <div className="px-4 py-2 rounded-[10px] text-[12px] font-medium text-[#64748B] bg-[#F1F5F9] shrink-0">⏳ Demande en attente</div>
              )}
              {isMember && (
                <div className="px-4 py-2 rounded-[10px] text-[12px] font-medium shrink-0" style={{ background: `${color}12`, color }}>✓ Membre</div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0">
          {TABS.map(({ id: tid, label, icon }) => (
            <button
              key={tid}
              onClick={() => setActiveTab(tid as typeof activeTab)}
              className="flex items-center gap-1.5 px-4 py-3 text-[13px] transition-colors"
              style={{
                color: activeTab === tid ? "#5B4EC4" : "#64748B",
                fontWeight: activeTab === tid ? 600 : 400,
                borderBottom: activeTab === tid ? "2px solid #5B4EC4" : "2px solid transparent",
                marginBottom: -1,
                fontFamily: "var(--font-jakarta)",
              }}
            >
              <span>{icon}</span>{label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">

        {/* ACCUEIL */}
        {activeTab === "accueil" && (
          <div className="max-w-2xl space-y-4">
            {org.description && (
              <div className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] p-5" style={{ boxShadow: "0 1px 3px rgba(26,26,46,0.04)" }}>
                <div className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide mb-2">À propos</div>
                <p className="text-[14px] text-[#4A4A5A] leading-relaxed">{org.description}</p>
              </div>
            )}
            {isMember && org.conversations && org.conversations.length > 0 && (
              <div className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] p-5" style={{ boxShadow: "0 1px 3px rgba(26,26,46,0.04)" }}>
                <div className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide mb-3">Discussions actives</div>
                {org.conversations.slice(0, 3).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 py-2.5 border-b last:border-0 border-[#F1F5F9]">
                    <MessageCircle size={16} className="text-[#5B4EC4] shrink-0" strokeWidth={1.75} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-[#1A1A2E] truncate">{c.name}</div>
                      {c.messages?.[0] && <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">{c.messages[0].content}</div>}
                    </div>
                    <span className="text-[11px] text-[#94A3B8] shrink-0">{c._count.messages} msg</span>
                  </div>
                ))}
              </div>
            )}
            {!isMember && (
              <div className="bg-[#F8F8FF] rounded-xl border border-[rgba(91,78,196,0.15)] p-5">
                <div className="text-[13px] font-semibold text-[#5B4EC4] mb-1.5">Rejoignez ce réseau pour accéder au contenu</div>
                <p className="text-[12px] text-[#64748B]">Les membres ont accès aux discussions, à l&apos;annuaire des membres, et aux événements.</p>
              </div>
            )}
          </div>
        )}

        {/* MEMBRES */}
        {activeTab === "membres" && isMember && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {org.members?.map((m) => <MemberCard key={m.personId} m={m} />)}
          </div>
        )}

        {/* DISCUSSIONS */}
        {activeTab === "discussions" && isMember && (
          <div className="max-w-2xl space-y-3">
            {org.conversations?.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] p-4 hover:border-[rgba(91,78,196,0.2)] transition-all cursor-pointer" style={{ boxShadow: "0 1px 3px rgba(26,26,46,0.04)" }}>
                <div className="flex items-start gap-3">
                  <MessageCircle size={18} className="text-[#5B4EC4] shrink-0 mt-0.5" strokeWidth={1.75} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-[#1A1A2E]" style={{ fontFamily: "var(--font-jakarta)" }}>{c.name}</div>
                    {c.messages?.[0] && (
                      <div className="text-[12px] text-[#64748B] mt-1 truncate">{c.messages[0].content}</div>
                    )}
                    <div className="text-[11px] text-[#94A3B8] mt-1">{c._count.messages} message{c._count.messages > 1 ? "s" : ""}</div>
                  </div>
                </div>
              </div>
            ))}
            {org.conversations?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <MessageCircle size={32} className="text-[#CBD5E1]" strokeWidth={1.25} />
                <p className="text-[13px] text-[#64748B] mt-3">Aucune discussion dans ce réseau</p>
              </div>
            )}
          </div>
        )}

        {/* INFOS */}
        {activeTab === "infos" && (
          <div className="max-w-lg space-y-4">
            <div className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] p-5 space-y-3" style={{ boxShadow: "0 1px 3px rgba(26,26,46,0.04)" }}>
              {org.address && <div><div className="text-[11px] text-[#94A3B8] uppercase tracking-wide font-semibold mb-1">Adresse</div><div className="text-[13px] text-[#1A1A2E]">{org.address}</div></div>}
              {org.website && <div><div className="text-[11px] text-[#94A3B8] uppercase tracking-wide font-semibold mb-1">Site web</div><a href={org.website} target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#5B4EC4] hover:underline">{org.website}</a></div>}
              <div><div className="text-[11px] text-[#94A3B8] uppercase tracking-wide font-semibold mb-1">Adhésion</div><div className="text-[13px] text-[#1A1A2E]">{org.requiresApproval ? "Approbation requise par l'administrateur" : "Adhésion libre — rejoignez directement"}</div></div>
              <div><div className="text-[11px] text-[#94A3B8] uppercase tracking-wide font-semibold mb-1">Membres</div><div className="text-[13px] text-[#1A1A2E]">{org.memberCount} membre{org.memberCount > 1 ? "s" : ""}</div></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
