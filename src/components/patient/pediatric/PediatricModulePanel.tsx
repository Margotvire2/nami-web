"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { Plus, ChevronDown, ChevronUp, UserPlus, PowerOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ModuleMember {
  id: string;
  role: string;
  provider: { id: string; firstName: string; lastName: string; email: string };
}

interface PedModule {
  id: string;
  type: string;
  status: "ACTIVE" | "SUSPENDED" | "RESOLVED";
  activationReason: string | null;
  activatedAt: string;
  activatedBy: { firstName: string; lastName: string };
  members: ModuleMember[];
}

interface Props {
  profileId: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const MODULE_TYPES: { type: string; label: string }[] = [
  { type: "NUTRITION",         label: "Nutrition" },
  { type: "TND_TSA",           label: "TND / TSA" },
  { type: "TCA_PEDIATRIC",     label: "TCA pédiatrique" },
  { type: "GASTRO",            label: "Gastro-pédiatrie" },
  { type: "OBESITY_PEDIATRIC", label: "Obésité pédiatrique" },
  { type: "ENDOCRINOLOGY",     label: "Endocrinologie" },
  { type: "MENTAL_HEALTH",     label: "Santé mentale" },
  { type: "PNEUMOLOGY",        label: "Pneumologie" },
  { type: "RARE_DISEASE",      label: "Maladie rare" },
];

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:    "bg-emerald-100 text-emerald-700",
  SUSPENDED: "bg-amber-100 text-amber-700",
  RESOLVED:  "bg-gray-100 text-gray-500",
};

export function PediatricModulePanel({ profileId }: Props) {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  const [showActivateForm, setShowActivateForm] = useState(false);
  const [newModuleType, setNewModuleType] = useState("NUTRITION");
  const [newModuleReason, setNewModuleReason] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [inviteModuleId, setInviteModuleId] = useState<string | null>(null);
  const [invitePersonId, setInvitePersonId] = useState("");
  const [inviteRole, setInviteRole] = useState("");

  const { data: modules = [], isLoading } = useQuery<PedModule[]>({
    queryKey: ["pediatric-modules", profileId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/pediatric/profiles/${profileId}/modules`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error();
      return res.json() as Promise<PedModule[]>;
    },
    enabled: !!accessToken && !!profileId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["pediatric-modules", profileId] });

  const activateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/pediatric/profiles/${profileId}/modules`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type: newModuleType, activationReason: newModuleReason || undefined }),
      });
      if (!res.ok) { const err = await res.json() as { error: string }; throw new Error(err.error); }
    },
    onSuccess: () => {
      toast.success("Module activé");
      setShowActivateForm(false);
      setNewModuleReason("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deactivateMutation = useMutation({
    mutationFn: async ({ moduleId, status }: { moduleId: string; status: "SUSPENDED" | "RESOLVED" }) => {
      const res = await fetch(`${API_URL}/pediatric/profiles/${profileId}/modules/${moduleId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
    },
    onSuccess: () => { toast.success("Module mis à jour"); invalidate(); },
    onError: () => toast.error("Erreur"),
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ moduleId }: { moduleId: string }) => {
      const res = await fetch(`${API_URL}/pediatric/profiles/${profileId}/modules/${moduleId}/members`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: invitePersonId, role: inviteRole }),
      });
      if (!res.ok) { const err = await res.json() as { error: string }; throw new Error(err.error); }
    },
    onSuccess: () => {
      toast.success("Soignant ajouté au module");
      setInviteModuleId(null);
      setInvitePersonId("");
      setInviteRole("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return <div className="flex items-center gap-2 text-xs text-[#6B7280] py-2"><Loader2 size={13} className="animate-spin" /> Chargement…</div>;
  }

  const activeModules  = modules.filter((m) => m.status === "ACTIVE");
  const closedModules  = modules.filter((m) => m.status !== "ACTIVE");

  return (
    <div className="space-y-3">
      {/* Modules actifs */}
      {activeModules.map((m) => {
        const expanded = expandedIds.has(m.id);
        const typeLabel = MODULE_TYPES.find((t) => t.type === m.type)?.label ?? m.type;
        return (
          <div key={m.id} className="border border-[rgba(26,26,46,0.08)] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <p className="text-sm font-semibold text-[#1A1A2E] flex-1">{typeLabel}</p>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[m.status]}`}>{m.status === "ACTIVE" ? "Actif" : m.status}</span>
              <button onClick={() => setExpandedIds((s) => { const n = new Set(s); n.has(m.id) ? n.delete(m.id) : n.add(m.id); return n; })} className="text-[#6B7280]">
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            <p className="text-[10px] text-[#6B7280]">
              Activé par {m.activatedBy.firstName} {m.activatedBy.lastName} · {new Date(m.activatedAt).toLocaleDateString("fr-FR")}
              {m.activationReason && ` · ${m.activationReason}`}
            </p>

            {expanded && (
              <div className="space-y-2 pt-1 border-t border-[rgba(26,26,46,0.04)]">
                {/* Membres */}
                <p className="text-[10px] font-medium text-[#374151]">Membres ({m.members.length})</p>
                {m.members.map((mem) => (
                  <div key={mem.id} className="flex items-center gap-2 text-xs">
                    <div className="w-6 h-6 rounded-full bg-[#5B4EC4]/10 flex items-center justify-center text-[9px] font-bold text-[#5B4EC4]">
                      {mem.provider.firstName[0]}{mem.provider.lastName[0]}
                    </div>
                    <span className="text-[#1A1A2E]">{mem.provider.firstName} {mem.provider.lastName}</span>
                    <span className="text-[#6B7280]">· {mem.role}</span>
                  </div>
                ))}

                {/* Inviter un membre */}
                {inviteModuleId === m.id ? (
                  <div className="space-y-2 pt-2">
                    <input
                      placeholder="Person ID du soignant"
                      value={invitePersonId}
                      onChange={(e) => setInvitePersonId(e.target.value)}
                      className="w-full text-xs border border-[rgba(26,26,46,0.1)] rounded px-2 py-1"
                    />
                    <input
                      placeholder="Rôle (ex: Diététicienne référente)"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full text-xs border border-[rgba(26,26,46,0.1)] rounded px-2 py-1"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => inviteMutation.mutate({ moduleId: m.id })}
                        disabled={!invitePersonId || !inviteRole || inviteMutation.isPending}
                        className="flex-1 text-xs bg-[#5B4EC4] text-white rounded-lg py-1.5 hover:bg-[#5B4EC4] disabled:opacity-50"
                      >
                        Ajouter
                      </button>
                      <button onClick={() => setInviteModuleId(null)} className="text-xs text-[#6B7280] px-3">
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setInviteModuleId(m.id)}
                      className="flex items-center gap-1 text-xs text-[#5B4EC4] hover:underline"
                    >
                      <UserPlus size={11} /> Inviter un soignant
                    </button>
                    <button
                      onClick={() => deactivateMutation.mutate({ moduleId: m.id, status: "RESOLVED" })}
                      className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-red-500 ml-auto"
                    >
                      <PowerOff size={11} /> Clôturer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Modules fermés — résumé compact */}
      {closedModules.length > 0 && (
        <div className="text-[10px] text-[#6B7280]">
          {closedModules.length} module{closedModules.length > 1 ? "s" : ""} clôturé{closedModules.length > 1 ? "s" : ""}
        </div>
      )}

      {/* Formulaire activation */}
      {showActivateForm ? (
        <div className="border border-[#5B4EC4]/20 rounded-xl p-4 space-y-3 bg-[#5B4EC4]/3">
          <p className="text-xs font-semibold text-[#1A1A2E]">Activer un module de spécialité</p>
          <select
            value={newModuleType}
            onChange={(e) => setNewModuleType(e.target.value)}
            className="w-full text-xs border border-[rgba(26,26,46,0.1)] rounded-lg px-3 py-2"
          >
            {MODULE_TYPES.map((t) => (
              <option key={t.type} value={t.type}>{t.label}</option>
            ))}
          </select>
          <input
            placeholder="Motif d'activation (optionnel)"
            value={newModuleReason}
            onChange={(e) => setNewModuleReason(e.target.value)}
            className="w-full text-xs border border-[rgba(26,26,46,0.1)] rounded-lg px-3 py-2"
          />
          <div className="flex gap-2">
            <button
              onClick={() => activateMutation.mutate()}
              disabled={activateMutation.isPending}
              className="flex-1 bg-[#5B4EC4] text-white text-xs rounded-lg py-2 hover:bg-[#5B4EC4] disabled:opacity-50"
            >
              {activateMutation.isPending ? "Activation…" : "Activer"}
            </button>
            <button onClick={() => setShowActivateForm(false)} className="text-xs text-[#6B7280] px-4">
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowActivateForm(true)}
          className="flex items-center gap-2 text-xs text-[#5B4EC4] hover:bg-[#5B4EC4]/5 rounded-lg px-3 py-2 transition-colors w-full"
        >
          <Plus size={13} /> Activer un module de spécialité
        </button>
      )}
    </div>
  );
}
