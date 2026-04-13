"use client";

import { use, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type NoteAnalysis } from "@/lib/api";
import { usePatientDashboard } from "@/hooks/usePatientDashboard";
import { useRecording } from "@/contexts/RecordingContext";
import { useConsultation } from "@/contexts/ConsultationContext";
import { PatientHeader } from "./v2/components/PatientHeader";
import { ViewGlobale } from "./v2/components/ViewGlobale";
import { ViewDossier } from "./v2/components/ViewDossier";
import { ViewCoordination } from "./v2/components/ViewCoordination";
import { ReferralModal } from "./referral-modal";
import { QuickTaskModal } from "./QuickTaskModal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, X, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

type Tab = "globale" | "dossier" | "coordination";

const TABS: { key: Tab; label: string }[] = [
  { key: "globale", label: "Vue globale" },
  { key: "dossier", label: "Dossier" },
  { key: "coordination", label: "Coordination" },
];

// ─── NoteInline ───────────────────────────────────────────────────────────────

function NoteInline({
  careCaseId,
  api,
  onClose,
  onCreated,
}: {
  careCaseId: string;
  api: ReturnType<typeof apiWithToken>;
  onClose: () => void;
  onCreated?: (noteId: string) => void;
}) {
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const create = useMutation({
    mutationFn: () => api.notes.create(careCaseId, { noteType: "EVOLUTION", body }),
    onSuccess: (note) => {
      ["timeline", "notes", "care-case"].forEach((k) =>
        qc.invalidateQueries({ queryKey: [k, careCaseId] })
      );
      toast.success("Note ajoutée");
      onClose();
      onCreated?.(note.id);
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  });

  return (
    <div className="border-b bg-white px-6 py-3 shrink-0">
      <div className="max-w-2xl space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Nouvelle note clinique</p>
        <Textarea
          placeholder="Rédiger une note…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          autoFocus
          className="text-sm resize-none"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            className="text-xs h-7"
            disabled={!body.trim() || create.isPending}
            onClick={() => create.mutate()}
          >
            {create.isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
          <Button size="sm" variant="ghost" className="text-xs h-7" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── NoteAnalysisBanner ───────────────────────────────────────────────────────

function NoteAnalysisBanner({
  careCaseId,
  noteId,
  api,
  onDismiss,
}: {
  careCaseId: string;
  noteId: string;
  api: ReturnType<typeof apiWithToken>;
  onDismiss: () => void;
}) {
  const { data } = useQuery<NoteAnalysis>({
    queryKey: ["note-analysis", noteId],
    queryFn: () => api.notes.analysis(careCaseId, noteId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "DONE" || status === "ERROR") return false;
      return 2000;
    },
  });

  if (!data || data.status === "NONE") return null;

  const totalItems = (data.suggestedTasks?.length ?? 0) + (data.flaggedItems?.length ?? 0);

  if (data.status === "PENDING") {
    return (
      <div className="border-b bg-indigo-50/60 px-6 py-2 shrink-0 flex items-center gap-2 text-xs text-indigo-700">
        <Loader2 size={12} className="animate-spin shrink-0" />
        <span>Analyse de la note en cours…</span>
        <button onClick={onDismiss} className="ml-auto text-indigo-400 hover:text-indigo-700">
          <X size={13} />
        </button>
      </div>
    );
  }

  if (data.status === "ERROR") {
    return (
      <div className="border-b bg-slate-50 px-6 py-2 shrink-0 flex items-center gap-2 text-xs text-slate-500">
        <AlertTriangle size={12} className="shrink-0" />
        <span>L'analyse n'a pas pu aboutir.</span>
        <button onClick={onDismiss} className="ml-auto text-slate-400 hover:text-slate-600">
          <X size={13} />
        </button>
      </div>
    );
  }

  if (data.status === "DONE" && totalItems === 0) {
    return (
      <div className="border-b bg-slate-50 px-6 py-2 shrink-0 flex items-center gap-2 text-xs text-slate-500">
        <CheckCircle2 size={12} className="shrink-0" />
        <span>Analyse terminée — aucun élément à valider.</span>
        <button onClick={onDismiss} className="ml-auto text-slate-400 hover:text-slate-600">
          <X size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="border-b bg-indigo-50 px-6 py-2 shrink-0 flex items-center gap-2 text-xs">
      <Sparkles size={12} className="shrink-0 text-indigo-600" />
      <span className="text-indigo-800 font-medium">
        Nami a identifié <strong>{totalItems}</strong> élément{totalItems > 1 ? "s" : ""} à valider
      </span>
      <span className="text-indigo-400 mx-1">—</span>
      <span className="text-indigo-500">brouillon, validation humaine requise</span>
      <button
        onClick={onDismiss}
        className="ml-auto text-indigo-400 hover:text-indigo-700"
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PatientV2Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  const api = apiWithToken(accessToken!);
  const { startRecording } = useRecording();
  const { startConsultation } = useConsultation();

  const [activeTab, setActiveTab] = useState<Tab>("globale");
  const [noteOpen, setNoteOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [analysisNote, setAnalysisNote] = useState<{ noteId: string; careCaseId: string } | null>(null);
  const [aiStreaming, setAiStreaming] = useState(false);

  const { data: careCase, isLoading: careCaseLoading } = useQuery({
    queryKey: ["care-case", id],
    queryFn: () => api.careCases.get(id),
    enabled: !!accessToken,
    retry: 1,
  });

  const { data: dashboard } = usePatientDashboard(id);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const handleAiSummarize = useCallback(() => {
    if (!accessToken) return;
    setAiStreaming(true);
    const es = new EventSource(
      `${API_URL}/intelligence/summarize-stream/${id}?token=${encodeURIComponent(accessToken)}`
    );
    es.onmessage = (e) => {
      if (e.data === "[DONE]") {
        es.close();
        setAiStreaming(false);
        qc.invalidateQueries({ queryKey: ["care-case", id] });
        qc.invalidateQueries({ queryKey: ["notes", id] });
        qc.invalidateQueries({ queryKey: ["timeline", id] });
        toast.success("Synthèse clinique générée");
      }
    };
    es.onerror = () => {
      es.close();
      setAiStreaming(false);
      toast.error("Erreur lors de la génération");
    };
  }, [accessToken, id, qc, API_URL]);

  if (!accessToken || careCaseLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-[#5B4EC4]" />
      </div>
    );
  }

  if (!careCase) {
    return (
      <div className="p-8 text-sm text-muted-foreground">Dossier introuvable.</div>
    );
  }

  const dash = dashboard ?? {
    patient: { id: "", firstName: careCase.patient.firstName, lastName: careCase.patient.lastName, age: null, sex: null },
    pathway: null,
    alerts: [],
    screenings: [],
    indicators: [],
    questionnaires: [],
    actions: { urgentTasks: [], upcomingAppointments: [], pendingReferrals: [], suggestedReferrals: [] },
    recentActivity: [],
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <PatientHeader
        dashboard={dash}
        careCase={careCase}
        careCaseId={id}
        onAddNote={() => setNoteOpen(true)}
        onReferral={() => setReferralOpen(true)}
        onTask={() => setTaskModalOpen(true)}
        onRecord={() =>
          startRecording(id, `${careCase.patient.firstName} ${careCase.patient.lastName}`)
        }
        onStartConsultation={async () => {
          try {
            await startConsultation({
              careCaseId: id,
              patientName: `${careCase.patient.firstName} ${careCase.patient.lastName}`,
            });
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Impossible de démarrer la consultation");
          }
        }}
        onAiSummarize={handleAiSummarize}
        aiStreaming={aiStreaming}
      />

      {/* Note inline */}
      {noteOpen && (
        <NoteInline
          careCaseId={id}
          api={api}
          onClose={() => setNoteOpen(false)}
          onCreated={(noteId) => setAnalysisNote({ noteId, careCaseId: id })}
        />
      )}

      {/* Note analysis banner */}
      {analysisNote && (
        <NoteAnalysisBanner
          careCaseId={analysisNote.careCaseId}
          noteId={analysisNote.noteId}
          api={api}
          onDismiss={() => setAnalysisNote(null)}
        />
      )}

      {/* Tab bar */}
      <nav className="bg-card border-b px-6 shrink-0 flex">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
              activeTab === tab.key
                ? "border-[#5B4EC4] text-[#5B4EC4]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {activeTab === "globale" && (
            <ViewGlobale dashboard={dash} careCaseId={id} careCase={careCase} />
          )}
          {activeTab === "dossier" && <ViewDossier careCaseId={id} careCase={careCase} />}
          {activeTab === "coordination" && (
            <ViewCoordination dashboard={dash} careCaseId={id} />
          )}
        </div>
      </div>

      {/* Modals */}
      <ReferralModal
        open={referralOpen}
        onClose={() => setReferralOpen(false)}
        careCaseId={id}
        patientFirstName={careCase.patient?.firstName ?? "le patient"}
        senderRoleType="PROVIDER"
      />
      {taskModalOpen && (
        <QuickTaskModal
          careCaseId={id}
          patientName={`${careCase.patient.firstName} ${careCase.patient.lastName}`}
          onClose={() => setTaskModalOpen(false)}
        />
      )}
    </div>
  );
}
