"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, MessageCircle, Loader2, Lock, UserPlus, Newspaper, Calendar, Search, BookOpen, Settings, ChevronRight } from "lucide-react";
import { formatProviderSpecialty } from "@/lib/provider-display";

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
  const initials = `${m.firstName?.[0] ?? "?"}${m.lastName?.[0] ?? ""}`;
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
          {m.providerProfile?.specialty && <div className="text-[11px] text-[#64748B] mt-0.5">{formatProviderSpecialty(m.providerProfile.specialty)}</div>}
          <div className="text-[10px] text-[#94A3B8] mt-0.5 capitalize">{m.memberRole.toLowerCase()}</div>
        </div>
      </div>
    </div>
  );
}

function PlaceholderSection({
  icon,
  title,
  subtitle,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accent: string;
}) {
  return (
    <div
      data-testid={`placeholder-${title.toLowerCase().replace(/[^a-z]/g, "-")}`}
      className="bg-white rounded-xl border border-dashed border-[#E8ECF4] p-5"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accent}15`, color: accent }}
          aria-hidden
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className="text-[14px] font-semibold text-[#1A1A2E]"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              {title}
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] tracking-wide">
              Bientôt
            </span>
          </div>
          <p className="text-[12px] text-[#64748B] leading-relaxed">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function MiniMemberAvatar({ m }: { m: Member }) {
  const initials = `${m.firstName?.[0] ?? "?"}${m.lastName?.[0] ?? ""}`;
  if (m.photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={m.photoUrl}
        alt={`${m.firstName} ${m.lastName}`}
        className="w-9 h-9 rounded-full object-cover ring-2 ring-white shrink-0"
      />
    );
  }
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-white shrink-0"
      style={{ background: "linear-gradient(135deg, #5B4EC4, #2BA89C)" }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

function DirectoryCard({ org, isMember }: { org: OrgDetail; isMember: boolean }) {
  const previewMembers = (org.members ?? []).slice(0, 4);
  const remaining = Math.max(0, org.memberCount - previewMembers.length);

  return (
    <Link
      href={`/reseau/${org.id}/annuaire`}
      data-testid="directory-preview-card"
      className="block bg-white rounded-xl border border-[rgba(26,26,46,0.06)] p-5 hover:border-[rgba(91,78,196,0.2)] transition-all"
      style={{ boxShadow: "0 1px 3px rgba(26,26,46,0.04)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-[#5B4EC4]" strokeWidth={1.75} />
          <h3
            className="text-[14px] font-semibold text-[#1A1A2E]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Annuaire des membres
          </h3>
        </div>
        <ChevronRight size={16} className="text-[#94A3B8]" strokeWidth={1.75} />
      </div>

      {previewMembers.length > 0 ? (
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {previewMembers.map((m) => (
              <MiniMemberAvatar key={m.personId} m={m} />
            ))}
          </div>
          <span className="text-[12px] text-[#64748B]">
            {remaining > 0 ? `+${remaining} autre${remaining > 1 ? "s" : ""} membre${remaining > 1 ? "s" : ""}` : `${org.memberCount} membre${org.memberCount > 1 ? "s" : ""}`}
          </span>
        </div>
      ) : (
        <p className="text-[12px] text-[#64748B] leading-relaxed">
          {isMember
            ? `Découvrez les ${org.memberCount} membre${org.memberCount > 1 ? "s" : ""} de l'organisation.`
            : "L'annuaire affiche les membres ayant choisi d'être visibles publiquement. Les profils complets sont réservés aux membres."}
        </p>
      )}
    </Link>
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
  const isAdmin = isMember && (org.myMembership?.memberRole === "ADMIN" || org.myMembership?.memberRole === "OWNER");
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
              {isAdmin ? (
                <Link
                  href={`/structure/${id}/admin`}
                  data-testid="admin-console-link"
                  className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white transition-colors shrink-0 hover:opacity-90"
                  style={{ background: color }}
                >
                  <Settings size={13} strokeWidth={2} /> Console d&apos;animation
                </Link>
              ) : isMember && (
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
                <p className="text-[14px] text-[#374151] leading-relaxed">{org.description}</p>
              </div>
            )}

            {/* Annuaire — encart preview membres */}
            <DirectoryCard org={org} isMember={isMember} />

            {/* Actualités du réseau — placeholder V2 */}
            <PlaceholderSection
              icon={<Newspaper size={16} strokeWidth={1.75} />}
              title="Actualités du réseau"
              subtitle="Les publications de l'organisation arrivent bientôt. Coordonnateurs : prises de parole, infos pratiques, comptes-rendus."
              accent="#5B4EC4"
            />

            {isMember && (
              <>
                {/* Événements à venir — placeholder V2 */}
                <PlaceholderSection
                  icon={<Calendar size={16} strokeWidth={1.75} />}
                  title="Événements à venir"
                  subtitle="Sessions de coordination, formations, RCP de l'organisation. Bientôt accessibles ici."
                  accent="#2BA89C"
                />

                {/* Recherche — placeholder V2 */}
                <PlaceholderSection
                  icon={<Search size={16} strokeWidth={1.75} />}
                  title="Rechercher dans le réseau"
                  subtitle="Une barre de recherche pour retrouver un membre, une discussion ou une ressource partagée."
                  accent="#4F8FEC"
                />

                {/* Ressources partagées — placeholder V2 */}
                <PlaceholderSection
                  icon={<BookOpen size={16} strokeWidth={1.75} />}
                  title="Ressources partagées"
                  subtitle="Protocoles, documents de référence et ressources de l'organisation, accessibles à tous les membres."
                  accent="#F59E0B"
                />
              </>
            )}

            {isMember && org.conversations && org.conversations.length > 0 && (
              <div className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] p-5" style={{ boxShadow: "0 1px 3px rgba(26,26,46,0.04)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Discussions actives</div>
                  <button
                    onClick={() => setActiveTab("discussions")}
                    className="text-[11px] font-medium text-[#5B4EC4] hover:underline"
                  >
                    Tout voir
                  </button>
                </div>
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
                <p className="text-[12px] text-[#64748B] mb-3">Les membres ont accès aux discussions, à l&apos;annuaire complet des membres, aux événements et aux ressources partagées.</p>
                {!isPending && (
                  <button
                    onClick={() => joinMutation.mutate(undefined)}
                    disabled={joinMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white transition-colors"
                    style={{ background: "#5B4EC4" }}
                  >
                    {org.requiresApproval ? <><Lock size={13} /> Demander à rejoindre</> : <><UserPlus size={13} /> Rejoindre</>}
                  </button>
                )}
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
