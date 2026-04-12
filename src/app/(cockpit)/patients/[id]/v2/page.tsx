"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken } from "@/lib/api";
import { useRecording } from "@/contexts/RecordingContext";
import { toast } from "sonner";
import { track } from "@/lib/track";

import { ViewGlobale } from "./components/ViewGlobale";
import { ViewDossier } from "./components/ViewDossier";
import { ViewCoordination } from "./components/ViewCoordination";
import { PatientHeader } from "./components/PatientHeader";

import { ReferralModal } from "../referral-modal";
import { QuickTaskModal } from "../QuickTaskModal";
import { QuickMessageModal } from "../QuickMessageModal";

import { usePatientDashboard } from "@/hooks/usePatientDashboard";

type ViewTab = "globale" | "dossier" | "coordination";

export default function PatientV2Page() {
  const params = useParams();
  const careCaseId = params.id as string;
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const qc = useQueryClient();

  // ── Navigation ──
  const [activeView, setActiveView] = useState<ViewTab>("globale");

  // ── Modals ──
  const [noteOpen, setNoteOpen] = useState(false);
  const [analysisNote, setAnalysisNote] = useState<{ noteId: string; careCaseId: string } | null>(null);
  const [referralOpen, setReferralOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [aiStreaming, setAiStreaming] = useState(false);

  const { startRecording } = useRecording();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // ── Données ──
  const { data: careCase, isLoading: careCaseLoading } = useQuery({
    queryKey: ["care-case", careCaseId],
    queryFn: () => api.careCases.get(careCaseId),
  });

  const { data: dashboard, isLoading: dashboardLoading, error } = usePatientDashboard(careCaseId);

  useEffect(() => {
    if (careCase) track.patientOpened({ patientId: careCase.patient.id });
  }, [careCase]);

  // ── Handlers ──
  const handleAddNote = useCallback(() => setNoteOpen(true), []);
  const handleReferral = useCallback(() => setReferralOpen(true), []);
  const handleTask = useCallback(() => setTaskModalOpen(true), []);

  const handleRecord = useCallback(() => {
    if (careCase) {
      startRecording(careCaseId, `${careCase.patient.firstName} ${careCase.patient.lastName}`);
    }
  }, [careCase, careCaseId, startRecording]);

  const handleAiSummarize = useCallback(() => {
    if (!accessToken) return;
    setAiStreaming(true);
    const es = new EventSource(
      `${API_URL}/intelligence/summarize-stream/${careCaseId}?token=${encodeURIComponent(accessToken)}`
    );
    es.onmessage = (e) => {
      if (e.data === "[DONE]") {
        es.close();
        setAiStreaming(false);
        qc.invalidateQueries({ queryKey: ["care-case", careCaseId] });
        qc.invalidateQueries({ queryKey: ["notes", careCaseId] });
        qc.invalidateQueries({ queryKey: ["timeline", careCaseId] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        toast.success("Résumé IA généré");
      }
    };
    es.onerror = () => {
      es.close();
      setAiStreaming(false);
      toast.error("Erreur lors de la génération");
    };
  }, [accessToken, careCaseId, qc, API_URL]);

  const handleNoteCreated = useCallback((noteId: string) => {
    setNoteOpen(false);
    setAnalysisNote({ noteId, careCaseId });
    qc.invalidateQueries({ queryKey: ["notes", careCaseId] });
    qc.invalidateQueries({ queryKey: ["timeline", careCaseId] });
  }, [careCaseId, qc]);

  // ── Loading ──
  if (careCaseLoading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#5B4EC4] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Chargement du dossier…</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard || !careCase) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-red-600 font-medium">
          {error instanceof Error ? error.message : "Dossier introuvable"}
        </p>
      </div>
    );
  }

  const patientName = `${careCase.patient.firstName} ${careCase.patient.lastName}`;

  const tabs: { key: ViewTab; label: string; count?: number }[] = [
    { key: "globale", label: "Vue globale" },
    { key: "dossier", label: "Dossier" },
    {
      key: "coordination",
      label: "Coordination",
      count: dashboard.actions.pendingReferrals.length + dashboard.actions.suggestedReferrals.length || undefined,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
      {/* ── Header ── */}
      <PatientHeader
        dashboard={dashboard}
        careCase={careCase}
        careCaseId={careCaseId}
        onAddNote={handleAddNote}
        onReferral={handleReferral}
        onTask={handleTask}
        onRecord={handleRecord}
        onAiSummarize={handleAiSummarize}
        aiStreaming={aiStreaming}
      />

      {/* ── Note inline ── */}
      {noteOpen && (
        <NoteInline
          careCaseId={careCaseId}
          api={api}
          onClose={() => setNoteOpen(false)}
          onCreated={handleNoteCreated}
        />
      )}

      {/* ── Bannière analyse IA post-note ── */}
      {analysisNote && (
        <NoteAnalysisBanner
          careCaseId={analysisNote.careCaseId}
          noteId={analysisNote.noteId}
          api={api}
          onDismiss={() => setAnalysisNote(null)}
        />
      )}

      {/* ── Modals ── */}
      <ReferralModal
        open={referralOpen}
        onClose={() => setReferralOpen(false)}
        careCaseId={careCaseId}
        patientFirstName={careCase.patient.firstName}
        senderRoleType="PROVIDER"
      />

      {taskModalOpen && (
        <QuickTaskModal
          careCaseId={careCaseId}
          patientName={patientName}
          onClose={() => setTaskModalOpen(false)}
        />
      )}

      {messageModalOpen && (
        <QuickMessageModal
          careCaseId={careCaseId}
          patientName={patientName}
          onClose={() => setMessageModalOpen(false)}
        />
      )}

      {/* ── Navigation 3 vues ── */}
      <div className="flex gap-1 mt-6 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveView(tab.key)}
            className={`relative px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeView === tab.key
                ? "bg-white text-[#5B4EC4] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
            {tab.count ? (
              <span className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-semibold ${
                activeView === tab.key ? "bg-[#5B4EC4] text-white" : "bg-gray-300 text-gray-700"
              }`}>
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* ── Contenu ── */}
      {activeView === "globale" && <ViewGlobale dashboard={dashboard} careCaseId={careCaseId} />}
      {activeView === "dossier" && <ViewDossier careCaseId={careCaseId} />}
      {activeView === "coordination" && <ViewCoordination dashboard={dashboard} careCaseId={careCaseId} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NoteInline — saisie rapide depuis le header
// ─────────────────────────────────────────────────────────────

function NoteInline({ careCaseId, api, onClose, onCreated }: {
  careCaseId: string;
  api: ReturnType<typeof apiWithToken>;
  onClose: () => void;
  onCreated?: (noteId: string) => void;
}) {
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!body.trim()) return;
    setSaving(true);
    try {
      const note = await api.notes.create(careCaseId, { noteType: "EVOLUTION", body });
      qc.invalidateQueries({ queryKey: ["notes", careCaseId] });
      qc.invalidateQueries({ queryKey: ["timeline", careCaseId] });
      qc.invalidateQueries({ queryKey: ["care-case", careCaseId] });
      track.noteCreated({ patientId: careCaseId, noteType: "EVOLUTION" });
      toast.success("Note ajoutée");
      onClose();
      onCreated?.(note.id);
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 mt-4">
      <p className="text-xs font-medium text-gray-500 mb-2">Nouvelle note clinique</p>
      <textarea
        placeholder="Rédiger une note…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        autoFocus
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-[#5B4EC4] focus:ring-1 focus:ring-[#5B4EC4]"
      />
      <div className="flex gap-2 mt-2">
        <button
          disabled={!body.trim() || saving}
          onClick={handleSave}
          className="text-xs px-4 py-1.5 rounded-lg bg-[#5B4EC4] text-white hover:bg-[#4A3DB3] disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button onClick={onClose} className="text-xs px-3 py-1.5 text-gray-500 hover:text-gray-700">
          Annuler
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NoteAnalysisBanner — polling analyse IA post-note
// ─────────────────────────────────────────────────────────────

function NoteAnalysisBanner({ careCaseId, noteId, api, onDismiss }: {
  careCaseId: string;
  noteId: string;
  api: ReturnType<typeof apiWithToken>;
  onDismiss: () => void;
}) {
  const { data } = useQuery({
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
      <div className="rounded-lg bg-[#F8F7FD] border border-[#EDE9FC] px-4 py-2.5 mt-3 flex items-center gap-2 text-xs text-[#5B4EC4]">
        <div className="w-3 h-3 border-2 border-[#5B4EC4] border-t-transparent rounded-full animate-spin flex-shrink-0" />
        <span>Analyse IA de la note en cours…</span>
        <button onClick={onDismiss} className="ml-auto text-[#5B4EC4]/40 hover:text-[#5B4EC4]">✕</button>
      </div>
    );
  }

  if (data.status === "ERROR") {
    return (
      <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-2.5 mt-3 flex items-center gap-2 text-xs text-gray-500">
        <span>⚠️ L'analyse IA n'a pas pu aboutir.</span>
        <button onClick={onDismiss} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
      </div>
    );
  }

  if (data.status === "DONE" && totalItems === 0) {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-2.5 mt-3 flex items-center gap-2 text-xs text-green-600">
        <span>✅ Analyse terminée — aucun élément à valider.</span>
        <button onClick={onDismiss} className="ml-auto text-green-400 hover:text-green-600">✕</button>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-[#F8F7FD] border border-[#EDE9FC] px-4 py-2.5 mt-3 flex items-center gap-2 text-xs">
      <span className="text-[#5B4EC4]">✨</span>
      <span className="text-[#5B4EC4] font-medium">
        L'IA a détecté <strong>{totalItems}</strong> élément{totalItems > 1 ? "s" : ""} à valider
      </span>
      <span className="text-gray-400">— brouillon, validation humaine requise</span>
      <button onClick={onDismiss} className="ml-auto text-[#5B4EC4]/40 hover:text-[#5B4EC4]">✕</button>
    </div>
  );
}
