"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { PatientDashboard } from "@/hooks/usePatientDashboard";

interface Props {
  dashboard: PatientDashboard;
  careCaseId: string;
}

type SubTab = "messages" | "adressages" | "rcp" | "equipe";

export function ViewCoordination({ dashboard, careCaseId }: Props) {
  const [subTab, setSubTab] = useState<SubTab>("messages");
  const { actions } = dashboard;

  const subTabs: { key: SubTab; label: string; count?: number }[] = [
    { key: "messages", label: "Messages" },
    { key: "adressages", label: "Adressages", count: actions.pendingReferrals.length + actions.suggestedReferrals.length },
    { key: "rcp", label: "RCP" },
    { key: "equipe", label: "Équipe" },
  ];

  return (
    <div>
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {subTabs.map((tab) => (
          <button key={tab.key} onClick={() => setSubTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${subTab === tab.key ? "border-[#5B4EC4] text-[#5B4EC4]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            {tab.label}
            {tab.count && tab.count > 0 ? (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">{tab.count}</span>
            ) : null}
          </button>
        ))}
      </div>

      {subTab === "messages" && <MessagesPanel careCaseId={careCaseId} />}
      {subTab === "adressages" && <AdressagesPanel dashboard={dashboard} careCaseId={careCaseId} />}
      {subTab === "rcp" && <RcpPanel careCaseId={careCaseId} />}
      {subTab === "equipe" && <EquipePanel careCaseId={careCaseId} />}
    </div>
  );
}

function MessagesPanel({ careCaseId }: { careCaseId: string }) {
  const qc = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");

  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", careCaseId],
    queryFn: async () => {
      const res = await api.get(`/care-cases/${careCaseId}/messages`);
      return res.data;
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post(`/care-cases/${careCaseId}/messages`, { body: content });
      return res.data;
    },
    onSuccess: () => {
      setNewMessage("");
      qc.invalidateQueries({ queryKey: ["messages", careCaseId] });
      qc.invalidateQueries({ queryKey: ["timeline", careCaseId] });
    },
    onError: () => toast.error("Erreur d'envoi"),
  });

  function handleSend() {
    if (!newMessage.trim() || sendMutation.isPending) return;
    sendMutation.mutate(newMessage.trim());
  }

  // Auto-scroll en bas à chaque nouveau message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Triple barrière urgence — Art. L.1110-4 CSP */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border-b border-red-100 rounded-t-xl">
        <span className="text-red-600 text-[11px] font-bold tracking-wide">🚨 En cas d&apos;urgence vitale : appelez le 15 ou le 112</span>
      </div>
      <div ref={scrollRef} className="max-h-[500px] overflow-y-auto p-4 space-y-3">
        {messages && Array.isArray(messages) && messages.length > 0 ? (
          messages.map((m: any) => (
            <div key={m.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EDE9FC] flex items-center justify-center text-xs font-semibold text-[#5B4EC4] flex-shrink-0">
                {(m.sender?.firstName?.[0] || "?").toUpperCase()}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-gray-900">{m.sender?.firstName} {m.sender?.lastName}</span>
                  <span className="text-[10px] text-gray-400">{new Date(m.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p className="text-sm text-gray-700 mt-0.5">{m.body}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 italic text-center py-8">Pas encore de messages</p>
        )}
      </div>
      <div className="border-t border-gray-200 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrire un message à l'équipe…"
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#5B4EC4] focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30 focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30 focus:ring-1 focus:ring-[#5B4EC4]"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sendMutation.isPending}
            className="px-4 py-2 bg-[#5B4EC4] text-white text-sm font-medium rounded-lg hover:bg-[#4A3DB3] transition-colors disabled:opacity-50"
          >
            {sendMutation.isPending ? "…" : "Envoyer"}
          </button>
        </div>
        <p className="text-[10px] text-red-400 mt-1.5 text-center">
          Cette messagerie n&apos;est pas un canal d&apos;urgence — En cas d&apos;urgence vitale : 15 / 112
        </p>
      </div>
    </div>
  );
}

const LINK_TYPE_LABEL: Record<string, string> = {
  CAUSED_BY: "Complication possible",
  COMORBID_WITH: "Comorbidité fréquente",
  COMORBIDITY: "Comorbidité potentielle",
  REQUIRES_SCREENING: "Dépistage recommandé",
  REQUIRES_COORDINATION: "Coordination nécessaire",
  TRIGGERS_SPECIALTY: "Spécialité requise",
  RISK_FACTOR: "Facteur de risque",
};

type InviteTarget = {
  specialty: string;
  comorbidity: string;
  linkType: string;
  fromCondition: string;
  source: string;
};

function InviteModal({ target, careCaseId, onClose }: {
  target: InviteTarget;
  careCaseId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"annuaire" | "lien">("annuaire");
  const [providerName, setProviderName] = useState("");

  const reason = `${LINK_TYPE_LABEL[target.linkType] ?? target.linkType} · ${target.comorbidity}`;

  const inviteMutation = useMutation({
    mutationFn: () =>
      api.post("/referrals", {
        careCaseId,
        preferredSpecialty: target.specialty,
        clinicalReason: `${target.comorbidity} — coordination recommandée`,
        referralType: "REFERRAL",
        priority: "ROUTINE",
        patientConsent: true,
      }),
    onSuccess: () => {
      toast.success("Invitation envoyée");
      queryClient.invalidateQueries({ queryKey: ["referrals", careCaseId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", careCaseId] });
      onClose();
    },
    onError: () => toast.error("Erreur lors de l'envoi de l'invitation"),
  });

  function copyLink() {
    const msg = `Bonjour, je vous invite à rejoindre un parcours de soins coordonnés sur Nami pour une consultation en ${target.specialty}. Inscrivez-vous sur : ${typeof window !== "undefined" ? window.location.origin : "https://nami.care"}/equipe`;
    navigator.clipboard.writeText(msg).then(() => toast.success("Lien copié dans le presse-papier"));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            Inviter un · <span className="text-[#5B4EC4]">{target.specialty}</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        {/* Motif */}
        <p className="text-sm text-gray-500 mb-5 bg-[#F8F7FD] rounded-lg px-3 py-2">
          Motif : <span className="font-medium text-gray-700">{reason}</span>
        </p>

        {/* Mode selector */}
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Comment inviter ?</p>
        <div className="space-y-3 mb-5">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="radio" name="mode" value="annuaire" checked={mode === "annuaire"}
              onChange={() => setMode("annuaire")} className="mt-0.5 accent-[#5B4EC4]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Chercher dans l'annuaire Nami</p>
              {mode === "annuaire" && (
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="Nom, spécialité…"
                  className="mt-2 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#5B4EC4] focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30 focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/30 focus:ring-1 focus:ring-[#5B4EC4]"
                  autoFocus
                />
              )}
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="radio" name="mode" value="lien" checked={mode === "lien"}
              onChange={() => setMode("lien")} className="mt-0.5 accent-[#5B4EC4]" />
            <div>
              <p className="text-sm font-medium text-gray-800">Envoyer un lien d'invitation</p>
              <p className="text-xs text-gray-400 mt-0.5">Le confrère peut s'inscrire et rejoindre le parcours</p>
            </div>
          </label>
        </div>

        {/* RGPD notice */}
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mb-5">
          <span className="shrink-0">⚠</span>
          <span>Le nom du patient ne sera pas communiqué dans l'invitation (RGPD santé)</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
            Annuler
          </button>
          {mode === "annuaire" ? (
            <button
              onClick={() => inviteMutation.mutate()}
              disabled={inviteMutation.isPending}
              className="text-sm px-4 py-2 rounded-lg bg-[#5B4EC4] text-white hover:bg-[#4A3DB3] disabled:opacity-50 font-medium"
            >
              {inviteMutation.isPending ? "Envoi…" : "Envoyer l'invitation"}
            </button>
          ) : (
            <button
              onClick={copyLink}
              className="text-sm px-4 py-2 rounded-lg bg-[#5B4EC4] text-white hover:bg-[#4A3DB3] font-medium"
            >
              Copier le lien
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AdressagesPanel({ dashboard, careCaseId }: { dashboard: PatientDashboard; careCaseId: string }) {
  const [inviteTarget, setInviteTarget] = useState<InviteTarget | null>(null);
  const { data: referrals, isLoading } = useQuery({
    queryKey: ["referrals", careCaseId],
    queryFn: async () => {
      const res = await api.get(`/care-cases/${careCaseId}/referrals`);
      return res.data;
    },
  });
  const { suggestedReferrals } = dashboard.actions;

  if (isLoading) return <LoadingSpinner />;

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700", SENT: "bg-blue-100 text-blue-700",
    ACCEPTED: "bg-green-100 text-green-700", DECLINED: "bg-red-100 text-red-700",
    COMPLETED: "bg-gray-100 text-gray-500",
  };
  const statusLabels: Record<string, string> = {
    PENDING: "En attente", SENT: "Envoyé", ACCEPTED: "Accepté",
    DECLINED: "Refusé", COMPLETED: "Terminé", IN_PROGRESS: "En cours",
    CANCELLED: "Annulé", EXPIRED: "Expiré",
  };

  return (
    <>
      {inviteTarget && (
        <InviteModal
          target={inviteTarget}
          careCaseId={careCaseId}
          onClose={() => setInviteTarget(null)}
        />
      )}
    <div className="space-y-5">
      {suggestedReferrals.length > 0 && (
        <div className="rounded-xl border border-[#5B4EC4]/20 bg-[#F8F7FD] p-4">
          <h4 className="text-sm font-semibold text-[#5B4EC4] mb-3 flex items-center gap-1.5">✨ Adressages suggérés par Nami</h4>
          <div className="space-y-2">
            {suggestedReferrals.map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">→ {s.specialty}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {LINK_TYPE_LABEL[s.linkType] ?? s.linkType} · {s.comorbidity}
                  </p>
                </div>
                <button
                  onClick={() => setInviteTarget(s)}
                  className="ml-3 text-xs px-3 py-1 rounded-lg bg-[#5B4EC4] text-white hover:bg-[#4A3DB3] shrink-0"
                >
                  Inviter
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Adressages</h4>
        {referrals && Array.isArray(referrals) && referrals.length > 0 ? (
          <div className="space-y-2">
            {referrals.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm text-gray-900">→ {r.toProvider?.firstName} {r.toProvider?.lastName || r.toSpecialty || "Spécialiste"}</p>
                  <p className="text-xs text-gray-400">{r.mode || "Consultation"} · {new Date(r.createdAt).toLocaleDateString("fr-FR")}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[r.status] || "bg-gray-100 text-gray-500"}`}>{statusLabels[r.status] || r.status}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-gray-400 italic">Aucun adressage</p>}
      </div>
    </div>
    </>
  );
}

function RcpPanel({ careCaseId }: { careCaseId: string }) {
  const router = useRouter();
  const { data: rcps, isLoading } = useQuery({
    queryKey: ["rcps", careCaseId],
    queryFn: async () => {
      const res = await api.get(`/care-cases/${careCaseId}/rcps`);
      return res.data;
    },
  });
  if (isLoading) return <LoadingSpinner />;

  const statusColors: Record<string, string> = {
    OPEN: "bg-blue-100 text-blue-700", IN_PROGRESS: "bg-amber-100 text-amber-700",
    CLOSED: "bg-green-100 text-green-700", CANCELLED: "bg-gray-100 text-gray-500",
  };
  const rcpStatusLabels: Record<string, string> = {
    OPEN: "Ouverte", IN_PROGRESS: "En cours", CLOSED: "Clôturée", CANCELLED: "Annulée",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900">Réunions de concertation</h4>
        <button onClick={() => router.push(`/patients/${careCaseId}/rcp`)} className="text-xs px-3 py-1.5 rounded-lg bg-[#5B4EC4] text-white hover:bg-[#4A3DB3]">Nouvelle RCP</button>
      </div>
      {rcps && Array.isArray(rcps) && rcps.length > 0 ? (
        <div className="space-y-2">
          {rcps.map((rcp: any) => (
            <div key={rcp.id} className="border border-gray-100 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{rcp.title}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[rcp.status] || ""}`}>{rcpStatusLabels[rcp.status] || rcp.status}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {rcp.type === "ASYNC" ? "Asynchrone" : "Synchrone"} · {new Date(rcp.createdAt).toLocaleDateString("fr-FR")}
                {rcp.participantCount ? ` · ${rcp.participantCount} participants` : ""}
              </p>
            </div>
          ))}
        </div>
      ) : <p className="text-sm text-gray-400 italic">Aucune RCP</p>}
    </div>
  );
}

function EquipePanel({ careCaseId }: { careCaseId: string }) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const { data: team, isLoading } = useQuery({
    queryKey: ["team", careCaseId],
    queryFn: async () => {
      const res = await api.get(`/care-cases/${careCaseId}/team`);
      return res.data;
    },
  });
  if (isLoading) return <LoadingSpinner />;

  const members = team?.members || team || [];
  const roleColors: Record<string, string> = {
    LEAD: "bg-[#EDE9FC] text-[#5B4EC4]", MEMBER: "bg-gray-100 text-gray-600", CONSULTANT: "bg-blue-50 text-blue-600",
  };

  return (
    <>
      {inviteOpen && (
        <InviteTeamModal careCaseId={careCaseId} onClose={() => setInviteOpen(false)} />
      )}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900">Équipe de soins</h4>
          <button
            onClick={() => setInviteOpen(true)}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#5B4EC4] text-[#5B4EC4] hover:bg-[#F8F7FD]"
          >
            Inviter
          </button>
        </div>
        {Array.isArray(members) && members.length > 0 ? (
          <div className="space-y-2">
            {members.map((m: any) => {
              const person = m.person || m;
              return (
                <div key={m.id} className="flex items-center gap-3 py-2">
                  <div className="w-9 h-9 rounded-full bg-[#EDE9FC] flex items-center justify-center text-sm font-semibold text-[#5B4EC4]">
                    {(person.firstName?.[0] || "?").toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{person.firstName} {person.lastName}</p>
                    <p className="text-xs text-gray-500">
                      {m.roleInCase || m.specialty || ""}
                      {m.lastContactAt ? ` · Dernier contact ${new Date(m.lastContactAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}` : ""}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${roleColors[m.role] || roleColors.MEMBER}`}>
                    {m.role === "LEAD" ? "Responsable" : m.role || "Membre"}
                  </span>
                </div>
              );
            })}
          </div>
        ) : <p className="text-sm text-gray-400 italic">Aucun membre</p>}
      </div>
    </>
  );
}

function InviteTeamModal({ careCaseId, onClose }: { careCaseId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [method, setMethod] = useState<"email" | "lien">("email");
  const [email, setEmail] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const inviteMutation = useMutation({
    mutationFn: (payload: { email?: string; careCaseId: string }) =>
      api.post("/invitations", payload),
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ["team", careCaseId] });
      if (method === "email") {
        toast.success("Invitation envoyée !");
        onClose();
      } else {
        const frontendUrl = typeof window !== "undefined" ? window.location.origin : "";
        setGeneratedLink(result?.data?.inviteUrl ?? `${frontendUrl}/invite/${result?.data?.token}`);
      }
    },
    onError: (err: any) => {
      if (err?.status === 403) {
        toast.error("Fonctionnalité réservée au tier Coordination");
      } else {
        toast.error("Erreur lors de l'envoi de l'invitation");
      }
    },
  });

  function handleSend() {
    if (method === "email") {
      if (!email.trim()) { toast.error("Saisissez un email"); return; }
      inviteMutation.mutate({ email: email.trim(), careCaseId });
    } else {
      inviteMutation.mutate({ careCaseId });
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(generatedLink);
    setLinkCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setLinkCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Inviter dans l&apos;équipe de soins</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        {/* Method toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-5">
          {(["email", "lien"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMethod(m); setGeneratedLink(""); }}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${method === m ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
            >
              {m === "email" ? "Par email" : "Par lien"}
            </button>
          ))}
        </div>

        {method === "email" && (
          <div className="mb-5">
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Email du confrère</label>
            <input
              type="email"
              placeholder="confrere@cabinet.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#5B4EC4] focus:ring-1 focus:ring-[#5B4EC4]"
              autoFocus
            />
          </div>
        )}

        {method === "lien" && !generatedLink && (
          <p className="text-xs text-gray-500 text-center py-4 mb-2">
            Générez un lien unique, valable 7 jours.<br />
            Le confrère peut s&apos;inscrire et rejoindre directement ce dossier.
          </p>
        )}

        {generatedLink && (
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5 mb-4">
            <p className="text-[11px] text-gray-500 flex-1 min-w-0 truncate font-mono">{generatedLink}</p>
            <button
              onClick={handleCopy}
              className="text-xs px-2.5 py-1 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-100 shrink-0"
            >
              {linkCopied ? "Copié ✓" : "Copier"}
            </button>
          </div>
        )}

        {/* RGPD notice */}
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mb-5">
          <span className="shrink-0">⚠</span>
          <span>Le nom du patient ne sera pas communiqué dans l&apos;invitation (RGPD santé)</span>
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
            Annuler
          </button>
          {!generatedLink && (
            <button
              onClick={handleSend}
              disabled={inviteMutation.isPending || (method === "email" && !email.trim())}
              className="text-sm px-4 py-2 rounded-lg bg-[#5B4EC4] text-white hover:bg-[#4A3DB3] disabled:opacity-50 font-medium"
            >
              {inviteMutation.isPending ? "Envoi…" : method === "email" ? "Envoyer l'invitation" : "Générer le lien"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-[#5B4EC4] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
