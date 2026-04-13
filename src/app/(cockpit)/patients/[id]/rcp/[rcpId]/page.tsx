"use client";

import { useState, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type RcpDetail, type CloseRcpInput } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { MarkdownContent } from "@/components/MarkdownContent";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  ChevronLeft, Clock, Users, AlertTriangle, Zap, CheckCircle2,
  MessageSquare, Sparkles, X, Plus, Activity, FileText, Lock,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string }> = {
  OPEN:             { label: "Ouverte",          color: "bg-blue-100 text-blue-700" },
  IN_PROGRESS:      { label: "En cours",          color: "bg-indigo-100 text-indigo-700" },
  PENDING_DECISION: { label: "Décision attendue", color: "bg-amber-100 text-amber-700" },
  CLOSED:           { label: "Clôturée",          color: "bg-green-100 text-green-700" },
  CANCELLED:        { label: "Annulée",           color: "bg-gray-100 text-gray-500" },
};

const URGENCY_META: Record<string, { label: string; color: string }> = {
  ROUTINE:   { label: "Routine",  color: "text-gray-500" },
  URGENT:    { label: "Urgent",   color: "text-amber-600" },
  EMERGENCY: { label: "Urgence",  color: "text-red-600" },
};

const SEVERITY_META: Record<string, { color: string }> = {
  CRITICAL: { color: "bg-red-100 text-red-700 border-red-200" },
  HIGH:     { color: "bg-orange-100 text-orange-700 border-orange-200" },
  MEDIUM:   { color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  LOW:      { color: "bg-blue-100 text-blue-700 border-blue-200" },
};

const POSITION_META: Record<string, { label: string; color: string }> = {
  AGREE:          { label: "Accord",        color: "bg-green-100 text-green-700" },
  DISAGREE:       { label: "Désaccord",     color: "bg-red-100 text-red-700" },
  NEUTRAL:        { label: "Neutre",        color: "bg-gray-100 text-gray-600" },
  NEED_MORE_INFO: { label: "Info manquante", color: "bg-amber-100 text-amber-700" },
};

function parsePosition(body: string): { position: string | null; content: string } {
  const match = body.match(/^\[([A-Z_]+)\] ([\s\S]*)$/);
  if (match) return { position: match[1], content: match[2] };
  return { position: null, content: body };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Close RCP Modal ──────────────────────────────────────────────────────────

function CloseRcpModal({
  rcpId,
  onClose,
  onClosed,
}: {
  rcpId: string;
  onClose: () => void;
  onClosed: () => void;
}) {
  const { accessToken } = useAuthStore();
  type ActionItem = { title: string; description?: string; priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" };
  const [decision, setDecision]       = useState("");
  const [decisionType, setDecisionType] = useState<CloseRcpInput["decisionType"]>("CONSENSUS");
  const [actions, setActions]         = useState<ActionItem[]>([]);
  const [newAction, setNewAction]     = useState<ActionItem>({ title: "", description: "", priority: "MEDIUM" });

  const mutation = useMutation({
    mutationFn: () => apiWithToken(accessToken!).rcps.close(rcpId, { decision, decisionType, actions }),
    onSuccess: () => { toast.success("RCP clôturée — CR généré"); onClosed(); },
    onError:   () => toast.error("Erreur lors de la clôture"),
  });

  function addAction() {
    if (!newAction.title.trim()) return;
    setActions((prev) => [...prev, { ...newAction }]);
    setNewAction({ title: "", description: "", priority: "MEDIUM" });
  }

  function removeAction(i: number) {
    setActions((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600" />
            Clôturer la RCP
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Décision */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Décision collégiale *</label>
            <Textarea
              rows={4}
              placeholder="Résumez la décision prise par l'équipe..."
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
            />
          </div>

          {/* Type de décision */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Mode de décision</label>
            <div className="flex gap-3">
              {([
                { value: "CONSENSUS",           label: "Consensus" },
                { value: "MAJORITY",             label: "Majorité" },
                { value: "INITIATOR_DECISION",   label: "Décision initiateur" },
              ] as const).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDecisionType(value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm border transition-colors",
                    decisionType === value
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-slate-200 text-slate-600 hover:border-indigo-300"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Actions à créer</label>
            {actions.length > 0 && (
              <ul className="space-y-2 mb-3">
                {actions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-50 rounded-lg p-2.5 text-sm">
                    <span className="flex-1 font-medium">{a.title}</span>
                    {a.description && <span className="text-slate-500 text-xs">{a.description}</span>}
                    <button onClick={() => removeAction(i)} className="text-slate-400 hover:text-red-500 shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Titre de l'action"
                value={newAction.title}
                onChange={(e) => setNewAction((a) => ({ ...a, title: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAction())}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addAction} className="shrink-0">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !decision.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {mutation.isPending ? "Clôture en cours..." : "Clôturer et générer le CR"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Opinion Form ─────────────────────────────────────────────────────────────

function OpinionForm({ rcpId, myOpinionGiven, onSubmitted }: { rcpId: string; myOpinionGiven: boolean; onSubmitted: () => void }) {
  const { accessToken } = useAuthStore();
  const [content, setContent]   = useState("");
  const [position, setPosition] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => apiWithToken(accessToken!).rcps.opinion(rcpId, { content, position: position as never }),
    onSuccess: () => { toast.success(myOpinionGiven ? "Avis mis à jour" : "Avis envoyé"); setContent(""); onSubmitted(); },
    onError:   () => toast.error("Erreur lors de l'envoi de l'avis"),
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">
        {myOpinionGiven ? "Modifier mon avis" : "Donner mon avis"}
      </h3>

      {/* Position */}
      <div className="flex flex-wrap gap-2 mb-3">
        {([
          { value: "AGREE",          label: "D'accord" },
          { value: "DISAGREE",       label: "Pas d'accord" },
          { value: "NEUTRAL",        label: "Neutre" },
          { value: "NEED_MORE_INFO", label: "Info manquante" },
        ] as const).map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setPosition(position === value ? null : value)}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
              position === value
                ? "bg-indigo-600 text-white border-indigo-600"
                : "border-slate-200 text-slate-600 hover:border-indigo-300"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <Textarea
        rows={4}
        placeholder="Rédigez votre avis clinique..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="mb-3 text-sm"
      />

      <Button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !content.trim()}
        size="sm"
        className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
      >
        {mutation.isPending ? "Envoi..." : myOpinionGiven ? "Mettre à jour" : "Envoyer mon avis"}
      </Button>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function RcpDetailPage({ params }: { params: Promise<{ id: string; rcpId: string }> }) {
  const { id: patientId, rcpId } = use(params);
  const { accessToken, user }    = useAuthStore();
  const qc                        = useQueryClient();
  const [showClose, setShowClose] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

  const { data: rcp, isLoading } = useQuery<RcpDetail>({
    queryKey: ["rcp", rcpId],
    queryFn:  () => apiWithToken(accessToken!).rcps.get(rcpId),
    enabled:  !!accessToken,
  });

  function invalidate() { qc.invalidateQueries({ queryKey: ["rcp", rcpId] }); }

  async function handleSummarize() {
    setSummarizing(true);
    try {
      await apiWithToken(accessToken!).rcps.summarize(rcpId);
      toast.success("Synthèse IA générée");
      invalidate();
    } catch {
      toast.error("Erreur lors de la synthèse IA");
    } finally {
      setSummarizing(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Annuler cette RCP ?")) return;
    try {
      await apiWithToken(accessToken!).rcps.cancel(rcpId);
      toast.success("RCP annulée");
      invalidate();
    } catch {
      toast.error("Erreur lors de l'annulation");
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1,2,3].map((i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!rcp) {
    return (
      <div className="p-6 text-center text-slate-500">
        <p>RCP introuvable.</p>
        <Link href={`/patients/${patientId}/rcp`} className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
          ← Retour aux RCPs
        </Link>
      </div>
    );
  }

  const urgencyMeta = URGENCY_META[rcp.urgency];
  const statusMeta  = STATUS_META[rcp.status];
  const isClosed    = ["CLOSED", "CANCELLED"].includes(rcp.status);
  const myPersonId  = user?.id;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            href={`/patients/${patientId}/rcp`}
            className="mt-1 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{rcp.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusMeta.color)}>
                {statusMeta.label}
              </span>
              <span className={cn("text-xs font-medium flex items-center gap-1", urgencyMeta.color)}>
                {rcp.urgency === "EMERGENCY" ? <Zap className="w-3 h-3" /> : rcp.urgency === "URGENT" ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {urgencyMeta.label}
              </span>
              <span className="text-xs text-slate-400">
                {rcp.rcpType === "ASYNC" ? "Asynchrone" : "Synchrone"}
              </span>
              {rcp.initiator && (
                <span className="text-xs text-slate-400">
                  par {rcp.initiator.firstName} {rcp.initiator.lastName}
                </span>
              )}
              {rcp.deadline && (
                <span className="text-xs text-slate-500">
                  Échéance : {formatDate(rcp.deadline)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions header */}
        {!isClosed && (
          <div className="flex items-center gap-2 shrink-0">
            {rcp.canClose && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowClose(true)}
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
              >
                <Lock className="w-3.5 h-3.5 mr-1.5" />
                Clôturer
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleSummarize}
              disabled={summarizing}
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              {summarizing ? "Génération..." : "Synthèse IA"}
            </Button>
            {rcp.canClose && (
              <Button size="sm" variant="outline" onClick={handleCancel} className="text-slate-500">
                <X className="w-3.5 h-3.5 mr-1.5" />
                Annuler
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── Progress bar ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-600 font-medium flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Participation
          </span>
          <span className="text-slate-700 font-semibold">
            {rcp.respondedIds.length} / {rcp.participantIds.length} avis reçus
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: rcp.participantIds.length > 0 ? `${(rcp.respondedIds.length / rcp.participantIds.length) * 100}%` : "0%" }}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {rcp.participants.map((p) => {
            const responded = rcp.respondedIds.includes(p.id);
            return (
              <span
                key={p.id}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border",
                  responded
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-slate-50 text-slate-500 border-slate-200"
                )}
              >
                {responded ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {p.firstName} {p.lastName}
                <span className="text-slate-400">· {p.roleType}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* ── 2-column layout ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Colonne gauche : contexte ───────────────────────────────────── */}
        <div className="space-y-5">

          {/* Contexte + questions */}
          {(rcp.context || rcp.questions.length > 0) && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Contexte & Questions
              </h2>
              {rcp.context && (
                <p className="text-sm text-slate-700 whitespace-pre-line mb-4">{rcp.context}</p>
              )}
              {rcp.questions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Questions posées</p>
                  <ul className="space-y-1.5">
                    {rcp.questions.map((q, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Alertes */}
          {rcp.alerts.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Indicateurs actifs ({rcp.alerts.length})
              </h2>
              <ul className="space-y-2">
                {rcp.alerts.map((a, i) => (
                  <li key={i} className={cn("flex items-start gap-2 px-3 py-2 rounded-lg border text-sm", SEVERITY_META[a.severity]?.color ?? "bg-gray-50 text-gray-700")}>
                    <span className="font-medium">{a.title}</span>
                    {a.description && <span className="text-xs opacity-75">— {a.description}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Observations récentes */}
          {rcp.observations.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Dernières mesures
              </h2>
              <div className="space-y-2">
                {rcp.observations.map((o, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-sm text-slate-600">{o.label ?? o.key}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-800">
                        {o.value ?? "—"} {o.unit ?? ""}
                      </span>
                      <span className="block text-xs text-slate-400">{formatDate(o.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Synthèse IA */}
          {rcp.aiSummary && (
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
              <h2 className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Synthèse IA des avis
              </h2>
              <MarkdownContent content={rcp.aiSummary} className="text-purple-900" />
            </div>
          )}
        </div>

        {/* ── Colonne droite : avis ───────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Avis collectés */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              Avis collectés ({rcp.opinions.length})
            </h2>

            {rcp.opinions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Aucun avis pour l'instant.</p>
            ) : (
              <div className="space-y-4">
                {rcp.opinions.map((op) => {
                  const { position, content } = parsePosition(op.body);
                  return (
                    <div key={op.id} className="border border-slate-100 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-sm font-medium text-slate-800">
                            {op.author.firstName} {op.author.lastName}
                          </span>
                          <span className="text-xs text-slate-400 ml-1.5">· {op.author.roleType}</span>
                          {op.author.providerProfile?.specialties?.[0] && (
                            <span className="text-xs text-slate-400 ml-1">
                              · {op.author.providerProfile.specialties[0]}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {position && POSITION_META[position] && (
                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", POSITION_META[position].color)}>
                              {POSITION_META[position].label}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">{formatDate(op.createdAt)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-line">{content}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Formulaire avis — seulement si non clôturée */}
          {!isClosed && myPersonId && rcp.participantIds.includes(myPersonId) && (
            <OpinionForm
              rcpId={rcpId}
              myOpinionGiven={rcp.myOpinionGiven}
              onSubmitted={invalidate}
            />
          )}

          {/* Décision finale — si clôturée */}
          {isClosed && rcp.decision && (
            <div className="bg-green-50 rounded-xl border border-green-200 p-4">
              <h2 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Décision collégiale
                {rcp.decisionType && (
                  <span className="font-normal text-xs text-green-600 ml-1">
                    ({rcp.decisionType === "CONSENSUS" ? "Consensus" : rcp.decisionType === "MAJORITY" ? "Majorité" : "Initiateur"})
                  </span>
                )}
              </h2>
              <MarkdownContent content={rcp.decision} className="text-green-900" />
              {rcp.closedAt && (
                <p className="text-xs text-green-600 mt-2">Clôturée le {formatDate(rcp.closedAt)}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {showClose && (
        <CloseRcpModal
          rcpId={rcpId}
          onClose={() => setShowClose(false)}
          onClosed={() => { setShowClose(false); invalidate(); }}
        />
      )}
    </div>
  );
}
