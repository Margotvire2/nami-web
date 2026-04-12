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
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#5B4EC4] focus:ring-1 focus:ring-[#5B4EC4]"
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
      </div>
    </div>
  );
}

function AdressagesPanel({ dashboard, careCaseId }: { dashboard: PatientDashboard; careCaseId: string }) {
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

  return (
    <div className="space-y-5">
      {suggestedReferrals.length > 0 && (
        <div className="rounded-xl border border-[#5B4EC4]/20 bg-[#F8F7FD] p-4">
          <h4 className="text-sm font-semibold text-[#5B4EC4] mb-3 flex items-center gap-1.5">✨ Adressages suggérés par Nami</h4>
          <div className="space-y-2">
            {suggestedReferrals.map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">→ {s.specialty}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">{s.source}</span>
                  <button className="text-xs px-3 py-1 rounded-lg bg-[#5B4EC4] text-white hover:bg-[#4A3DB3]">Créer</button>
                </div>
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
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[r.status] || "bg-gray-100 text-gray-500"}`}>{r.status}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-gray-400 italic">Aucun adressage</p>}
      </div>
    </div>
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
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[rcp.status] || ""}`}>{rcp.status}</span>
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
  const router = useRouter();
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
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900">Équipe de soins</h4>
        <button onClick={() => router.push("/equipe")} className="text-xs px-3 py-1.5 rounded-lg border border-[#5B4EC4] text-[#5B4EC4] hover:bg-[#F8F7FD]">Inviter</button>
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
                  <p className="text-xs text-gray-500">{m.roleInCase || m.role || ""}</p>
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
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-[#5B4EC4] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
