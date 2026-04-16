"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiWithToken, type PrescriptionDraft } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { ClipboardList, FileText, CheckCircle, X, AlertTriangle, ChevronDown, ChevronUp, Loader2, Pen } from "lucide-react";

interface Props {
  careCaseId: string;
}

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "text-green-700 bg-green-50" : pct >= 60 ? "text-amber-700 bg-amber-50" : "text-red-700 bg-red-50";
  return <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${color}`}>{pct}%</span>;
}

function StatusBadge({ status }: { status: PrescriptionDraft["status"] }) {
  const map = {
    DRAFT:     { label: "Brouillon", cls: "bg-gray-100 text-gray-700" },
    REVIEWED:  { label: "Relu", cls: "bg-blue-50 text-blue-700" },
    SIGNED:    { label: "Signé", cls: "bg-green-50 text-green-700" },
    CANCELLED: { label: "Annulé", cls: "bg-red-50 text-red-600" },
  };
  const { label, cls } = map[status] ?? map.DRAFT;
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

function DraftCard({ draft, onRefresh }: { draft: PrescriptionDraft; onRefresh: () => void }) {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(true);
  const [notes, setNotes] = useState(draft.prescriberNotes ?? "");
  const [editingNotes, setEditingNotes] = useState(false);
  const [confirmSign, setConfirmSign] = useState(false);

  const api = apiWithToken(accessToken!);

  const patchMutation = useMutation({
    mutationFn: (data: { prescriberNotes?: string }) => api.prescriptionDrafts.patch(draft.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prescription-drafts", draft.careCaseId] });
      setEditingNotes(false);
      toast.success("Brouillon mis à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const signMutation = useMutation({
    mutationFn: () => api.prescriptionDrafts.sign(draft.id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["prescription-drafts", draft.careCaseId] });
      qc.invalidateQueries({ queryKey: ["documents", draft.careCaseId] });
      toast.success("Ordonnance signée et enregistrée");
      onRefresh();
      window.open(res.pdfUrl, "_blank");
    },
    onError: () => toast.error("Erreur lors de la signature"),
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.prescriptionDrafts.cancel(draft.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prescription-drafts", draft.careCaseId] });
      toast.success("Brouillon annulé");
      onRefresh();
    },
    onError: () => toast.error("Erreur lors de l'annulation"),
  });

  const isSigned = draft.status === "SIGNED";
  const isCancelled = draft.status === "CANCELLED";
  const content = draft.content;

  return (
    <div className={`rounded-xl border bg-white overflow-hidden transition-shadow hover:shadow-md ${isSigned ? "border-green-200" : isCancelled ? "border-gray-200 opacity-60" : "border-violet-100"}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-2.5">
          <ClipboardList size={15} className={isSigned ? "text-green-600" : "text-violet-600"} />
          <span className="text-sm font-semibold text-gray-900">Brouillon d&apos;ordonnance</span>
          <StatusBadge status={draft.status} />
          {draft.extractionConfidence != null && !isSigned && (
            <ConfidenceBadge value={draft.extractionConfidence} />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400">
            {new Date(draft.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
          </span>
          {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50">

          {/* AI disclaimer */}
          {!isSigned && !isCancelled && (
            <div className="flex items-start gap-2 p-2.5 mt-3 mb-3 rounded-lg bg-amber-50 border border-amber-100">
              <AlertTriangle size={13} className="mt-0.5 text-amber-600 shrink-0" />
              <p className="text-[11px] text-amber-800 leading-snug">
                Brouillon extrait automatiquement depuis la transcription audio — à vérifier et corriger avant signature.
              </p>
            </div>
          )}

          {/* Warnings */}
          {content.warnings.length > 0 && (
            <div className="mb-3">
              {content.warnings.map((w, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] text-amber-700">
                  <span>⚠</span> {w}
                </div>
              ))}
            </div>
          )}

          {/* Medications */}
          {content.medications.length > 0 && (
            <div className="mb-4">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Médicaments prescrits</p>
              <div className="space-y-2">
                {content.medications.map((med, i) => (
                  <div key={i} className="flex flex-col gap-0.5 px-3 py-2 rounded-lg bg-violet-50/50 border border-violet-100/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">
                        {med.name.toUpperCase()}{med.dosage ? ` ${med.dosage}` : ""}{med.form ? ` — ${med.form}` : ""}
                      </span>
                      <ConfidenceBadge value={med.confidence} />
                    </div>
                    {med.route && <span className="text-[11px] text-gray-600">Voie : {med.route}</span>}
                    {med.frequency && <span className="text-[11px] text-gray-600">Posologie : {med.frequency}</span>}
                    {med.duration && <span className="text-[11px] text-gray-600">Durée : {med.duration}</span>}
                    {med.instructions && <span className="text-[11px] text-violet-700 italic">{med.instructions}</span>}
                    <span className="text-[10px] text-gray-400 mt-0.5 italic">&ldquo;{med.sourceSpan}&rdquo;</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complementary acts */}
          {content.complementaryActs.length > 0 && (
            <div className="mb-4">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Actes complémentaires</p>
              <div className="space-y-1.5">
                {content.complementaryActs.map((act, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <span className="mt-0.5 text-violet-500">—</span>
                    <div>
                      <span>{act.description}</span>
                      {act.urgency && <span className="ml-1 text-[11px] text-amber-700">({act.urgency})</span>}
                    </div>
                    <ConfidenceBadge value={act.confidence} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prescriber notes */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Notes prescripteur</p>
              {!isSigned && !isCancelled && !editingNotes && (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="flex items-center gap-1 text-[10px] text-violet-600 hover:text-violet-800"
                >
                  <Pen size={10} /> Modifier
                </button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  maxLength={5000}
                  placeholder="Annotations du prescripteur (posologie adaptée, contexte, contre-indications…)"
                  className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-violet-300 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => patchMutation.mutate({ prescriberNotes: notes })}
                    disabled={patchMutation.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-medium hover:bg-violet-700 transition disabled:opacity-50"
                  >
                    {patchMutation.isPending ? <Loader2 size={11} className="animate-spin" /> : null}
                    Enregistrer
                  </button>
                  <button
                    onClick={() => { setNotes(draft.prescriberNotes ?? ""); setEditingNotes(false); }}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-600 italic">
                {notes || <span className="text-gray-400">Aucune note ajoutée</span>}
              </p>
            )}
          </div>

          {/* Signature zone */}
          {isSigned && draft.signedAt && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-100">
              <CheckCircle size={13} className="text-green-600 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-green-800">Ordonnance signée</p>
                <p className="text-[11px] text-green-700">
                  {new Date(draft.signedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                  {" — "}Signature électronique simple (RGS*)
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          {!isSigned && !isCancelled && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
              {!confirmSign ? (
                <button
                  onClick={() => setConfirmSign(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition"
                >
                  <FileText size={12} /> Signer et générer PDF
                </button>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-700 font-medium">Confirmer la signature ?</span>
                  <button
                    onClick={() => { signMutation.mutate(); setConfirmSign(false); }}
                    disabled={signMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {signMutation.isPending ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                    Confirmer
                  </button>
                  <button
                    onClick={() => setConfirmSign(false)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition"
                  >
                    Annuler
                  </button>
                </div>
              )}
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-medium transition"
              >
                <X size={11} /> Supprimer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PrescriptionDraftEditor({ careCaseId }: Props) {
  const { accessToken } = useAuthStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["prescription-drafts", careCaseId],
    queryFn: () => apiWithToken(accessToken!).prescriptionDrafts.list(careCaseId),
    enabled: !!accessToken,
    staleTime: 30_000,
  });

  const drafts = data?.drafts ?? [];
  const activeDrafts = drafts.filter((d) => d.status !== "CANCELLED");

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
        <Loader2 size={14} className="animate-spin" />
        Chargement des ordonnances…
      </div>
    );
  }

  if (activeDrafts.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-gray-400">
        <ClipboardList size={24} className="mx-auto mb-2 opacity-40" />
        Aucun brouillon d&apos;ordonnance
        <p className="text-[11px] mt-1">Les brouillons sont générés automatiquement depuis l&apos;enregistrement audio des consultations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeDrafts.map((draft) => (
        <DraftCard key={draft.id} draft={draft} onRefresh={() => refetch()} />
      ))}
    </div>
  );
}
