"use client";

import { useState, useRef, useEffect } from "react";
import { MarkdownContent } from "@/components/MarkdownContent";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, CareCaseDetail } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { formatDate, formatDateTime, formatShortDate } from "@/lib/date-utils";
import { PrescriptionDraftEditor } from "@/components/PrescriptionDraftEditor";
import { PatientJournalView } from "../../PatientJournalView";

interface Props {
  careCaseId: string;
  careCase?: CareCaseDetail;
}

type DossierTab = "notes" | "journal" | "timeline" | "documents" | "ordonnances";

export function ViewDossier({ careCaseId, careCase }: Props) {
  const [activeTab, setActiveTab] = useState<DossierTab>("notes");

  return (
    <div>
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {[
          { key: "notes" as const, label: "Notes cliniques", icon: "📝" },
          { key: "journal" as const, label: "Journal patient", icon: "📱" },
          { key: "timeline" as const, label: "Ligne de vie", icon: "🕐" },
          { key: "documents" as const, label: "Documents", icon: "📄" },
          { key: "ordonnances" as const, label: "Ordonnances", icon: "💊" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
              activeTab === tab.key ? "border-[#5B4EC4] text-[#5B4EC4]" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "notes" && <NotesPanel careCaseId={careCaseId} />}
      {activeTab === "journal" && <PatientJournalView careCaseId={careCaseId} />}
      {activeTab === "timeline" && <TimelinePanel careCaseId={careCaseId} />}
      {activeTab === "documents" && <DocumentsPanel careCaseId={careCaseId} />}
      {activeTab === "ordonnances" && <PrescriptionDraftEditor careCaseId={careCaseId} />}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// Notes
// ══════════════════════════════════════════════════════

function NotesPanel({ careCaseId }: { careCaseId: string }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ["notes", careCaseId],
    queryFn: async () => {
      const res = await api.get(`/care-cases/${careCaseId}/notes`);
      return res.data;
    },
  });

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async ({ noteId, reason }: { noteId: string; reason: string }) => {
      await api.delete(`/care-cases/${careCaseId}/notes/${noteId}`, { reason: reason || undefined });
    },
    onSuccess: (_, { noteId }) => {
      queryClient.invalidateQueries({ queryKey: ["notes", careCaseId] });
      setDeleteTarget(null);
      setDeleteReason("");
      // 10s undo toast
      const toastId = toast.success("Note supprimée", {
        description: "Récupérable pendant 30 jours",
        duration: 10000,
        action: {
          label: "Annuler",
          onClick: () => {
            api.post(`/care-cases/${careCaseId}/notes/${noteId}/restore`)
              .then(() => {
                queryClient.invalidateQueries({ queryKey: ["notes", careCaseId] });
                toast.dismiss(toastId);
                toast.success("Note restaurée");
              })
              .catch(() => toast.error("Impossible de restaurer la note"));
          },
        },
      });
    },
    onError: () => toast.error("Impossible de supprimer la note"),
  });

  if (isLoading) return <LoadingState />;

  const notesList = Array.isArray(notes) ? notes : [];
  const filtered = search
    ? notesList.filter((n: any) => `${n.title || ""} ${n.body || n.content || ""} ${n.author?.firstName || ""} ${n.author?.lastName || ""}`.toLowerCase().includes(search.toLowerCase()))
    : notesList;
  filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const noteTypeLabels: Record<string, string> = {
    CONSULTATION: "Compte rendu", SOAP: "Note SOAP", PROGRESS: "Évolution",
    TEAM: "Note d'équipe", AI_SUMMARY: "Synthèse clinique", PHONE_CALL: "Appel",
  };
  const noteTypeColors: Record<string, string> = {
    CONSULTATION: "border-l-[#5B4EC4]", SOAP: "border-l-blue-500",
    PROGRESS: "border-l-green-500", TEAM: "border-l-amber-500",
    AI_SUMMARY: "border-l-purple-500", PHONE_CALL: "border-l-sky-500",
  };

  return (
    <div>
      <div className="mb-4">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher dans les notes…"
          className="w-full max-w-md text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#5B4EC4] focus:ring-1 focus:ring-[#5B4EC4]"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-12">{search ? "Aucune note trouvée" : "Pas encore de notes cliniques"}</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((note: any) => {
            const typeColor = noteTypeColors[note.noteType] || "border-l-gray-400";
            const authorName = note.author ? `${note.author.firstName || ""} ${note.author.lastName || ""}`.trim() : null;
            const isAuthor = user?.personId === note.authorPersonId;
            const isAdmin = user?.roleType === "ADMIN";
            const canDelete = isAuthor || isAdmin;
            return (
              <div key={note.id} className={`rounded-xl border border-gray-200 bg-white p-5 border-l-4 ${typeColor}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-[#5B4EC4] bg-[#EDE9FC] px-2 py-0.5 rounded-full">
                      {noteTypeLabels[note.noteType] || note.noteType || "Note"}
                    </span>
                    {(note.hasTranscription || note.recordingId) && (
                      <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">🎙️ Transcription</span>
                    )}
                    {note.aiAnalysis && (
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">✨ Extraction assistée</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">{formatDateTime(note.createdAt)}</span>
                    {canDelete && (
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === note.id ? null : note.id)}
                          className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-base leading-none"
                          aria-label="Options"
                        >⋯</button>
                        {openMenuId === note.id && (
                          <div className="absolute right-0 top-7 z-20 bg-white border border-gray-200 rounded-lg shadow-md py-1 w-36">
                            <button
                              onClick={() => { setDeleteTarget({ id: note.id, title: note.title || noteTypeLabels[note.noteType] || "Note" }); setOpenMenuId(null); }}
                              className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {authorName && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-[#EDE9FC] flex items-center justify-center text-[10px] font-semibold text-[#5B4EC4]">
                      {authorName[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{authorName}</span>
                    {(note.author?.specialty || note.author?.role) && (
                      <span className="text-xs text-gray-400">— {note.author.specialty || note.author.role}</span>
                    )}
                  </div>
                )}
                {note.title && <h4 className="text-sm font-semibold text-gray-900 mb-2">{note.title}</h4>}
                {(note.body || note.content) && <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{note.body || note.content}</div>}
                {note.aiAnalysis && (
                  <div className="mt-4 rounded-lg bg-[#F8F7FD] border border-[#EDE9FC] p-3">
                    <p className="text-[10px] font-medium text-[#5B4EC4] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      ✨ Extraction assistée <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 ml-1">Brouillon</span>
                    </p>
                    <MarkdownContent
                      content={typeof note.aiAnalysis === "string" ? note.aiAnalysis : JSON.stringify(note.aiAnalysis, null, 2)}
                      compact
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modale de confirmation de suppression */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Supprimer la note</h3>
            <p className="text-sm text-gray-500 mb-4">
              <span className="font-medium text-gray-700">{deleteTarget.title}</span> sera supprimée. Récupérable pendant 30 jours.
            </p>
            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Motif de suppression <span className="text-gray-400">(optionnel)</span></label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Ex : note créée par erreur, doublon…"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#5B4EC4] focus:ring-1 focus:ring-[#5B4EC4]"
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteReason(""); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >Annuler</button>
              <button
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate({ noteId: deleteTarget.id, reason: deleteReason })}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isPending ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ══════════════════════════════════════════════════════
// Documents — extraction bio branchée
// ══════════════════════════════════════════════════════

type DocFilter = "all" | "shared" | "mine" | "patient" | "transcriptions";

const UPLOAD_TYPES = [
  { label: "Bilan biologique", type: "BIOLOGICAL_REPORT" },
  { label: "Impédancemétrie", type: "IMPEDANCE_REPORT" },
  { label: "DXA / Densitométrie", type: "DXA_REPORT" },
  { label: "ECG / EFR", type: "ECG_REPORT" },
  { label: "Ordonnance", type: "PRESCRIPTION" },
  { label: "Compte rendu", type: "CONSULTATION_REPORT" },
  { label: "Imagerie", type: "IMAGING" },
  { label: "Courrier", type: "LETTER" },
  { label: "Autre", type: "OTHER" },
];

// ─── TranscriptionModal ───────────────────────────────────────────────────────

function TranscriptionModal({ doc, onClose }: { doc: any; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  function copyText() {
    if (!doc.textContent) return;
    navigator.clipboard.writeText(doc.textContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🎙️</span>
              <h3 className="text-sm font-semibold text-gray-900">{doc.title || "Transcription"}</h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {doc.isSharedWithTeam === false && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">🔒 Privé — visible par vous uniquement</span>
              )}
              {doc.createdAt && (
                <span className="text-[11px] text-gray-400">{new Date(doc.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })} à {new Date(doc.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0 ml-4">✕</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {doc.textContent ? (
            <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">{doc.textContent}</pre>
          ) : (
            <p className="text-sm text-gray-400 italic text-center py-8">Contenu de la transcription non disponible.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 shrink-0 flex items-center justify-between gap-2">
          <p className="text-[11px] text-gray-400">
            {doc.sizeBytes ? `${Math.round(doc.sizeBytes / 1024)} ko` : ""}
            {doc.textContent ? ` · ${doc.textContent.split(/\s+/).length} mots` : ""}
          </p>
          <div className="flex gap-2">
            <button
              onClick={copyText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              {copied ? "✓ Copié" : "📋 Copier"}
            </button>
            <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#5B4EC4] text-white hover:bg-[#4A3DB3] transition">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DocumentsPanel ───────────────────────────────────────────────────────────

function DocumentsPanel({ careCaseId }: { careCaseId: string }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [uploadType, setUploadType] = useState("OTHER");
  const [uploading, setUploading] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);

  useEffect(() => {
    if (!showUploadMenu) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUploadMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUploadMenu]);

  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", careCaseId],
    queryFn: async () => {
      const res = await api.get(`/care-cases/${careCaseId}/documents`);
      return res.data;
    },
  });

  const [filter, setFilter] = useState<DocFilter>("all");
  const [extractingDocId, setExtractingDocId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [validationDocId, setValidationDocId] = useState<string | null>(null);
  const [extractionDate, setExtractionDate] = useState<string>("");
  const [extractionExamType, setExtractionExamType] = useState<string | null>(null);
  const [transcriptionModalDoc, setTranscriptionModalDoc] = useState<any | null>(null);

  async function handleUpload(file: File, docType: string) {
    setUploading(true);
    try {
      const token = (() => {
        try { const s = localStorage.getItem("nami-auth"); return s ? JSON.parse(s)?.state?.accessToken : null; } catch { return null; }
      })();
      const form = new FormData();
      form.append("file", file);
      form.append("title", file.name);
      form.append("documentType", docType);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/care-cases/${careCaseId}/documents/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as Record<string, string>).error || `Erreur ${res.status}`);
      }
      queryClient.invalidateQueries({ queryKey: ["documents", careCaseId] });
      toast.success("Document ajouté");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(docId: string) {
    // Ouvrir la fenêtre AVANT l'await — sinon bloqué par le popup blocker
    const newWindow = window.open("about:blank", "_blank");
    try {
      const res = await api.get<{ url: string }>(`/care-cases/${careCaseId}/documents/${docId}/download`);
      const url = res.data?.url;
      if (!url) throw new Error("URL manquante");
      if (newWindow) newWindow.location.href = url;
      else window.location.href = url;
    } catch (err) {
      newWindow?.close();
      toast.error(err instanceof Error ? err.message : "Impossible de télécharger le document");
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm("Supprimer ce document ?")) return;
    try {
      await api.delete(`/care-cases/${careCaseId}/documents/${docId}`);
      queryClient.invalidateQueries({ queryKey: ["documents", careCaseId] });
      toast.success("Document supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }

  // POST /documents/:id/extract-bio
  const extractMutation = useMutation({
    mutationFn: async (docId: string) => {
      const res = await api.post(`/documents/${docId}/extract-bio`);
      return res.data;
    },
    onSuccess: (data, docId) => {
      const extracted = data.candidates || data.observations || [];
      setCandidates(extracted.map((c: any) => ({ ...c, selected: true })));
      setExtractionDate(data.datePrelevement || new Date().toISOString().split("T")[0]);
      setExtractionExamType(data.examType ?? null);
      setValidationDocId(docId);
      setExtractingDocId(null);
    },
    onError: () => setExtractingDocId(null),
  });

  // POST /documents/:id/validate-bio — format attendu par le backend
  const validateMutation = useMutation({
    mutationFn: async ({ docId, selected }: { docId: string; selected: any[] }) => {
      const res = await api.post(`/documents/${docId}/validate-bio`, {
        datePrelevement: extractionDate || new Date().toISOString().split("T")[0],
        observations: selected.map((c) => ({
          metricKey: c.metricKey,
          label: c.labelOriginal || c.label || c.metricKey,
          value: c.value ?? c.valueNumeric,
          unit: c.unit || "",
        })),
      });
      return res.data;
    },
    onSuccess: (data) => {
      const count = data?.observations?.length ?? candidates.filter((c) => c.selected).length;
      toast.success(`${count} observation${count > 1 ? "s" : ""} intégrée${count > 1 ? "s" : ""} dans le dossier`);
      queryClient.invalidateQueries({ queryKey: ["documents", careCaseId] });
      queryClient.invalidateQueries({ queryKey: ["observations-bio", careCaseId] });
      queryClient.invalidateQueries({ queryKey: ["observations-latest", careCaseId] });
      queryClient.invalidateQueries({ queryKey: ["observations-delta", careCaseId] });
      queryClient.invalidateQueries({ queryKey: ["observations-history", careCaseId] });
      queryClient.invalidateQueries({ queryKey: ["bia-sessions", careCaseId] });
      queryClient.invalidateQueries({ queryKey: ["trajectory", careCaseId] });
      queryClient.invalidateQueries({ queryKey: ["care-case", careCaseId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", careCaseId] });
      setValidationDocId(null);
      setCandidates([]);
      setExtractionExamType(null);
    },
    onError: (err: any) => {
      console.error("[validate-bio] error:", err);
      const msg = err?.message || "Erreur inconnue";
      if (msg === "UPGRADE_REQUIRED") {
        toast.error("Cette fonctionnalité nécessite un abonnement Nami Pro");
      } else {
        toast.error(`Erreur lors de l'intégration : ${msg}`);
      }
    },
  });

  function handleExtract(docId: string) {
    setExtractingDocId(docId);
    extractMutation.mutate(docId);
  }

  function handleValidate() {
    if (!validationDocId) return;
    validateMutation.mutate({ docId: validationDocId, selected: candidates.filter((c) => c.selected) });
  }

  function toggleCandidate(index: number) {
    setCandidates((prev) => prev.map((c, i) => (i === index ? { ...c, selected: !c.selected } : c)));
  }

  if (isLoading) return <LoadingState />;

  const docs = Array.isArray(documents) ? documents : [];
  const classified = docs.map((d: any) => {
    let category: DocFilter = "shared";
    if (d.documentType === "TRANSCRIPTION" || d.isTranscription) category = "transcriptions";
    else if (d.uploadedBy === "PATIENT" || d.source === "PATIENT_APP") category = "patient";
    else if (d.isShared === false || d.visibility === "PRIVATE") category = "mine";
    return { ...d, category };
  });

  const filtered = filter === "all" ? classified : classified.filter((d: any) => d.category === filter);
  filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const counts = {
    all: classified.length,
    shared: classified.filter((d: any) => d.category === "shared").length,
    mine: classified.filter((d: any) => d.category === "mine").length,
    patient: classified.filter((d: any) => d.category === "patient").length,
    transcriptions: classified.filter((d: any) => d.category === "transcriptions").length,
  };

  const docTypeIcons: Record<string, string> = {
    PRESCRIPTION: "💊", LAB_REPORT: "🧪", BIOLOGICAL_REPORT: "🧪",
    DISCHARGE_SUMMARY: "🏥", REFERRAL_LETTER: "↗️", CONSULTATION_REPORT: "📋",
    IMAGING: "🩻", IMPEDANCE_REPORT: "⚖️", DXA_REPORT: "🦴",
    ECG_REPORT: "🫀", TRANSCRIPTION: "🎙️", PATIENT_UPLOAD: "📱", OTHER: "📄",
    LETTER: "✉️",
  };
  const docTypeLabels: Record<string, string> = {
    PRESCRIPTION: "Ordonnance", LAB_REPORT: "Bilan biologique", BIOLOGICAL_REPORT: "Bilan biologique",
    DISCHARGE_SUMMARY: "CR d'hospitalisation", REFERRAL_LETTER: "Courrier d'adressage",
    CONSULTATION_REPORT: "CR de consultation", IMAGING: "Imagerie",
    IMPEDANCE_REPORT: "Bilan d'impédancemétrie", DXA_REPORT: "DXA / Densitométrie",
    ECG_REPORT: "ECG / EFR", TRANSCRIPTION: "Transcription",
    PATIENT_UPLOAD: "Document patient", OTHER: "Document", LETTER: "Courrier",
  };

  const isBioDoc = (doc: any) => [
    "LAB_REPORT", "BIOLOGICAL_REPORT", "IMPEDANCE_REPORT",
    "DXA_REPORT", "ECG_REPORT", "IMAGING", "OTHER",
  ].includes(doc.documentType);

  return (
    <div>
      {/* Input file caché */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.docx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file, uploadType);
          e.target.value = "";
        }}
      />

      {/* Header : filtres + bouton ajouter */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {([
            { key: "all" as const, label: `Tout (${counts.all})`, icon: "📁" },
            { key: "shared" as const, label: `Partagés (${counts.shared})`, icon: "👥" },
            { key: "mine" as const, label: `Mes docs (${counts.mine})`, icon: "🔒" },
            { key: "patient" as const, label: `Patient (${counts.patient})`, icon: "📱" },
            { key: "transcriptions" as const, label: `Transcriptions (${counts.transcriptions})`, icon: "🎙️" },
          ]).map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f.key ? "bg-[#5B4EC4] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              <span>{f.icon}</span>{f.label}
            </button>
          ))}
        </div>
        <div className="relative" ref={menuRef}>
          <button
            disabled={uploading}
            onClick={() => setShowUploadMenu((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {uploading ? "Upload…" : "+ Ajouter"}
          </button>
          {showUploadMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 z-50 min-w-[160px]">
              {UPLOAD_TYPES.map((t) => (
                <button
                  key={t.type}
                  onClick={() => {
                    setUploadType(t.type);
                    setShowUploadMenu(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-12">Aucun document</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((doc: any) => {
            const isExtracted = doc.bioExtracted === true;
            const isExtracting = extractingDocId === doc.id;
            return (
              <div
                key={doc.id}
                className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow cursor-pointer group"
                onClick={() => { if (doc.documentType === "TRANSCRIPTION") setTranscriptionModalDoc(doc); }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{docTypeIcons[doc.documentType] || "📄"}</span>
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{docTypeLabels[doc.documentType] || doc.documentType || "Document"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {doc.isSharedWithTeam === false && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500" title="Visible uniquement par vous">🔒 Privé</span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      doc.category === "mine" ? "bg-gray-100 text-gray-500" :
                      doc.category === "patient" ? "bg-purple-50 text-purple-600" :
                      doc.category === "transcriptions" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
                    }`}>
                      {doc.category === "mine" ? "Privé" : doc.category === "patient" ? "Patient" : doc.category === "transcriptions" ? "Audio" : "Partagé"}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{doc.title || doc.fileName || "Sans titre"}</p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                  <span>{formatDate(doc.createdAt)}</span>
                  {doc.sizeBytes && <span>• {formatFileSize(doc.sizeBytes)}</span>}
                </div>
                {/* Aperçu transcription */}
                {doc.documentType === "TRANSCRIPTION" && doc.textContent && (
                  <p className="text-[11px] text-gray-500 mt-2 line-clamp-2 leading-relaxed">{doc.textContent}</p>
                )}
                <div className="flex gap-1.5 mt-2 items-center flex-wrap">
                  {isExtracted && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium border border-emerald-100">🧪 Bio extraite</span>
                  )}
                  {isExtracting && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium border border-blue-100 flex items-center gap-1">
                      <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />Analyse…
                    </span>
                  )}
                  {isBioDoc(doc) && isExtracted && (
                    <button onClick={(e) => { e.stopPropagation(); handleExtract(doc.id); }} className="text-[10px] text-[#5B4EC4] hover:underline font-medium">
                      Ré-analyser
                    </button>
                  )}
                </div>
                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {doc.documentType === "TRANSCRIPTION" ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); setTranscriptionModalDoc(doc); }}
                      className="text-xs text-[#5B4EC4] hover:underline font-medium"
                    >
                      🎙️ Voir la transcription
                    </button>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); handleDownload(doc.id); }} className="text-xs text-[#5B4EC4] hover:underline">Télécharger</button>
                  )}
                  {isBioDoc(doc) && !isExtracted && !isExtracting && (
                    <button onClick={(e) => { e.stopPropagation(); handleExtract(doc.id); }} className="text-xs text-emerald-600 hover:underline font-medium">
                      🧪 Extraire les données
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }} className="text-xs text-red-400 hover:underline ml-auto">
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal transcription */}
      {transcriptionModalDoc && (
        <TranscriptionModal
          doc={transcriptionModalDoc}
          onClose={() => setTranscriptionModalDoc(null)}
        />
      )}

      {/* Modal validation bio */}
      {validationDocId && candidates.length > 0 && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] overflow-hidden shadow-xl">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {extractionExamType === "IMPEDANCEMETRIE" ? "⚖️ Bilan d'impédancemétrie"
                    : extractionExamType === "DXA" ? "🦴 Ostéodensitométrie (DXA)"
                    : extractionExamType === "ECG" ? "🫀 ECG"
                    : "🧪 Bilan biologique"} — brouillon · à valider
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {candidates.length} valeur{candidates.length > 1 ? "s" : ""} extraite{candidates.length > 1 ? "s" : ""}
                  {extractionDate ? ` · ${formatDate(extractionDate)}` : ""}
                  {" — "}décochez ce que vous ne souhaitez pas intégrer
                </p>
              </div>
              <button onClick={() => { setValidationDocId(null); setCandidates([]); setExtractionExamType(null); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="px-5 py-3 overflow-y-auto max-h-[55vh] space-y-4">
              {(() => {
                // Grouper par catégorie en conservant l'index global
                const groups: Record<string, Array<{ c: any; gi: number }>> = {};
                candidates.forEach((c, gi) => {
                  const cat = c.category || "Autres";
                  if (!groups[cat]) groups[cat] = [];
                  groups[cat].push({ c, gi });
                });
                return Object.entries(groups).map(([cat, items]) => (
                  <div key={cat}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">{cat}</p>
                    <div className="space-y-1.5">
                      {items.map(({ c, gi }) => {
                        const val = c.value ?? c.valueNumeric;
                        const refMin = c.refMin ?? null;
                        const refMax = c.refMax ?? null;
                        let badge: { text: string; cls: string } | null = null;
                        if (val != null && (refMin != null || refMax != null)) {
                          const low = refMin != null && val < refMin;
                          const high = refMax != null && val > refMax;
                          if (low || high) badge = { text: low ? "↓" : "↑", cls: "bg-amber-100 text-amber-700" };
                          else badge = { text: "✓", cls: "bg-green-100 text-green-700" };
                        }
                        return (
                          <label key={`cand-${gi}`} className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-all ${c.selected ? "border-[#5B4EC4] bg-[#F8F7FD]" : "border-gray-100 bg-gray-50 opacity-50"}`}>
                            <input type="checkbox" checked={c.selected} onChange={() => toggleCandidate(gi)} className="rounded border-gray-300 text-[#5B4EC4] w-4 h-4 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{c.labelOriginal || c.label || c.metricKey}</p>
                              {(refMin != null || refMax != null) && (
                                <p className="text-[10px] text-gray-400">
                                  Réf : {refMin != null ? refMin : "—"} – {refMax != null ? refMax : "—"} {c.unit || ""}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {badge && <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${badge.cls}`}>{badge.text}</span>}
                              <p className="text-sm font-semibold text-gray-900 text-right">{val ?? "—"} <span className="text-[10px] font-normal text-gray-500">{c.unit || ""}</span></p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">{candidates.filter((c) => c.selected).length} / {candidates.length} sélectionnée{candidates.filter((c) => c.selected).length > 1 ? "s" : ""}</p>
              <div className="flex gap-2">
                <button onClick={() => { setValidationDocId(null); setCandidates([]); setExtractionExamType(null); }} className="text-xs px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Annuler</button>
                <button
                  onClick={handleValidate}
                  disabled={validateMutation.isPending || candidates.filter((c) => c.selected).length === 0}
                  className="text-xs px-4 py-2 rounded-lg bg-[#5B4EC4] text-white hover:bg-[#4A3DB3] disabled:opacity-50 font-medium"
                >
                  {validateMutation.isPending ? "Enregistrement…" : `Valider ${candidates.filter((c) => c.selected).length} observation${candidates.filter((c) => c.selected).length > 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// Composants partagés
// ══════════════════════════════════════════════════════


// ══════════════════════════════════════════════════════
// Ligne de vie — timeline verticale détaillée
// ══════════════════════════════════════════════════════

type TimelineFilter = "all" | "rdv" | "referral" | "alert";

function TimelinePanel({ careCaseId }: { careCaseId: string }) {
  const [filter, setFilter] = useState<TimelineFilter>("all");

  const { data: timelineRaw, isLoading } = useQuery({
    queryKey: ["timeline", careCaseId],
    queryFn: async () => {
      const res = await api.get(`/care-cases/${careCaseId}/timeline?limit=100`);
      const raw = res.data;
      const activities = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
      return activities.map((a: any) => ({
        type: a.activityType || a.type || "NOTE",
        title: a.title || a.summary || "",
        description: a.summary || a.description || null,
        date: a.occurredAt || a.createdAt || a.date,
        authorName: a.person
          ? `${a.person.firstName || ""} ${a.person.lastName || ""}`.trim()
          : a.authorName || null,
        expandable: !!a.payload,
      }));
    },
  });

  if (isLoading) return <LoadingState />;

  const entries = Array.isArray(timelineRaw) ? timelineRaw : [];

  const filtered = filter === "all"
    ? entries
    : entries.filter((e: any) => {
        const t = (e.type || "").toUpperCase();
        if (filter === "rdv") return t.includes("APPOINTMENT") || t.includes("VISIT") || t.includes("STEP") || t === "NOTE";
        if (filter === "referral") return t.includes("REFERRAL") || t.includes("ADRESSAGE");
        if (filter === "alert") return t.includes("ALERT") || t.includes("OBSERVATION") || t.includes("METRIC");
        return true;
      });

  const byMonth = new Map<string, any[]>();
  for (const e of filtered) {
    const d = new Date(e.date || e.createdAt);
    const key = `${d.toLocaleString("fr-FR", { month: "long" }).toUpperCase()} ${d.getFullYear()}`;
    const group = byMonth.get(key) || [];
    group.push(e);
    byMonth.set(key, group);
  }

  const getIcon = (type: string) => {
    const t = (type || "").toUpperCase();
    if (t.includes("APPOINTMENT") || t.includes("VISIT")) return "📅";
    if (t.includes("REFERRAL") || t.includes("ADRESSAGE")) return "↗️";
    if (t.includes("ALERT") || t.includes("METRIC")) return "⚠️";
    if (t.includes("OBSERVATION") || t.includes("BIO")) return "🧪";
    if (t.includes("DOCUMENT")) return "📄";
    if (t.includes("NOTE")) return "📝";
    if (t.includes("STEP") || t.includes("PROTOCOL")) return "✅";
    if (t.includes("TASK")) return "☑️";
    if (t.includes("JOURNAL")) return "📱";
    return "•";
  };

  const isAlertType = (type: string) => {
    const t = (type || "").toUpperCase();
    return t.includes("ALERT") || t.includes("METRIC_OUT");
  };

  const startDate = entries.length > 0
    ? new Date(Math.min(...entries.map((e: any) => new Date(e.date || e.createdAt).getTime())))
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Ligne de vie clinique</h3>
          {startDate && <p className="text-xs text-gray-400">Depuis le {formatDate(startDate)}</p>}
        </div>
        <div className="flex gap-1">
          {([
            { key: "all" as const, label: "Tout" },
            { key: "rdv" as const, label: "RDV" },
            { key: "referral" as const, label: "Adressages" },
            { key: "alert" as const, label: "Rappels" },
          ]).map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filter === f.key ? "bg-[#5B4EC4] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-12">Aucun événement</p>
      ) : (
        <div className="space-y-6">
          {Array.from(byMonth.entries()).map(([month, monthEvents]) => (
            <div key={month}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">{month}</p>
              <div className="relative">
                {/* Ligne verticale */}
                <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gray-200" />
                <div className="space-y-1">
                  {monthEvents.map((e: any, i: number) => {
                    const isAlert = isAlertType(e.type);
                    const d = new Date(e.date || e.createdAt);
                    return (
                      <div key={i} className={`flex items-start gap-4 py-2 rounded-lg hover:bg-gray-50/50 cursor-pointer ${isAlert ? "bg-red-50/30" : ""}`}>
                        {/* Icône sur la ligne */}
                        <div className={`w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center text-sm z-10 border-2 bg-white ${isAlert ? "border-red-300" : "border-gray-200"}`}>
                          {getIcon(e.type)}
                        </div>
                        {/* Contenu */}
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className={`text-sm font-medium ${isAlert ? "text-red-700" : "text-gray-800"}`}>
                              {e.title || e.summary || e.label}
                            </p>
                            <span className="text-[11px] text-gray-400 flex-shrink-0">
                              {formatDateTime(d)}
                            </span>
                          </div>
                          {e.description && <p className="text-xs text-gray-500 mt-0.5">{e.description}</p>}
                          {e.authorName && <p className="text-[11px] text-gray-400 mt-0.5">{e.authorName}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-[#5B4EC4] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}


function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
