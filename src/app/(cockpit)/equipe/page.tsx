"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  UsersRound, UserPlus, Mail, Copy, Check,
  ArrowLeftRight, MessageSquare, FileText,
  ChevronRight, ExternalLink,
} from "lucide-react";

// ─── Mock data ──────────────────────────────────────────────────────────────

const TEAM_MEMBERS = [
  { id: "m-1", firstName: "Amélie", lastName: "Suela", specialty: "Médecin généraliste", email: "dr.suela@nami-demo.fr", isOnline: true, sharedPatients: 4, lastActive: "aujourd'hui" },
  { id: "m-2", firstName: "Margot", lastName: "Vire", specialty: "Diététicienne", email: "margot.vire.diet@nami-demo.fr", isOnline: true, sharedPatients: 3, lastActive: "aujourd'hui" },
  { id: "m-3", firstName: "Émilie", lastName: "Renard", specialty: "Psychologue TCA", email: "emilie.renard.psy@nami-demo.fr", isOnline: false, sharedPatients: 2, lastActive: "hier" },
  { id: "m-4", firstName: "Paul", lastName: "Durand", specialty: "Endocrinologue", email: "paul.durand.endo@nami-demo.fr", isOnline: false, sharedPatients: 1, lastActive: "il y a 3j" },
];

const SHARED_PATIENTS = [
  { id: "sp-1", firstName: "Gabrielle", lastName: "Martin", caseType: "TCA", risk: "HIGH", members: ["Amélie S.", "Margot V.", "Émilie R."], lastUpdate: "aujourd'hui" },
  { id: "sp-2", firstName: "Théo", lastName: "Dufresne", caseType: "TCA", risk: "CRITICAL", members: ["Amélie S.", "Margot V.", "Émilie R."], lastUpdate: "aujourd'hui" },
  { id: "sp-3", firstName: "Lucas", lastName: "Bernier", caseType: "TCA", risk: "MEDIUM", members: ["Amélie S.", "Margot V.", "Émilie R."], lastUpdate: "hier" },
  { id: "sp-4", firstName: "Sofia", lastName: "Alami", caseType: "Obésité", risk: "LOW", members: ["Amélie S.", "Margot V."], lastUpdate: "il y a 3j" },
];

const TEAM_REFERRALS = [
  { id: "tr-1", from: "Amélie Suela", to: "Émilie Renard", patient: "Théo Dufresne", status: "En cours", specialty: "Psychologue TCA", date: "il y a 2j" },
  { id: "tr-2", from: "Amélie Suela", to: "Paul Durand", patient: "Gabrielle Martin", status: "En attente", specialty: "Endocrinologue", date: "il y a 5j" },
  { id: "tr-3", from: "Margot Vire", to: "Amélie Suela", patient: "Lucas Bernier", status: "Accepté", specialty: "Médecin généraliste", date: "il y a 1 sem" },
];

const RISK_COLOR: Record<string, string> = {
  CRITICAL: "bg-[#FEF2F2] text-[#DC2626]",
  HIGH: "bg-[#FFFBEB] text-[#D97706]",
  MEDIUM: "bg-[#EFF6FF] text-[#2563EB]",
  LOW: "bg-[#F0FDF4] text-[#059669]",
};

const REFERRAL_STATUS_STYLE: Record<string, string> = {
  "En cours": "bg-[#EFF6FF] text-[#2563EB]",
  "En attente": "bg-[#FFFBEB] text-[#D97706]",
  "Accepté": "bg-[#F0FDF4] text-[#059669]",
};

const RECENT_ACTIVITY = [
  { id: "a-1", text: "Margot Vire a ajouté une note sur le dossier de Gabrielle Martin", time: "il y a 2h" },
  { id: "a-2", text: "Émilie Renard a accepté un adressage pour Théo Dufresne", time: "il y a 5h" },
  { id: "a-3", text: "Paul Durand a rejoint l'équipe via votre invitation", time: "hier" },
];

// ═════════════════════════════════════════════════════════════════════════════

export default function EquipePage() {
  const [tab, setTab] = useState<"membres" | "dossiers" | "adressages">("membres");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSpecialty, setInviteSpecialty] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  function handleInvite() {
    if (!inviteEmail.trim()) return;
    toast.success(`Invitation envoyée à ${inviteEmail}`);
    setInviteEmail("");
    setInviteSpecialty("");
    setInviteMessage("");
    setInviteOpen(false);
  }

  function copyInviteLink() {
    navigator.clipboard.writeText(`${window.location.origin}/invite/abc123`);
    setLinkCopied(true);
    toast.success("Lien d'invitation copié");
    setTimeout(() => setLinkCopied(false), 2000);
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-[#E8ECF4] px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight" style={{ fontFamily: "var(--font-jakarta)" }}>Mon équipe</h1>
            <p className="text-sm text-[#64748B] mt-0.5">{TEAM_MEMBERS.length} membres · {TEAM_MEMBERS.filter((m) => m.isOnline).length} en ligne</p>
          </div>
          <button
            onClick={() => setInviteOpen(true)}
            className="h-10 px-5 rounded-[10px] bg-[#4F46E5] text-white text-sm font-semibold flex items-center gap-2 hover:bg-[#4338CA] transition-colors"
          >
            <UserPlus size={16} /> Inviter un confrère
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-[#E8ECF4] px-6 shrink-0">
        <div className="flex gap-0">
          {([["membres", "Membres"], ["dossiers", "Dossiers partagés"], ["adressages", "Adressages internes"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${tab === key ? "border-[#4F46E5] text-[#4F46E5]" : "border-transparent text-[#64748B] hover:text-[#0F172A]"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#F0F2FA]">
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

          {/* ══ TAB MEMBRES ══ */}
          {tab === "membres" && <>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="nami-card p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-2" style={{ fontFamily: "var(--font-inter)" }}>Membres actifs</p>
              <p className="text-[32px] font-extrabold text-[#0F172A] tracking-tight" style={{ fontFamily: "var(--font-inter)" }}>{TEAM_MEMBERS.length}</p>
              <p className="text-xs text-[#64748B] mt-1">{TEAM_MEMBERS.filter((m) => m.isOnline).length} en ligne maintenant</p>
            </div>
            <div className="nami-card p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-2" style={{ fontFamily: "var(--font-inter)" }}>Patients co-gérés</p>
              <p className="text-[32px] font-extrabold text-[#0F172A] tracking-tight" style={{ fontFamily: "var(--font-inter)" }}>4</p>
              <p className="text-xs text-[#64748B] mt-1">Dossiers partagés avec l'équipe</p>
            </div>
            <div className="nami-card p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8] mb-2" style={{ fontFamily: "var(--font-inter)" }}>Adressages actifs</p>
              <p className="text-[32px] font-extrabold text-[#0F172A] tracking-tight" style={{ fontFamily: "var(--font-inter)" }}>3</p>
              <p className="text-xs text-[#64748B] mt-1">En cours entre membres</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Membres — 2 colonnes */}
            <div className="col-span-2 nami-card overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E8ECF4] flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Membres du cabinet</p>
                <button onClick={() => setInviteOpen(true)} className="text-xs font-semibold text-[#4F46E5] hover:underline flex items-center gap-1">
                  <UserPlus size={12} /> Inviter
                </button>
              </div>
              <div className="divide-y divide-[#F1F5F9]">
                {TEAM_MEMBERS.map((m) => (
                  <div key={m.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-[#FAFBFF] transition-colors">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}>
                        {m.firstName[0]}{m.lastName[0]}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${m.isOnline ? "bg-[#059669]" : "bg-[#CBD5E1]"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0F172A]">{m.firstName} {m.lastName}</p>
                      <p className="text-xs text-[#94A3B8]">{m.specialty}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-[#64748B]">{m.sharedPatients} patient{m.sharedPatients > 1 ? "s" : ""} partagé{m.sharedPatients > 1 ? "s" : ""}</p>
                      <p className="text-[10px] text-[#94A3B8]">Actif {m.lastActive}</p>
                    </div>
                    <ChevronRight size={14} className="text-[#CBD5E1]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Activité récente — 1 colonne */}
            <div className="nami-card overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E8ECF4]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Activité récente</p>
              </div>
              <div className="px-5 py-3 space-y-4">
                {RECENT_ACTIVITY.map((a) => (
                  <div key={a.id}>
                    <p className="text-[13px] text-[#374151] leading-snug">{a.text}</p>
                    <p className="text-[11px] text-[#94A3B8] mt-1" style={{ fontFamily: "var(--font-inter)" }}>{a.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          </>}

          {/* ══ TAB DOSSIERS PARTAGÉS ══ */}
          {tab === "dossiers" && (
            <div className="nami-card overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E8ECF4] flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Patients co-gérés · {SHARED_PATIENTS.length}</p>
              </div>
              <div className="divide-y divide-[#F1F5F9]">
                {SHARED_PATIENTS.map((p) => (
                  <Link key={p.id} href="/patients">
                    <div className="px-5 py-3.5 flex items-center gap-4 hover:bg-[#FAFBFF] transition-colors">
                      <div className="w-10 h-10 rounded-[10px] bg-[#EEF2FF] flex items-center justify-center text-sm font-bold text-[#4F46E5]">
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[#0F172A]">{p.firstName} {p.lastName}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${RISK_COLOR[p.risk]}`}>{p.risk === "CRITICAL" ? "Critique" : p.risk === "HIGH" ? "Élevé" : p.risk === "MEDIUM" ? "Modéré" : "Faible"}</span>
                        </div>
                        <p className="text-xs text-[#94A3B8] mt-0.5">{p.caseType} · {p.members.join(", ")}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Mis à jour {p.lastUpdate}</p>
                      </div>
                      <ChevronRight size={14} className="text-[#CBD5E1]" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ══ TAB ADRESSAGES INTERNES ══ */}
          {tab === "adressages" && (
            <div className="nami-card overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E8ECF4] flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Adressages entre membres · {TEAM_REFERRALS.length}</p>
                <Link href="/adressages" className="text-xs font-semibold text-[#4F46E5] hover:underline">Voir tous →</Link>
              </div>
              <div className="divide-y divide-[#F1F5F9]">
                {TEAM_REFERRALS.map((r) => (
                  <div key={r.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-[#FAFBFF] transition-colors">
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}>
                        {r.from.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <ArrowLeftRight size={12} className="text-[#CBD5E1]" />
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}>
                        {r.to.split(" ").map((n) => n[0]).join("")}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#0F172A]"><span className="font-semibold">{r.from}</span> → <span className="font-semibold">{r.to}</span></p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">Pour {r.patient} · {r.specialty}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${REFERRAL_STATUS_STYLE[r.status]}`}>{r.status}</span>
                    <span className="text-[11px] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>{r.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal invitation */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/20" onClick={() => setInviteOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-[480px] mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5">
              <h3 className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>Inviter un confrère</h3>
              <p className="text-sm text-[#64748B] mt-1">L'invitation sera envoyée par email. Le confrère pourra créer son compte en 45 secondes.</p>
            </div>

            <div className="px-6 pb-6 space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Email professionnel</label>
                <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="confrere@cabinet.fr" autoFocus className="w-full h-10 mt-1.5 rounded-[10px] bg-[#F0F2FA] px-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20" />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Spécialité</label>
                <input value={inviteSpecialty} onChange={(e) => setInviteSpecialty(e.target.value)} placeholder="Psychologue, Diététicien, Endocrinologue…" className="w-full h-10 mt-1.5 rounded-[10px] bg-[#F0F2FA] px-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20" />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Message personnalisé (optionnel)</label>
                <textarea value={inviteMessage} onChange={(e) => setInviteMessage(e.target.value)} placeholder="Bonjour, je souhaiterais collaborer avec vous sur le suivi de nos patients…" rows={3} className="w-full mt-1.5 rounded-[10px] bg-[#F0F2FA] p-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] resize-none focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20" />
              </div>

              {/* Lien d'invitation */}
              <div className="bg-[#F0F2FA] rounded-[10px] p-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>OU PARTAGEZ UN LIEN</p>
                  <p className="text-xs text-[#64748B] mt-0.5 font-mono">nami-web-orpin.vercel.app/invite/abc123</p>
                </div>
                <button onClick={copyInviteLink} className="h-8 px-3 rounded-lg bg-white text-xs font-semibold text-[#64748B] flex items-center gap-1.5 hover:bg-[#F8FAFC] transition-colors">
                  {linkCopied ? <><Check size={12} className="text-[#059669]" /> Copié</> : <><Copy size={12} /> Copier</>}
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E8ECF4] flex justify-end gap-3">
              <button onClick={() => setInviteOpen(false)} className="px-4 py-2 rounded-[10px] text-sm text-[#64748B] hover:bg-[#F0F2FA] transition-colors">Annuler</button>
              <button onClick={handleInvite} disabled={!inviteEmail.trim()} className={`px-6 py-2.5 rounded-[10px] text-sm font-semibold flex items-center gap-2 transition-colors ${inviteEmail.trim() ? "bg-[#4F46E5] text-white hover:bg-[#4338CA]" : "bg-[#E8ECF4] text-[#94A3B8] cursor-not-allowed"}`}>
                <Mail size={14} /> Envoyer l'invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
