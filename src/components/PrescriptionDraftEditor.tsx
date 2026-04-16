"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiWithToken, type PrescriptionDraft } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import {
  ClipboardList, FileText, CheckCircle, X, AlertTriangle,
  ChevronDown, ChevronUp, Loader2, Pen, Plus, Trash2, FlaskConical,
} from "lucide-react";
import { expandLabPanel, findDuplicatePanel } from "@/lib/lab-panel-dictionary";

// ─── Local types ─────────────────────────────────────────────────────────────

type Medication = PrescriptionDraft["content"]["medications"][number];
type ComplementaryAct = PrescriptionDraft["content"]["complementaryActs"][number];
type PatchData = { content?: PrescriptionDraft["content"]; prescriberNotes?: string };

interface Props { careCaseId: string }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isManualEntry(confidence: number, sourceSpan: string) {
  return confidence === 0 && !sourceSpan;
}

// ─── Badges ──────────────────────────────────────────────────────────────────

function ConfidenceBadge({ confidence, sourceSpan }: { confidence: number; sourceSpan: string }) {
  if (isManualEntry(confidence, sourceSpan)) {
    return (
      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
        Ajouté manuellement
      </span>
    );
  }
  const pct = Math.round(confidence * 100);
  const cls = pct >= 80 ? "text-green-700 bg-green-50" : pct >= 60 ? "text-amber-700 bg-amber-50" : "text-red-700 bg-red-50";
  return <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cls}`}>IA {pct}%</span>;
}

function StatusBadge({ status }: { status: PrescriptionDraft["status"] }) {
  const map: Record<string, { label: string; cls: string }> = {
    DRAFT:     { label: "Brouillon", cls: "bg-gray-100 text-gray-700" },
    REVIEWED:  { label: "Relu",      cls: "bg-blue-50 text-blue-700" },
    SIGNED:    { label: "Signé",     cls: "bg-green-50 text-green-700" },
    CANCELLED: { label: "Annulé",   cls: "bg-red-50 text-red-600" },
  };
  const { label, cls } = map[status] ?? map.DRAFT;
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

// ─── MedicationRow ────────────────────────────────────────────────────────────

function MedicationRow({
  med, index, isReadOnly, onChange, onDelete,
}: {
  med: Medication;
  index: number;
  isReadOnly: boolean;
  onChange: (i: number, updated: Medication) => void;
  onDelete: (i: number) => void;
}) {
  const [editing, setEditing]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draft, setDraft]               = useState<Medication>(med);

  const save = () => { onChange(index, draft); setEditing(false); };
  const cancel = () => { setDraft(med); setEditing(false); };

  if (editing) {
    return (
      <div className="px-3 py-3 rounded-lg bg-violet-50/60 border border-violet-200 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Médicament *</label>
            <input
              className="mt-0.5 w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-violet-300 focus:outline-none"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="Ex : Dépakine"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Dosage</label>
            <input
              className="mt-0.5 w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-violet-300 focus:outline-none"
              value={draft.dosage}
              onChange={(e) => setDraft((d) => ({ ...d, dosage: e.target.value }))}
              placeholder="Ex : 500 mg"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Forme</label>
            <select
              className="mt-0.5 w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-violet-300 focus:outline-none bg-white"
              value={draft.form}
              onChange={(e) => setDraft((d) => ({ ...d, form: e.target.value }))}
            >
              <option value="">— Choisir</option>
              {["comprimé","gélule","solution buvable","sirop","suspension","injectable","patch transdermique","suppositoire","pommade","crème","collyre","spray nasal","inhalateur","sachet"].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Voie</label>
            <select
              className="mt-0.5 w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-violet-300 focus:outline-none bg-white"
              value={draft.route}
              onChange={(e) => setDraft((d) => ({ ...d, route: e.target.value }))}
            >
              <option value="">— Choisir</option>
              {["per os","sublingual","intraveineux","intramusculaire","sous-cutané","cutané","rectal","oculaire","nasal","inhalé"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Posologie</label>
            <input
              className="mt-0.5 w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-violet-300 focus:outline-none"
              value={draft.frequency}
              onChange={(e) => setDraft((d) => ({ ...d, frequency: e.target.value }))}
              placeholder="Ex : 2×/jour"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Durée</label>
            <input
              className="mt-0.5 w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-violet-300 focus:outline-none"
              value={draft.duration}
              onChange={(e) => setDraft((d) => ({ ...d, duration: e.target.value }))}
              placeholder="Ex : 3 mois"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Instructions</label>
            <input
              className="mt-0.5 w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-violet-300 focus:outline-none"
              value={draft.instructions ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, instructions: e.target.value || null }))}
              placeholder="Ex : À prendre pendant les repas"
            />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={save}
            disabled={!draft.name.trim()}
            className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-medium hover:bg-violet-700 transition disabled:opacity-50"
          >
            Enregistrer
          </button>
          <button onClick={cancel} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition">
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 px-3 py-2 rounded-lg bg-violet-50/50 border border-violet-100/60">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-900">
            {med.name.toUpperCase()}{med.dosage ? ` ${med.dosage}` : ""}{med.form ? ` — ${med.form}` : ""}
          </span>
          <ConfidenceBadge confidence={med.confidence} sourceSpan={med.sourceSpan} />
        </div>
        {!isReadOnly && (
          <div className="flex items-center gap-1 shrink-0">
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-red-600">Supprimer ?</span>
                <button onClick={() => onDelete(index)} className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-medium hover:bg-red-700">Oui</button>
                <button onClick={() => setConfirmDelete(false)} className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] hover:bg-gray-200">Non</button>
              </div>
            ) : (
              <>
                <button onClick={() => { setDraft(med); setEditing(true); }} className="p-1 rounded text-violet-500 hover:text-violet-700 hover:bg-violet-50 transition" title="Modifier"><Pen size={11} /></button>
                <button onClick={() => setConfirmDelete(true)} className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition" title="Supprimer"><Trash2 size={11} /></button>
              </>
            )}
          </div>
        )}
      </div>
      {med.route     && <span className="text-[11px] text-gray-600">Voie : {med.route}</span>}
      {med.frequency && <span className="text-[11px] text-gray-600">Posologie : {med.frequency}</span>}
      {med.duration  && <span className="text-[11px] text-gray-600">Durée : {med.duration}</span>}
      {med.instructions && <span className="text-[11px] text-violet-700 italic">{med.instructions}</span>}
      {!isManualEntry(med.confidence, med.sourceSpan) && med.sourceSpan && (
        <span className="text-[10px] text-gray-400 mt-0.5 italic">&ldquo;{med.sourceSpan}&rdquo;</span>
      )}
    </div>
  );
}

// ─── ActRow ───────────────────────────────────────────────────────────────────

function ActRow({
  act, index, isReadOnly, allActDescriptions, onChange, onDelete,
}: {
  act: ComplementaryAct;
  index: number;
  isReadOnly: boolean;
  allActDescriptions: string[];
  onChange: (i: number, updated: ComplementaryAct) => void;
  onDelete: (i: number) => void;
}) {
  const [editing, setEditing]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draft, setDraft]               = useState<ComplementaryAct>(act);

  const expansion    = expandLabPanel(act.description);
  const otherDescs   = allActDescriptions.filter((_, i) => i !== index);
  const duplicateIn  = findDuplicatePanel(act.description, otherDescs);

  const save   = () => { onChange(index, draft); setEditing(false); };
  const cancel = () => { setDraft(act); setEditing(false); };

  if (editing) {
    return (
      <div className="px-3 py-3 rounded-lg bg-teal-50/60 border border-teal-200 space-y-2">
        <div className="space-y-2">
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Type</label>
            <select
              className="mt-0.5 w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-teal-300 focus:outline-none bg-white"
              value={draft.type}
              onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as ComplementaryAct["type"] }))}
            >
              <option value="LAB_TEST">Biologie (LAB_TEST)</option>
              <option value="IMAGING">Imagerie (IMAGING)</option>
              <option value="CONSULTATION">Consultation (CONSULTATION)</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Description *</label>
            <input
              className="mt-0.5 w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-teal-300 focus:outline-none"
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="Ex : Ionogramme sanguin"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Urgence</label>
            <select
              className="mt-0.5 w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-teal-300 focus:outline-none bg-white"
              value={draft.urgency ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, urgency: e.target.value || null }))}
            >
              <option value="">— Aucune urgence spécifiée</option>
              <option value="urgent">Urgent</option>
              <option value="à jeun">À jeun</option>
              <option value="dans 1 semaine">Dans 1 semaine</option>
              <option value="dans 1 mois">Dans 1 mois</option>
              <option value="dans 3 mois">Dans 3 mois</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={save}
            disabled={!draft.description.trim()}
            className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-medium hover:bg-teal-700 transition disabled:opacity-50"
          >
            Enregistrer
          </button>
          <button onClick={cancel} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition">
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className="mt-0.5 text-violet-500 shrink-0">—</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-700">{act.description}</span>
              {act.urgency && <span className="text-[11px] text-amber-700">({act.urgency})</span>}
              <ConfidenceBadge confidence={act.confidence} sourceSpan={act.sourceSpan} />
              {duplicateIn && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                  ⚠ inclus dans {duplicateIn}
                </span>
              )}
            </div>
            {expansion.expanded && (
              <div className="mt-1.5 flex items-start gap-1.5">
                <FlaskConical size={11} className="mt-0.5 text-teal-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-teal-700 font-semibold">{expansion.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                    {expansion.components.join(" · ")}
                  </p>
                  {expansion.nabmCode && (
                    <p className="text-[10px] text-gray-400 mt-0.5">NABM {expansion.nabmCode}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {!isReadOnly && (
          <div className="flex items-center gap-1 shrink-0">
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-red-600">Supprimer ?</span>
                <button onClick={() => onDelete(index)} className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-medium hover:bg-red-700">Oui</button>
                <button onClick={() => setConfirmDelete(false)} className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] hover:bg-gray-200">Non</button>
              </div>
            ) : (
              <>
                <button onClick={() => { setDraft(act); setEditing(true); }} className="p-1 rounded text-violet-500 hover:text-violet-700 hover:bg-violet-50 transition" title="Modifier"><Pen size={11} /></button>
                <button onClick={() => setConfirmDelete(true)} className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition" title="Supprimer"><Trash2 size={11} /></button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DraftCard ────────────────────────────────────────────────────────────────

function DraftCard({ draft, onRefresh }: { draft: PrescriptionDraft; onRefresh: () => void }) {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();

  const [expanded, setExpanded]             = useState(true);
  const [notes, setNotes]                   = useState(draft.prescriberNotes ?? "");
  const [editingNotes, setEditingNotes]     = useState(false);
  const [confirmSign, setConfirmSign]       = useState(false);
  const [medications, setMedications]       = useState<Medication[]>(draft.content.medications);
  const [acts, setActs]                     = useState<ComplementaryAct[]>(draft.content.complementaryActs);
  const [hasUnsavedChanges, setDirty]       = useState(false);

  const api        = apiWithToken(accessToken!);
  const isSigned   = draft.status === "SIGNED";
  const isCancelled = draft.status === "CANCELLED";
  const isReadOnly = isSigned || isCancelled;
  const canSign    = medications.length > 0 || acts.length > 0;

  // ── mutations ───────────────────────────────────────────────────────────────

  const patchMutation = useMutation({
    mutationFn: (data: PatchData) => api.prescriptionDrafts.patch(draft.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prescription-drafts", draft.careCaseId] });
      setDirty(false);
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
      toast.success("Brouillon supprimé");
      onRefresh();
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  // ── content handlers ────────────────────────────────────────────────────────

  const updateMed = (i: number, updated: Medication) => {
    setMedications((prev) => prev.map((m, idx) => (idx === i ? updated : m)));
    setDirty(true);
  };
  const deleteMed = (i: number) => {
    setMedications((prev) => prev.filter((_, idx) => idx !== i));
    setDirty(true);
  };
  const addMed = () => {
    const empty: Medication = {
      name: "Nouveau médicament", genericName: null, brandName: null,
      dosage: "", form: "", route: "", frequency: "", duration: "",
      startDate: null, instructions: null, confidence: 0, sourceSpan: "",
    };
    setMedications((prev) => [...prev, empty]);
    setDirty(true);
  };

  const updateAct = (i: number, updated: ComplementaryAct) => {
    setActs((prev) => prev.map((a, idx) => (idx === i ? updated : a)));
    setDirty(true);
  };
  const deleteAct = (i: number) => {
    setActs((prev) => prev.filter((_, idx) => idx !== i));
    setDirty(true);
  };
  const addAct = () => {
    const empty: ComplementaryAct = {
      type: "LAB_TEST", description: "Nouvel acte", urgency: null, confidence: 0, sourceSpan: "",
    };
    setActs((prev) => [...prev, empty]);
    setDirty(true);
  };

  const saveContent = () =>
    patchMutation.mutate({
      content: { medications, complementaryActs: acts, warnings: draft.content.warnings },
    });

  const saveAndSign = async () => {
    setConfirmSign(false);
    if (hasUnsavedChanges) {
      try {
        await patchMutation.mutateAsync({
          content: { medications, complementaryActs: acts, warnings: draft.content.warnings },
        });
      } catch {
        return;
      }
    }
    signMutation.mutate();
  };

  const actDescriptions = acts.map((a) => a.description);

  return (
    <div className={`rounded-xl border bg-white overflow-hidden transition-shadow hover:shadow-md ${isSigned ? "border-green-200" : isCancelled ? "border-gray-200 opacity-60" : "border-violet-100"}`}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-2.5">
          <ClipboardList size={15} className={isSigned ? "text-green-600" : "text-violet-600"} />
          <span className="text-sm font-semibold text-gray-900">Brouillon d&apos;ordonnance</span>
          <StatusBadge status={draft.status} />
          {draft.extractionConfidence != null && !isSigned && (
            <span className="text-[10px] text-gray-400">IA {Math.round(draft.extractionConfidence * 100)}%</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400">
            {new Date(draft.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
          </span>
          {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50">

          {/* ── AI disclaimer ──────────────────────────────────────────────── */}
          {!isSigned && !isCancelled && (
            <div className="flex items-start gap-2 p-2.5 mt-3 mb-3 rounded-lg bg-amber-50 border border-amber-100">
              <AlertTriangle size={13} className="mt-0.5 text-amber-600 shrink-0" />
              <p className="text-[11px] text-amber-800 leading-snug">
                Brouillon extrait automatiquement depuis la transcription — à vérifier avant signature. Chaque ligne est modifiable.
              </p>
            </div>
          )}

          {/* ── Warnings ───────────────────────────────────────────────────── */}
          {draft.content.warnings.length > 0 && (
            <div className="mb-3 space-y-1">
              {draft.content.warnings.map((w, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] text-amber-700">
                  <span>⚠</span> {w}
                </div>
              ))}
            </div>
          )}

          {/* ── Medications ────────────────────────────────────────────────── */}
          <div className="mb-4">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Médicaments prescrits</p>
            {medications.length === 0 && (
              <p className="text-[11px] text-gray-400 italic mb-2">Aucun médicament</p>
            )}
            <div className="space-y-2">
              {medications.map((med, i) => (
                <MedicationRow
                  key={i}
                  med={med}
                  index={i}
                  isReadOnly={isReadOnly}
                  onChange={updateMed}
                  onDelete={deleteMed}
                />
              ))}
            </div>
            {!isReadOnly && (
              <button
                onClick={addMed}
                className="mt-2 flex items-center gap-1.5 text-[11px] text-violet-600 hover:text-violet-800 hover:bg-violet-50 rounded-lg px-2 py-1 transition"
              >
                <Plus size={11} /> Ajouter un médicament
              </button>
            )}
          </div>

          {/* ── Complementary acts ─────────────────────────────────────────── */}
          <div className="mb-4">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Actes complémentaires</p>
            {acts.length === 0 && (
              <p className="text-[11px] text-gray-400 italic mb-2">Aucun acte complémentaire</p>
            )}
            <div className="space-y-1.5">
              {acts.map((act, i) => (
                <ActRow
                  key={i}
                  act={act}
                  index={i}
                  isReadOnly={isReadOnly}
                  allActDescriptions={actDescriptions}
                  onChange={updateAct}
                  onDelete={deleteAct}
                />
              ))}
            </div>
            {!isReadOnly && (
              <button
                onClick={addAct}
                className="mt-2 flex items-center gap-1.5 text-[11px] text-violet-600 hover:text-violet-800 hover:bg-violet-50 rounded-lg px-2 py-1 transition"
              >
                <Plus size={11} /> Ajouter un acte
              </button>
            )}
          </div>

          {/* ── Unsaved changes banner ─────────────────────────────────────── */}
          {!isReadOnly && hasUnsavedChanges && (
            <div className="mb-4 flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-[11px] text-amber-700 font-medium">Modifications non enregistrées</span>
              <button
                onClick={saveContent}
                disabled={patchMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 text-white text-xs font-medium hover:bg-gray-900 transition disabled:opacity-50 ml-auto"
              >
                {patchMutation.isPending ? <Loader2 size={11} className="animate-spin" /> : null}
                Enregistrer les modifications
              </button>
            </div>
          )}

          {/* ── Prescriber notes ───────────────────────────────────────────── */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Notes prescripteur</p>
              {!isReadOnly && !editingNotes && (
                <button onClick={() => setEditingNotes(true)} className="flex items-center gap-1 text-[10px] text-violet-600 hover:text-violet-800">
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

          {/* ── Signed confirmation ────────────────────────────────────────── */}
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

          {/* ── Actions ────────────────────────────────────────────────────── */}
          {!isSigned && !isCancelled && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
              {confirmSign ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-700 font-medium">
                    {hasUnsavedChanges ? "Enregistrer et signer ?" : "Confirmer la signature ?"}
                  </span>
                  <button
                    onClick={saveAndSign}
                    disabled={signMutation.isPending || patchMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {(signMutation.isPending || patchMutation.isPending)
                      ? <Loader2 size={11} className="animate-spin" />
                      : <CheckCircle size={11} />}
                    Confirmer
                  </button>
                  <button
                    onClick={() => setConfirmSign(false)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmSign(true)}
                  disabled={!canSign}
                  title={!canSign ? "Ajoutez au moins un médicament ou un acte" : undefined}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FileText size={12} /> Signer et générer PDF
                </button>
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

// ─── PrescriptionDraftEditor ──────────────────────────────────────────────────

export function PrescriptionDraftEditor({ careCaseId }: Props) {
  const { accessToken } = useAuthStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["prescription-drafts", careCaseId],
    queryFn: () => apiWithToken(accessToken!).prescriptionDrafts.list(careCaseId),
    enabled: !!accessToken,
    staleTime: 30_000,
  });

  const drafts       = data?.drafts ?? [];
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
        <p className="text-[11px] mt-1 text-gray-400">
          Les brouillons sont générés automatiquement depuis l&apos;enregistrement audio des consultations.
        </p>
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
