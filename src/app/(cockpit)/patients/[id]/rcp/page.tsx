"use client";

import { useState, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type RcpSummary, type CreateRcpInput, type CareCaseMember } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Plus, ChevronLeft, Clock, CheckCircle2, Users, MessageSquare, AlertTriangle, Zap, Calendar } from "lucide-react";
import Link from "next/link";

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string }> = {
  OPEN:             { label: "Ouverte",          color: "bg-blue-100 text-blue-700" },
  IN_PROGRESS:      { label: "En cours",          color: "bg-indigo-100 text-indigo-700" },
  PENDING_DECISION: { label: "Décision attendue", color: "bg-amber-100 text-amber-700" },
  CLOSED:           { label: "Clôturée",          color: "bg-green-100 text-green-700" },
  CANCELLED:        { label: "Annulée",           color: "bg-gray-100 text-gray-500" },
};

const URGENCY_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ROUTINE:   { label: "Routine",  color: "text-gray-500",  icon: <Clock className="w-3 h-3" /> },
  URGENT:    { label: "Urgent",   color: "text-amber-600", icon: <AlertTriangle className="w-3 h-3" /> },
  EMERGENCY: { label: "Urgence",  color: "text-red-600",   icon: <Zap className="w-3 h-3" /> },
};

// ─── Create RCP Modal ─────────────────────────────────────────────────────────

function CreateRcpModal({
  careCaseId,
  members,
  onClose,
  onCreated,
}: {
  careCaseId: string;
  members: CareCaseMember[];
  onClose: () => void;
  onCreated: (rcpId: string) => void;
}) {
  const { accessToken } = useAuthStore();
  const [form, setForm] = useState<Partial<CreateRcpInput>>({
    rcpType: "ASYNC",
    urgency: "ROUTINE",
    questions: [],
    participantIds: [],
    generateContext: true,
  });
  const [questionInput, setQuestionInput] = useState("");

  const mutation = useMutation({
    mutationFn: (data: CreateRcpInput) =>
      apiWithToken(accessToken!).rcps.create(careCaseId, data),
    onSuccess: (rcp) => {
      toast.success("RCP ouverte avec succès");
      onCreated(rcp.id);
    },
    onError: () => toast.error("Erreur lors de la création de la RCP"),
  });

  const addQuestion = () => {
    if (!questionInput.trim()) return;
    setForm((f) => ({ ...f, questions: [...(f.questions ?? []), questionInput.trim()] }));
    setQuestionInput("");
  };

  const removeQuestion = (i: number) =>
    setForm((f) => ({ ...f, questions: f.questions?.filter((_, idx) => idx !== i) }));

  const toggleParticipant = (personId: string) =>
    setForm((f) => ({
      ...f,
      participantIds: f.participantIds?.includes(personId)
        ? f.participantIds.filter((id) => id !== personId)
        : [...(f.participantIds ?? []), personId],
    }));

  const canSubmit = !!form.title?.trim() && (form.participantIds?.length ?? 0) > 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle RCP</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Titre */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Titre *</label>
            <Input
              placeholder="Ex : RCP Gabrielle — Reprise pondérale M3"
              value={form.title ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          {/* Type + Urgence */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                value={form.rcpType}
                onChange={(e) => setForm((f) => ({ ...f, rcpType: e.target.value as "ASYNC" | "SYNC" }))}
              >
                <option value="ASYNC">Asynchrone</option>
                <option value="SYNC">Synchrone (visio)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Urgence</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                value={form.urgency}
                onChange={(e) => setForm((f) => ({ ...f, urgency: e.target.value as CreateRcpInput["urgency"] }))}
              >
                <option value="ROUTINE">Routine (7j)</option>
                <option value="URGENT">Urgent (48h)</option>
                <option value="EMERGENCY">Urgence (immédiat)</option>
              </select>
            </div>
          </div>

          {/* Deadline / Date visio */}
          {form.rcpType === "ASYNC" ? (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Date limite des avis</label>
              <Input
                type="datetime-local"
                value={form.deadline ? form.deadline.slice(0, 16) : ""}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
              />
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Date de la visio</label>
              <Input
                type="datetime-local"
                value={form.scheduledAt ? form.scheduledAt.slice(0, 16) : ""}
                onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
              />
            </div>
          )}

          {/* Contexte */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Contexte clinique</label>
              <label className="flex items-center gap-1.5 text-xs text-indigo-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.generateContext}
                  onChange={(e) => setForm((f) => ({ ...f, generateContext: e.target.checked }))}
                  className="accent-indigo-500"
                />
                Générer via IA
              </label>
            </div>
            <Textarea
              placeholder="Résumé clinique pour l'équipe... (ou laisser vide pour générer)"
              value={form.context ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, context: e.target.value }))}
              rows={3}
              className="text-sm"
            />
          </div>

          {/* Questions */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Questions posées à l&apos;équipe</label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex : Faut-il envisager une hospitalisation ?"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addQuestion())}
                className="text-sm"
              />
              <Button variant="outline" size="sm" onClick={addQuestion}>Ajouter</Button>
            </div>
            {(form.questions?.length ?? 0) > 0 && (
              <ul className="mt-2 space-y-1">
                {form.questions?.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm bg-gray-50 rounded-lg px-3 py-1.5">
                    <span className="flex-1 text-gray-700">• {q}</span>
                    <button onClick={() => removeQuestion(i)} className="text-gray-400 hover:text-red-500 text-xs mt-0.5">✕</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Participants */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Participants * <span className="text-gray-400 font-normal">(membres de l&apos;équipe)</span>
            </label>
            <div className="space-y-2">
              {members.filter((m) => m.status === "ACCEPTED").map((m) => {
                const pid = m.person.id;
                const selected = form.participantIds?.includes(pid);
                return (
                  <label key={m.id} className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    selected ? "border-indigo-300 bg-indigo-50" : "border-gray-200 hover:bg-gray-50"
                  )}>
                    <input
                      type="checkbox"
                      checked={!!selected}
                      onChange={() => toggleParticipant(pid)}
                      className="accent-indigo-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{m.person.firstName} {m.person.lastName}</p>
                      <p className="text-xs text-gray-500">{m.provider?.specialties?.join(", ") || m.roleInCase}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button
            disabled={!canSubmit || mutation.isPending}
            onClick={() => mutation.mutate(form as CreateRcpInput)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {mutation.isPending ? "Ouverture…" : "Ouvrir la RCP"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── RCP Card ─────────────────────────────────────────────────────────────────

function RcpCard({ rcp, careCaseId }: { rcp: RcpSummary; careCaseId: string }) {
  const status = STATUS_META[rcp.status] ?? STATUS_META.OPEN;
  const urgency = URGENCY_META[rcp.urgency] ?? URGENCY_META.ROUTINE;
  const responded = rcp.respondedIds.length;
  const total     = rcp.participantIds.length;

  return (
    <Link href={`/patients/${careCaseId}/rcp/${rcp.id}`}>
      <div className={cn(
        "bg-white border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer",
        rcp.waitingForMyOpinion ? "border-indigo-300 ring-1 ring-indigo-200" : "border-gray-200"
      )}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", status.color)}>
                {status.label}
              </span>
              <span className={cn("inline-flex items-center gap-1 text-xs", urgency.color)}>
                {urgency.icon} {urgency.label}
              </span>
              {rcp.waitingForMyOpinion && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  ⏳ Mon avis attendu
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 truncate">{rcp.title}</h3>
          </div>
          <div className="text-right text-xs text-gray-500 shrink-0">
            {new Date(rcp.openedAt).toLocaleDateString("fr-FR")}
          </div>
        </div>

        {/* Contexte (aperçu) */}
        {rcp.context && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-3">{rcp.context}</p>
        )}

        {/* Footer stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {responded}/{total} avis
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            {rcp.opinionsCount} contribution{rcp.opinionsCount !== 1 ? "s" : ""}
          </span>
          {rcp.rcpType === "SYNC" && rcp.scheduledAt && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Visio {new Date(rcp.scheduledAt).toLocaleDateString("fr-FR")}
            </span>
          )}
          {rcp.deadline && rcp.status !== "CLOSED" && rcp.status !== "CANCELLED" && (
            <span className="flex items-center gap-1 text-amber-600">
              <Clock className="w-3.5 h-3.5" />
              {new Date(rcp.deadline).toLocaleDateString("fr-FR")}
            </span>
          )}
          {rcp.status === "CLOSED" && (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {rcp.decisionType}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function RcpListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: careCaseId } = use(params);
  const { accessToken } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const api = apiWithToken(accessToken!);

  const { data: rcps = [], isLoading } = useQuery({
    queryKey: ["rcps", careCaseId],
    queryFn: () => api.rcps.list(careCaseId),
    enabled: !!accessToken,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["team", careCaseId],
    queryFn:  () => api.team.list(careCaseId),
    enabled: !!accessToken,
  });

  const pending = rcps.filter((r) => r.waitingForMyOpinion).length;
  const active  = rcps.filter((r) => !["CLOSED","CANCELLED"].includes(r.status));
  const closed  = rcps.filter((r) =>  ["CLOSED","CANCELLED"].includes(r.status));

  return (
    <div className="min-h-screen bg-[#F0F2FA]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">RCP Virtuelles</h1>
            <p className="text-sm text-gray-500">Réunions de Concertation Pluridisciplinaire</p>
          </div>
          {pending > 0 && (
            <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {pending} en attente
            </span>
          )}
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Nouvelle RCP
          </Button>
        </div>

        {/* Liste */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : rcps.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <Users className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-1">Aucune RCP pour ce dossier</h3>
            <p className="text-sm text-gray-500 mb-4">Ouvrez une RCP pour impliquer l&apos;équipe dans une décision collégiale.</p>
            <Button onClick={() => setShowCreate(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="w-4 h-4 mr-1" /> Ouvrir la première RCP
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {active.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">En cours ({active.length})</h2>
                <div className="space-y-3">
                  {active.map((r) => <RcpCard key={r.id} rcp={r} careCaseId={careCaseId} />)}
                </div>
              </div>
            )}
            {closed.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">Historique ({closed.length})</h2>
                <div className="space-y-3">
                  {closed.map((r) => <RcpCard key={r.id} rcp={r} careCaseId={careCaseId} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateRcpModal
          careCaseId={careCaseId}
          members={members}
          onClose={() => setShowCreate(false)}
          onCreated={(rcpId) => {
            setShowCreate(false);
            qc.invalidateQueries({ queryKey: ["rcps", careCaseId] });
            router.push(`/patients/${careCaseId}/rcp/${rcpId}`);
          }}
        />
      )}
    </div>
  );
}
