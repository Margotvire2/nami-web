"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  UsersRound, UserPlus, Mail, Copy, Check, ChevronRight,
  X, Building2, Target, Brain, Heart, Scale, Globe,
  Search, Plus, MessageSquare, AlertTriangle, Crown,
  Stethoscope, User, Clock, ArrowLeftRight,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  role: string;
  status: "active" | "invited" | "external";
  isOnline: boolean;
  isCoordinator?: boolean;
}

interface SharedPatient {
  id: string;
  firstName: string;
  lastName: string;
  coordinator: string;
  lastAction: string;
  lastActionTime: string;
  alerts: number;
}

interface Team {
  id: string;
  name: string;
  emoji: string;
  context: string;
  memberCount: number;
  patientCount: number;
  specialties: string;
  lastActivity: string;
  members: TeamMember[];
  patients: SharedPatient[];
}

interface Network {
  id: string;
  name: string;
  emoji: string;
  memberCount: number;
  scope: string;
  memberSince?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════

const TEAMS: Team[] = [
  {
    id: "team-1", name: "Équipe TCA", emoji: "🎯", context: "CPTS Neuilly",
    memberCount: 8, patientCount: 23, specialties: "Diét, Psy, Psychiatre, Médecin",
    lastActivity: "il y a 2h",
    members: [
      { id: "m-1", firstName: "Amélie", lastName: "Suela", specialty: "Médecin généraliste", role: "Coordinatrice", status: "active", isOnline: true, isCoordinator: true },
      { id: "m-2", firstName: "Karim", lastName: "Benali", specialty: "Psychiatre", role: "Psychiatre", status: "active", isOnline: true },
      { id: "m-3", firstName: "Sarah", lastName: "Morin", specialty: "Diététicienne", role: "Diététicienne", status: "active", isOnline: false },
      { id: "m-4", firstName: "Nadia", lastName: "Roussel", specialty: "Psychologue TCC", role: "Psychologue", status: "active", isOnline: true },
      { id: "m-5", firstName: "Pierre", lastName: "Aumont", specialty: "Kinésithérapeute", role: "Kiné", status: "invited", isOnline: false },
      { id: "m-6", firstName: "Claire", lastName: "Petit", specialty: "Médecin généraliste", role: "Médecin", status: "external", isOnline: false },
    ],
    patients: [
      { id: "sp-1", firstName: "Margot", lastName: "Vire", coordinator: "Vous", lastAction: "Note clinique", lastActionTime: "il y a 2h", alerts: 1 },
      { id: "sp-2", firstName: "Émilie", lastName: "Renard", coordinator: "Dr Benali", lastAction: "RDV programmé", lastActionTime: "hier", alerts: 0 },
      { id: "sp-3", firstName: "Paul", lastName: "Durand", coordinator: "Vous", lastAction: "Message", lastActionTime: "lundi", alerts: 0 },
      { id: "sp-4", firstName: "Théo", lastName: "Dufresne", coordinator: "Vous", lastAction: "Alerte", lastActionTime: "aujourd'hui", alerts: 2 },
    ],
  },
  {
    id: "team-2", name: "Pédiatrie", emoji: "🏥", context: "Hôpital Américain de Paris",
    memberCount: 12, patientCount: 47, specialties: "Pédiatres, Gastro, Neuro, Allergo",
    lastActivity: "il y a 5h",
    members: [], patients: [],
  },
  {
    id: "team-3", name: "Prise en charge Obésité", emoji: "⚖️", context: "Centres experts",
    memberCount: 5, patientCount: 11, specialties: "Endocrinologues, Nutritionnistes, Chirurgien",
    lastActivity: "hier",
    members: [], patients: [],
  },
  {
    id: "team-4", name: "Endométriose & SOPK", emoji: "🌸", context: "Réseau ville-hôpital",
    memberCount: 4, patientCount: 9, specialties: "Gynécologues, Nutritionniste, Kiné",
    lastActivity: "il y a 3j",
    members: [], patients: [],
  },
  {
    id: "team-5", name: "Mes TCC de confiance", emoji: "🧠", context: "Réseau personnel",
    memberCount: 3, patientCount: 0, specialties: "Psychologues spécialisés TCA/anxiété",
    lastActivity: "il y a 1 sem",
    members: [], patients: [],
  },
];

const NETWORKS: Network[] = [
  { id: "net-1", name: "FFAB", emoji: "🇫🇷", memberCount: 340, scope: "Réseau national TCA", memberSince: "2021" },
  { id: "net-2", name: "Réseau TCA Francilien", emoji: "🗺️", memberCount: 67, scope: "Île-de-France" },
  { id: "net-3", name: "Réseau Endométriose IDF", emoji: "🌸", memberCount: 45, scope: "Île-de-France" },
];

const MEMBER_STATUS_STYLE: Record<string, { label: string; className: string }> = {
  active:   { label: "Actif sur Nami",     className: "bg-[#F0FDF4] text-[#059669]" },
  invited:  { label: "Invité (en attente)", className: "bg-[#FFFBEB] text-[#D97706]" },
  external: { label: "Hors Nami",           className: "bg-[#F1F5F9] text-[#64748B]" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function EquipePage() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamTab, setTeamTab] = useState<"membres" | "patients" | "fil">("membres");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteType, setInviteType] = useState<"nami" | "email" | "external">("email");
  const [linkCopied, setLinkCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/invite/abc123`);
    setLinkCopied(true);
    toast.success("Lien copié");
    setTimeout(() => setLinkCopied(false), 2000);
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* ── Colonne gauche — vue d'ensemble ── */}
      <div className={cn("flex-1 flex flex-col overflow-hidden transition-all", selectedTeam ? "max-w-[calc(100%-480px)]" : "")}>
        {/* Header */}
        <header className="bg-white border-b border-[#E8ECF4] px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight" style={{ fontFamily: "var(--font-jakarta)" }}>Mon équipe</h1>
              <p className="text-sm text-[#64748B] mt-0.5">{TEAMS.length} équipes opérationnelles · {NETWORKS.length} réseaux</p>
            </div>
            <button onClick={() => toast.info("Création d'équipe bientôt disponible")} className="h-10 px-5 rounded-[10px] bg-[#4F46E5] text-white text-sm font-semibold flex items-center gap-2 hover:bg-[#4338CA] transition-colors">
              <Plus size={16} /> Créer une équipe
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-[#F0F2FA]">
          <div className="max-w-4xl mx-auto px-6 py-6 space-y-8">

            {/* ── Équipes opérationnelles ── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <UsersRound size={16} className="text-[#4F46E5]" />
                <h2 className="text-[15px] font-bold text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>Mes équipes opérationnelles</h2>
                <span className="text-[12px] text-[#94A3B8] ml-1" style={{ fontFamily: "var(--font-inter)" }}>{TEAMS.length}</span>
              </div>
              <p className="text-sm text-[#64748B] mb-4">Équipes qui suivent des patients ensemble — membres, dossiers partagés, coordination.</p>

              <div className="space-y-3">
                {TEAMS.map((team, i) => (
                  <motion.div key={team.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.2 }}>
                    <button
                      onClick={() => { setSelectedTeam(team); setTeamTab("membres"); }}
                      className={cn(
                        "w-full text-left bg-white rounded-xl p-5 transition-all duration-150",
                        selectedTeam?.id === team.id ? "ring-2 ring-[#4F46E5] shadow-lg" : "border border-[#E8ECF4] hover:shadow-md hover:-translate-y-px"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-2xl mt-0.5">{team.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[15px] font-semibold text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>{team.name}</p>
                            <span className="text-[12px] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>· {team.context}</span>
                          </div>
                          <p className="text-[13px] text-[#64748B] mt-0.5">{team.memberCount} praticiens · {team.patientCount} patients actifs</p>
                          <p className="text-[12px] text-[#94A3B8] mt-0.5">{team.specialties}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[11px] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Dernière activité</p>
                          <p className="text-[12px] text-[#64748B] font-medium">{team.lastActivity}</p>
                        </div>
                        <ChevronRight size={16} className="text-[#CBD5E1] shrink-0 mt-2" />
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* ── Réseaux professionnels ── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Globe size={16} className="text-[#64748B]" />
                <h2 className="text-[15px] font-bold text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>Mes réseaux professionnels</h2>
                <span className="text-[12px] text-[#94A3B8] ml-1" style={{ fontFamily: "var(--font-inter)" }}>{NETWORKS.length}</span>
              </div>
              <p className="text-sm text-[#64748B] mb-4">Annuaire, veille et pool d'adressage — pas forcément de patients partagés.</p>

              <div className="grid grid-cols-3 gap-3">
                {NETWORKS.map((net) => (
                  <div key={net.id} className="bg-white rounded-xl p-4 border border-[#E8ECF4] hover:shadow-md hover:-translate-y-px transition-all cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{net.emoji}</span>
                      <p className="text-[14px] font-semibold text-[#0F172A]">{net.name}</p>
                    </div>
                    <p className="text-[12px] text-[#64748B]">{net.memberCount} praticiens · {net.scope}</p>
                    {net.memberSince && <p className="text-[11px] text-[#94A3B8] mt-1" style={{ fontFamily: "var(--font-inter)" }}>Membre depuis {net.memberSince}</p>}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ── Colonne droite — fiche équipe ── */}
      <AnimatePresence>
        {selectedTeam && (
          <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} transition={{ duration: 0.25 }} className="w-[480px] shrink-0 bg-white border-l border-[#E8ECF4] flex flex-col h-full shadow-xl z-10">
            {/* Team header */}
            <div className="px-5 py-4 border-b border-[#E8ECF4] shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedTeam.emoji}</span>
                  <div>
                    <p className="text-[16px] font-bold text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>{selectedTeam.name}</p>
                    <p className="text-[12px] text-[#64748B]">{selectedTeam.context} · {selectedTeam.memberCount} membres · {selectedTeam.patientCount} patients</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTeam(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9]"><X size={16} /></button>
              </div>

              {/* Tabs */}
              <div className="flex gap-0 mt-3">
                {([["membres", "Membres"], ["patients", "Patients partagés"], ["fil", "Fil d'équipe"]] as const).map(([key, label]) => (
                  <button key={key} onClick={() => setTeamTab(key)} className={cn("px-3 py-1.5 text-[13px] font-medium border-b-2 transition-colors -mb-px", teamTab === key ? "border-[#4F46E5] text-[#4F46E5]" : "border-transparent text-[#64748B] hover:text-[#0F172A]")}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">
              {teamTab === "membres" && (
                <div>
                  {/* Invite button */}
                  <div className="px-5 py-3 border-b border-[#F1F5F9]">
                    <button onClick={() => setInviteOpen(true)} className="w-full h-9 rounded-lg bg-[#EEF2FF] text-[#4F46E5] text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-[#E0E7FF] transition-colors">
                      <UserPlus size={14} /> Inviter un praticien
                    </button>
                  </div>

                  {/* Members list */}
                  <div className="divide-y divide-[#F1F5F9]">
                    {selectedTeam.members.length === 0 ? (
                      <div className="px-5 py-8 text-center">
                        <UsersRound size={24} className="text-[#CBD5E1] mx-auto mb-2" />
                        <p className="text-sm text-[#94A3B8]">Cliquez pour voir les détails de cette équipe.</p>
                      </div>
                    ) : (
                      selectedTeam.members.map((m) => {
                        const st = MEMBER_STATUS_STYLE[m.status];
                        return (
                          <div key={m.id} className="px-5 py-3 flex items-center gap-3 hover:bg-[#FAFBFF] transition-colors">
                            <div className="relative">
                              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}>
                                {m.firstName[0]}{m.lastName[0]}
                              </div>
                              {m.status === "active" && (
                                <div className={cn("absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white", m.isOnline ? "bg-[#059669]" : "bg-[#CBD5E1]")} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                {m.isCoordinator && <Crown size={11} className="text-[#D97706]" />}
                                <p className="text-[13px] font-semibold text-[#0F172A] truncate">{m.firstName} {m.lastName}</p>
                              </div>
                              <p className="text-[11px] text-[#94A3B8]">{m.specialty}</p>
                            </div>
                            <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0", st.className)}>{st.label}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {teamTab === "patients" && (
                <div>
                  {selectedTeam.patients.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                      <User size={24} className="text-[#CBD5E1] mx-auto mb-2" />
                      <p className="text-sm text-[#94A3B8]">Aucun patient partagé dans cette équipe.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#F1F5F9]">
                      {selectedTeam.patients.map((p) => (
                        <Link key={p.id} href="/patients">
                          <div className="px-5 py-3 flex items-center gap-3 hover:bg-[#FAFBFF] transition-colors">
                            <div className="w-9 h-9 rounded-[10px] bg-[#EEF2FF] flex items-center justify-center text-[11px] font-bold text-[#4F46E5] shrink-0">
                              {p.firstName[0]}{p.lastName[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-[#0F172A]">{p.firstName} {p.lastName}</p>
                              <p className="text-[11px] text-[#94A3B8]">Coord : {p.coordinator} · {p.lastAction}</p>
                            </div>
                            <div className="text-right shrink-0">
                              {p.alerts > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded-full mb-0.5">
                                  <AlertTriangle size={9} /> {p.alerts}
                                </span>
                              )}
                              <p className="text-[10px] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>{p.lastActionTime}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {teamTab === "fil" && (
                <div className="px-5 py-6 space-y-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Discussion d'équipe</p>
                  {[
                    { initials: "KB", name: "Dr Benali", text: "Point rapide sur Théo Dufresne : le bilan bio n'a toujours pas été fait. Il faut relancer la famille.", time: "il y a 3h" },
                    { initials: "SM", name: "Sarah Morin", text: "Je le vois jeudi, je ferai un point nutrition et je vous tiens informés.", time: "il y a 2h" },
                    { initials: "NR", name: "Dr Roussel", text: "En séance il minimise toujours. L'entretien motivationnel progresse lentement mais on avance.", time: "il y a 1h" },
                  ].map((msg, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}>{msg.initials}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-[#0F172A]">{msg.name}</span>
                          <span className="text-[11px] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>{msg.time}</span>
                        </div>
                        <p className="text-[13px] text-[#374151] leading-relaxed mt-0.5">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4">
                    <input placeholder="Écrire à l'équipe…" className="w-full h-10 rounded-xl bg-[#F0F2FA] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20" />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal invitation ── */}
      <AnimatePresence>
        {inviteOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/30 backdrop-blur-sm" onClick={() => setInviteOpen(false)}>
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-5 border-b border-[#E8ECF4]">
                <h3 className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>Inviter un praticien</h3>
                <p className="text-sm text-[#64748B] mt-1">3 façons d'ajouter quelqu'un à votre équipe.</p>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* 3 modes */}
                <div className="grid grid-cols-3 gap-2">
                  {([["nami", "Sur Nami", Search], ["email", "Par email", Mail], ["external", "Hors Nami", User]] as const).map(([key, label, Icon]) => (
                    <button key={key} onClick={() => setInviteType(key)} className={cn("py-3 rounded-xl text-center transition-all border", inviteType === key ? "bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5]" : "border-[#E8ECF4] text-[#64748B] hover:border-[#94A3B8]")}>
                      <Icon size={18} className="mx-auto mb-1" />
                      <p className="text-[12px] font-medium">{label}</p>
                    </button>
                  ))}
                </div>

                {inviteType === "nami" && (
                  <div>
                    <input placeholder="Rechercher par nom, spécialité, RPPS…" className="w-full h-10 rounded-[10px] bg-[#F0F2FA] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20" />
                    <p className="text-[11px] text-[#94A3B8] mt-2">Invitation en 1 clic — ils verront les patients partagés immédiatement.</p>
                  </div>
                )}

                {inviteType === "email" && (
                  <div className="space-y-3">
                    <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@cabinet.fr" className="w-full h-10 rounded-[10px] bg-[#F0F2FA] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20" />
                    <div className="bg-[#F0F2FA] rounded-[10px] p-3 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-[#94A3B8]">OU LIEN D'INVITATION</p>
                        <p className="text-[11px] text-[#64748B] mt-0.5 font-mono">nami.care/invite/abc123</p>
                      </div>
                      <button onClick={copyLink} className="h-7 px-2.5 rounded-md bg-white text-[11px] font-medium text-[#64748B] flex items-center gap-1">
                        {linkCopied ? <><Check size={10} className="text-[#059669]" /> Copié</> : <><Copy size={10} /> Copier</>}
                      </button>
                    </div>
                    <p className="text-[11px] text-[#94A3B8]">Signup express en 45 secondes → direct dans l'équipe.</p>
                  </div>
                )}

                {inviteType === "external" && (
                  <div className="space-y-3">
                    <input placeholder="Nom du praticien" className="w-full h-10 rounded-[10px] bg-[#F0F2FA] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20" />
                    <input placeholder="Spécialité" className="w-full h-10 rounded-[10px] bg-[#F0F2FA] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20" />
                    <p className="text-[11px] text-[#94A3B8]">Contact externe — apparaîtra avec le badge "Hors Nami". Vous pourrez lui adresser des patients par email.</p>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-[#E8ECF4] flex justify-end gap-3">
                <button onClick={() => setInviteOpen(false)} className="px-4 py-2 rounded-xl text-sm text-[#64748B] hover:bg-[#F1F5F9]">Annuler</button>
                <button onClick={() => { toast.success("Invitation envoyée"); setInviteOpen(false); setInviteEmail(""); }} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-colors flex items-center gap-2">
                  <UserPlus size={14} /> Inviter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
